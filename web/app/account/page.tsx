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
  peakTier: string | null;
  peakDivision: number | null;
  peakSeason: string | null;
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
  UNRANKED: "rgba(255,255,255,0.3)",
};

function getRankLabel(rankTier: string, rankDivision: number | null, lp: number | null) {
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(rankTier);
  const tierLabel = rankTier.charAt(0) + rankTier.slice(1).toLowerCase();
  if (isMasterPlus) return `${tierLabel} — ${lp ?? 0} LP`;
  return `${tierLabel} ${rankDivision ?? ""} — ${lp ?? 0} LP`;
}

const DIVISIONS_LABEL = ["I", "II", "III", "IV"];

const SELECT_STYLE: React.CSSProperties = {
  padding: "8px 12px", borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#1a1a1a", color: "white",
  fontSize: "13px", cursor: "pointer",
  outline: "none", appearance: "none",
  WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff66' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: "30px",
};

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
  const [peakTier, setPeakTier] = useState("");
  const [peakDivision, setPeakDivision] = useState("");
  const [peakSeason, setPeakSeason] = useState("");
  const [peakLp, setPeakLp] = useState("");
  const [savingPeak, setSavingPeak] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("discord_username");
    const avatar = localStorage.getItem("discord_avatar");
    const jwt = localStorage.getItem("jwt");

    if (!jwt || !username) { router.replace("/"); return; }

    setUser({ username, avatar: avatar ?? "" });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/players/me`, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
      .then(r => { if (r.status === 401) { logout(); return null; } return r.ok ? r.json() : null; })
      .then(data => {
        if (data) {
          setLinkedPlayer(data);
          if (data.peakTier) setPeakTier(data.peakTier);
          if (data.peakDivision) setPeakDivision(String(data.peakDivision));
          if (data.peakSeason) setPeakSeason(data.peakSeason);
          if (data.peakLp) setPeakLp(String(data.peakLp));
        }
      })
      .catch(() => {});

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
      if (player) setLinkedPlayer({ ...player, peakTier: null, peakDivision: null, peakSeason: null });
      setShowPicker(false);
      setPlayerSearch("");
      setSuccess("Compte lié avec succès !");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Impossible de lier le compte, réessaie.");
    } finally {
      setLinking(false);
    }
  }

  async function deletePeak() {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/players/peak`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error();
      setLinkedPlayer(prev => prev ? { ...prev, peakTier: null, peakDivision: null, peakSeason: null } : prev);
      setPeakTier(""); setPeakDivision(""); setPeakSeason(""); setPeakLp("");
      setSuccess("Peak rank supprimé !");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Impossible de supprimer, réessaie.");
    }
  }

  async function savePeak() {
    const jwt = localStorage.getItem("jwt");
    if (!jwt || !peakTier || !peakSeason) return;
    setSavingPeak(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/players/peak`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({
          peakTier,
          peakDivision: peakDivision ? parseInt(peakDivision) : null,
          peakSeason,
          peakLp: peakLp ? parseInt(peakLp) : 0,
        }),
      });
      if (!res.ok) throw new Error();
      setLinkedPlayer(prev => prev ? {
        ...prev, peakTier,
        peakDivision: peakDivision ? parseInt(peakDivision) : null,
        peakSeason
      } : prev);
      setSuccess("Peak rank sauvegardé !");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Impossible de sauvegarder, réessaie.");
    } finally {
      setSavingPeak(false);
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
  const isMasterPlus = peakTier && ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(peakTier);
  const canSavePeak = peakTier && peakSeason && (isMasterPlus || peakTier === "UNRANKED" || peakDivision);

  const filteredPlayers = players.filter(p =>
    p.prenom.toLowerCase().includes(playerSearch.toLowerCase()) ||
    p.riotId.toLowerCase().includes(playerSearch.toLowerCase())
  );

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
              <button onClick={() => setShowPicker(true)} style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}>
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
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", marginBottom: "12px" }}>Aucun compte LoL lié</div>
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

      {/* Section Peak Rank */}
      {linkedPlayer && (
        <div style={{ marginTop: "16px", maxWidth: "800px" }}>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.03)" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>
                PEAK RANK (S24 / S25)
              </span>
            </div>
            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", margin: 0 }}>
                Renseigne ton peak elo des deux dernieres saisons. Si tu ne renseignes rien, ton rank actuel sera affiché.
              </p>

              {linkedPlayer.peakTier && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <img src={`/rank_icons/${linkedPlayer.peakTier.toLowerCase()}.svg`} style={{ width: "24px", height: "24px" }} />
                  <span style={{ color: TIER_COLORS[linkedPlayer.peakTier] ?? "white", fontSize: "13px", fontWeight: 600, flex: 1 }}>
                    {linkedPlayer.peakTier.charAt(0) + linkedPlayer.peakTier.slice(1).toLowerCase()}
                    {linkedPlayer.peakDivision && !["MASTER", "GRANDMASTER", "CHALLENGER"].includes(linkedPlayer.peakTier)
                      ? ` ${DIVISIONS_LABEL[linkedPlayer.peakDivision - 1]}` : ""}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>— {linkedPlayer.peakSeason}</span>
                  <button
                    onClick={deletePeak}
                    style={{ marginLeft: "8px", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)", color: "rgba(255,80,80,0.7)", fontSize: "11px", cursor: "pointer" }}
                  >
                    Supprimer
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>

                <select value={peakSeason} onChange={e => setPeakSeason(e.target.value)} style={SELECT_STYLE}>
                  <option value="" style={{ background: "#1a1a1a" }}>Saison...</option>
                  <option value="S26" style={{ background: "#1a1a1a" }}>S26 — 2026</option>
                  <option value="S25" style={{ background: "#1a1a1a" }}>S25 — 2025</option>
                  <option value="S24" style={{ background: "#1a1a1a" }}>S24 — 2024</option>
                </select>

                <select
                  value={peakTier}
                  onChange={e => { setPeakTier(e.target.value); if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(e.target.value)) setPeakDivision(""); }}
                  style={{ ...SELECT_STYLE, color: peakTier ? (TIER_COLORS[peakTier] ?? "white") : "rgba(255,255,255,0.5)" }}
                >
                  <option value="" style={{ background: "#1a1a1a", color: "rgba(255,255,255,0.5)" }}>Tier...</option>
                  <option value="UNRANKED" style={{ background: "#1a1a1a", color: "rgba(255,255,255,0.4)" }}>Unranked</option>
                  {["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"].map(t => (
                    <option key={t} value={t} style={{ background: "#1a1a1a", color: TIER_COLORS[t] }}>
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>

                {peakTier && !isMasterPlus && (
                  <select value={peakDivision} onChange={e => setPeakDivision(e.target.value)} style={SELECT_STYLE}>
                    <option value="" style={{ background: "#1a1a1a" }}>Division...</option>
                    {["1", "2", "3", "4"].map(d => (
                      <option key={d} value={d} style={{ background: "#1a1a1a" }}>{DIVISIONS_LABEL[+d - 1]}</option>
                    ))}
                  </select>
                )}

                {peakTier && peakTier !== "UNRANKED" && (
                  <input
                    type="number"
                    min={0}
                    max={isMasterPlus ? 9999 : 99}
                    placeholder="0 LP"
                    value={peakLp}
                    onChange={e => setPeakLp(e.target.value)}
                    style={{ width: "80px", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "#1a1a1a", color: "white", fontSize: "13px", outline: "none" }}
                  />
                )}

                <button
                  onClick={savePeak}
                  disabled={!canSavePeak || savingPeak}
                  style={{
                    padding: "8px 16px", borderRadius: "8px", border: "none",
                    background: canSavePeak ? "white" : "rgba(255,255,255,0.06)",
                    color: canSavePeak ? "black" : "rgba(255,255,255,0.2)",
                    fontWeight: 700, fontSize: "13px",
                    cursor: canSavePeak ? "pointer" : "default"
                  }}
                >
                  {savingPeak ? "Sauvegarde…" : "Sauvegarder"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <h2 style={{ color: "white", fontWeight: 700, fontSize: "15px", margin: "0 0 14px" }}>Choisir mon compte LoL</h2>

            {/* Barre de recherche */}
            <input
              type="text"
              placeholder="Rechercher par nom ou Riot ID…"
              value={playerSearch}
              onChange={e => setPlayerSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", marginBottom: "10px",
                borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)",
                background: "#1a1a1a", color: "white", fontSize: "13px",
                outline: "none", boxSizing: "border-box",
              }}
            />

            <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
              {filteredPlayers.length === 0 && (
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
                  Aucun résultat
                </div>
              )}
              {filteredPlayers.map(p => {
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
                onClick={() => { setShowPicker(false); setSelectedPlayerId(null); setPlayerSearch(""); }}
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