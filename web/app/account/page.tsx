"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DiscordUser = {
  username: string;
  avatar: string;
};

type LinkedPlayer = {
  id: number;
  prenom: string;
  riotId: string;
  rankTier: string;
  rankDivision: number | null;
  lp: number | null;
};

type Player = {
  id: number;
  prenom: string;
  riotId: string;
  rankTier: string;
  rankDivision: number | null;
  lp: number | null;
};

const TIER_COLORS: Record<string, string> = {
  CHALLENGER: "#FFD700", GRANDMASTER: "#FF5050", MASTER: "#B450FF",
  DIAMOND: "#50B4FF", EMERALD: "#50DC8C", PLATINUM: "#50C8B4",
  GOLD: "#FFB932", SILVER: "#B4BED2", BRONZE: "#B46E3C", IRON: "#78787A",
};

function getRankLabel(rankTier: string, rankDivision: number | null, lp: number | null) {
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(rankTier);
  const tierLabel = rankTier.charAt(0) + rankTier.slice(1).toLowerCase();
  if (isMasterPlus) return `${tierLabel} — ${lp ?? 0} LP`;
  return `${tierLabel} ${rankDivision ?? ""} — ${lp ?? 0} LP`;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [linkedPlayer, setLinkedPlayer] = useState<LinkedPlayer | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [linking, setLinking] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const username = localStorage.getItem("discord_username");
    const avatar = localStorage.getItem("discord_avatar");
    const jwt = localStorage.getItem("jwt");

    if (!jwt || !username) {
      router.replace("/");
      return;
    }

    setUser({ username, avatar: avatar ?? "" });

    // Récupère le player lié
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/players/me`, {
      headers: { Authorization: `Bearer ${jwt}` }
      })
        .then(r => {
          if (r.status === 401) {
            logout(); // JWT expiré → déconnexion auto
            return null;
          }
          return r.ok ? r.json() : null;
        })
        .then(data => { if (data) setLinkedPlayer(data); })
        .catch(() => {});

    // Récupère tous les players pour le sélecteur
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/players`)
      .then(r => r.json())
      .then(setPlayers)
      .catch(() => {});
  }, []);

  async function linkPlayer() {
    if (!selectedPlayerId) return;
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    setLinking(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/players/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ playerId: selectedPlayerId }),
      });

      if (!res.ok) throw new Error();

      const player = players.find(p => p.id === selectedPlayerId);
      if (player) setLinkedPlayer(player);
      setShowPicker(false);
      setSuccess("Compte lié avec succès !");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Impossible de lier le compte, réessaie.");
    } finally {
      setLinking(false);
    }
  }

  function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("discord_username");
    localStorage.removeItem("discord_avatar");
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  }

  if (!user) return <main style={{ padding: "24px", color: "white" }}>Chargement…</main>;

  const tierColor = linkedPlayer ? TIER_COLORS[linkedPlayer.rankTier] ?? "rgba(255,255,255,0.4)" : null;

  return (
    <main style={{ padding: "0 48px 40px", width: "100%" }}>

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Mon compte</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: "4px" }}>
          Gère ton profil et ta liaison avec ton compte LoL
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "800px" }}>

        {/* Discord */}
        <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(88,101,242,0.2)", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(88,101,242,0.06)" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>DISCORD</span>
          </div>
          <div style={{ padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
            <img src={user.avatar} style={{ width: "52px", height: "52px", borderRadius: "50%", border: "2px solid rgba(88,101,242,0.4)" }} />
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "16px" }}>{user.username}</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginTop: "2px" }}>Connecté via Discord</div>
            </div>
          </div>
        </div>

        {/* LoL */}
        <div style={{ background: "rgba(0,0,0,0.3)", border: linkedPlayer ? `1px solid ${tierColor}33` : "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: linkedPlayer ? `${tierColor}10` : "transparent" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>COMPTE LOL</span>
            {linkedPlayer && (
              <button
                onClick={() => setShowPicker(true)}
                style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}
              >
                Changer
              </button>
            )}
          </div>
          <div style={{ padding: "18px" }}>
            {linkedPlayer ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src={`/rank_icons/${linkedPlayer.rankTier.toLowerCase()}.svg`} style={{ width: "40px", height: "40px" }} />
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>{linkedPlayer.prenom}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "2px" }}>{linkedPlayer.riotId}</div>
                  <div style={{ color: tierColor ?? "white", fontSize: "12px", fontWeight: 600, marginTop: "4px" }}>
                    {getRankLabel(linkedPlayer.rankTier, linkedPlayer.rankDivision, linkedPlayer.lp)}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", marginBottom: "12px" }}>
                  Aucun compte LoL lié
                </div>
                <button
                  onClick={() => setShowPicker(true)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "white", fontSize: "13px", cursor: "pointer" }}
                >
                  Lier mon compte
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Feedback */}
      {success && (
        <div style={{ marginTop: "14px", padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(80,220,140,0.25)", background: "rgba(80,220,140,0.07)", color: "#50DC8C", fontSize: "13px", maxWidth: "800px" }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{ marginTop: "14px", padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.07)", color: "#FF5050", fontSize: "13px", maxWidth: "800px" }}>
          {error}
        </div>
      )}

      {/* Déconnexion */}
      <div style={{ marginTop: "24px", maxWidth: "800px" }}>
        <button
          onClick={logout}
          style={{ padding: "9px 18px", borderRadius: "8px", border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)", color: "rgba(255,80,80,0.8)", fontSize: "13px", cursor: "pointer" }}
        >
          Se déconnecter
        </button>
      </div>

      {/* Modal picker */}
      {showPicker && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", zIndex: 50 }}>
          <div style={{ background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "24px", width: "380px" }}>
            <h2 style={{ color: "white", fontWeight: 700, fontSize: "15px", margin: "0 0 16px" }}>
              Choisir mon compte LoL
            </h2>
            <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
              {players.map(p => {
                const color = TIER_COLORS[p.rankTier] ?? "rgba(255,255,255,0.3)";
                const selected = selectedPlayerId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 12px", borderRadius: "8px", textAlign: "left",
                      border: selected ? "1px solid rgba(124,92,255,0.5)" : "1px solid rgba(255,255,255,0.06)",
                      background: selected ? "rgba(124,92,255,0.12)" : "rgba(255,255,255,0.03)",
                      cursor: "pointer",
                    }}
                  >
                    <img src={`/rank_icons/${p.rankTier.toLowerCase()}.svg`} style={{ width: "22px", height: "22px", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "white", fontWeight: 600, fontSize: "13px" }}>{p.prenom}</div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{p.riotId}</div>
                    </div>
                    <span style={{ color, fontSize: "11px", fontWeight: 600 }}>
                      {getRankLabel(p.rankTier, p.rankDivision, p.lp)}
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowPicker(false); setSelectedPlayerId(null); }}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: "13px", cursor: "pointer" }}
              >
                Annuler
              </button>
              <button
                onClick={linkPlayer}
                disabled={!selectedPlayerId || linking}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: selectedPlayerId ? "white" : "rgba(255,255,255,0.06)", color: selectedPlayerId ? "black" : "rgba(255,255,255,0.2)", fontWeight: 700, fontSize: "13px", cursor: selectedPlayerId ? "pointer" : "default" }}
              >
                {linking ? "Liaison…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}