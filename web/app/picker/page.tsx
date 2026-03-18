"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createInitialState, Player } from "@/lib/appState";
import { useAppState } from "@/lib/useAppState";
import { loadPlayers } from "@/lib/players/loadPlayers";
import { mapDBPlayer } from "@/lib/players/mapDBPlayer";
import type { DBPlayer } from "@/lib/players/types";

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CHALLENGER:  { bg: "rgba(255, 215, 0, 0.15)",  text: "#FFD700", border: "rgba(255,215,0,0.4)" },
  GRANDMASTER: { bg: "rgba(255, 80, 80, 0.15)",  text: "#FF5050", border: "rgba(255,80,80,0.4)" },
  MASTER:      { bg: "rgba(180, 80, 255, 0.15)", text: "#B450FF", border: "rgba(180,80,255,0.4)" },
  DIAMOND:     { bg: "rgba(80, 180, 255, 0.15)", text: "#50B4FF", border: "rgba(80,180,255,0.4)" },
  EMERALD:     { bg: "rgba(80, 220, 140, 0.15)", text: "#50DC8C", border: "rgba(80,220,140,0.4)" },
  PLATINUM:    { bg: "rgba(80, 200, 180, 0.15)", text: "#50C8B4", border: "rgba(80,200,180,0.4)" },
  GOLD:        { bg: "rgba(255, 185, 50, 0.15)", text: "#FFB932", border: "rgba(255,185,50,0.4)" },
  SILVER:      { bg: "rgba(180, 190, 210, 0.15)",text: "#B4BED2", border: "rgba(180,190,210,0.4)" },
  BRONZE:      { bg: "rgba(180, 110, 60, 0.15)", text: "#B46E3C", border: "rgba(180,110,60,0.4)" },
  IRON:        { bg: "rgba(120, 120, 130, 0.15)",text: "#78787A", border: "rgba(120,120,130,0.4)" },
};

function RankBadge({ tier, division }: { tier?: string; division?: number | null }) {
  const t = (tier ?? "IRON").toUpperCase();
  const colors = TIER_COLORS[t] ?? TIER_COLORS.IRON;
  const isMasterPlus = t === "MASTER" || t === "GRANDMASTER" || t === "CHALLENGER";
  const label = isMasterPlus
    ? t.charAt(0) + t.slice(1).toLowerCase()
    : division
      ? `${t.charAt(0) + t.slice(1).toLowerCase()} ${division}`
      : t.charAt(0) + t.slice(1).toLowerCase();
  return (
    <span style={{
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      borderRadius: "6px",
      padding: "2px 8px",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.03em",
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const { update, hydrated } = useAppState();

  const [players, setPlayers] = useState<DBPlayer[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DBPlayer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newPrenom, setNewPrenom] = useState("");
  const [newRiotId, setNewRiotId] = useState("");

  useEffect(() => { loadPlayers().then(setPlayers); }, []);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) =>
      `${p.prenom} ${p.riotId}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [players, search]);

  if (!hydrated) {
    return <main className="p-6 w-full"><div className="max-w-xl mx-auto">Chargement…</div></main>;
  }

  function addPlayer(player: DBPlayer) {
    if (selected.length >= 10) return;
    if (selected.some((p) => p.riotId === player.riotId)) return;
    setSelected([...selected, player]);
  }

  function removePlayer(riotId: string) {
    setSelected(selected.filter((p) => p.riotId !== riotId));
  }

  function onContinue() {
    if (selected.length !== 10) {
      setError("Il faut sélectionner exactement 10 joueurs.");
      return;
    }
    const formattedPlayers: Player[] = selected.map(mapDBPlayer);
    update(createInitialState(formattedPlayers));
    router.push("/mode");
  }

  function createPlayer(player: DBPlayer) {
    setPlayers((prev) => [...prev, player]);
  }

  async function handleCreatePlayer() {
    if (!newPrenom.trim() || !newRiotId.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom: newPrenom.trim(), riotId: newRiotId.trim() }),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const created = await res.json();
      createPlayer(created);
      setNewPrenom("");
      setNewRiotId("");
      setShowModal(false);
      setSuccess(`${created.prenom} a bien été ajouté !`);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Impossible d'ajouter le joueur. Vérifie le Riot ID.");
    } finally {
      setIsCreating(false);
    }
  }

  const progress = (selected.length / 10) * 100;

  return (
    <main style={{ padding: "0 24px 40px", width: "100%" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Sélection des joueurs</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: "4px" }}>
            Choisis 10 joueurs pour la session
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(null); setSuccess(null); }}
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          + Ajouter un joueur
        </button>
      </div>

      {/* Layout 2 colonnes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "16px", alignItems: "start" }}>

        {/* Colonne gauche — liste */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "14px",
          overflow: "hidden",
        }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <input
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "8px 14px",
                color: "white",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="Rechercher un joueur…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ maxHeight: "560px", overflowY: "auto" }}>
            {filteredPlayers.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
                <div>Aucun joueur trouvé</div>
                <button
                  onClick={() => { setNewPrenom(search); setShowModal(true); }}
                  style={{
                    marginTop: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Créer "{search}"
                </button>
              </div>
            )}

            {filteredPlayers.map((p) => {
              const isSelected = selected.some((s) => s.riotId === p.riotId);
              return (
                <div
                  key={p.riotId}
                  onClick={() => !isSelected && addPlayer(p)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    cursor: isSelected ? "default" : "pointer",
                    opacity: isSelected ? 0.35 : 1,
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>{p.prenom}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginTop: "2px" }}>{p.riotId}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <RankBadge tier={p.rankTier} division={p.rankDivision} />
                    {isSelected
                      ? <span style={{ fontSize: "12px", color: "#50DC8C" }}>✓</span>
                      : <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.2)", lineHeight: 1 }}>+</span>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne droite — sélection */}
        <div style={{ position: "sticky", top: "24px" }}>
          <div style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px",
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{ padding: "14px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>Sélection</span>
                <span style={{
                  color: selected.length === 10 ? "#50DC8C" : "rgba(255,255,255,0.35)",
                  fontSize: "13px", fontWeight: 700,
                }}>
                  {selected.length} / 10
                </span>
              </div>
              <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: selected.length === 10 ? "#50DC8C" : "rgba(124,92,255,0.8)",
                  borderRadius: "2px",
                  transition: "width 0.25s ease",
                }} />
              </div>
            </div>

            {/* Joueurs */}
            <div style={{ padding: "8px", minHeight: "180px" }}>
              {selected.length === 0 && (
                <div style={{ padding: "28px", textAlign: "center", color: "rgba(255,255,255,0.18)", fontSize: "13px" }}>
                  Clique sur un joueur pour l'ajouter
                </div>
              )}
              {selected.map((p, i) => (
                <div
                  key={p.riotId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    borderRadius: "8px",
                    marginBottom: "3px",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "rgba(255,255,255,0.18)", fontSize: "10px", width: "14px", textAlign: "right" }}>{i + 1}</span>
                    <div>
                      <div style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>{p.prenom}</div>
                      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}>{p.riotId}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <RankBadge tier={p.rankTier} division={p.rankDivision} />
                    <button
                      onClick={() => removePlayer(p.riotId)}
                      style={{
                        background: "none", border: "none",
                        color: "rgba(255,80,80,0.5)", cursor: "pointer",
                        fontSize: "16px", padding: "0 2px", lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "8px" }}>
              <button
                onClick={onContinue}
                disabled={selected.length !== 10}
                style={{
                  flex: 1, padding: "10px", borderRadius: "8px", border: "none",
                  background: selected.length === 10 ? "white" : "rgba(255,255,255,0.06)",
                  color: selected.length === 10 ? "black" : "rgba(255,255,255,0.2)",
                  fontWeight: 700, fontSize: "13px",
                  cursor: selected.length === 10 ? "pointer" : "default",
                  transition: "all 0.2s",
                }}
              >
                Continuer →
              </button>
              <button
                onClick={() => { setSelected([]); setError(null); }}
                style={{
                  padding: "10px 14px", borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent", color: "rgba(255,255,255,0.3)",
                  fontSize: "13px", cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {success && (
            <div style={{
              marginTop: "10px", padding: "10px 14px", borderRadius: "8px",
              border: "1px solid rgba(80,220,140,0.25)", background: "rgba(80,220,140,0.07)",
              color: "#50DC8C", fontSize: "13px",
            }}>
              ✓ {success}
            </div>
          )}

          {error && (
            <div style={{
              marginTop: "10px", padding: "10px 14px", borderRadius: "8px",
              border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.07)",
              color: "#FF5050", fontSize: "13px",
            }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.75)", zIndex: 50,
        }}>
          <div style={{
            background: "#0e0e0e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "24px",
            width: "340px",
          }}>
            <h2 style={{ color: "white", fontWeight: 700, fontSize: "15px", margin: "0 0 18px" }}>
              Ajouter un joueur
            </h2>
            <input
              placeholder="Prénom"
              style={{
                width: "100%", marginBottom: "10px", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)", padding: "10px 14px",
                background: "rgba(255,255,255,0.04)", color: "white", fontSize: "14px",
                outline: "none", boxSizing: "border-box",
              }}
              value={newPrenom}
              onChange={(e) => setNewPrenom(e.target.value)}
            />
            <input
              placeholder="Riot ID (ex: player#EUW)"
              style={{
                width: "100%", marginBottom: "14px", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)", padding: "10px 14px",
                background: "rgba(255,255,255,0.04)", color: "white", fontSize: "14px",
                outline: "none", boxSizing: "border-box",
              }}
              value={newRiotId}
              onChange={(e) => setNewRiotId(e.target.value)}
            />
            {error && (
              <div style={{
                marginBottom: "12px", padding: "8px 12px", borderRadius: "6px",
                border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.07)",
                color: "#FF5050", fontSize: "12px",
              }}>
                {error}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                onClick={() => { setShowModal(false); setError(null); }}
                style={{
                  padding: "8px 16px", borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                  color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "13px",
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreatePlayer}
                disabled={isCreating}
                style={{
                  padding: "8px 16px", borderRadius: "8px", border: "none",
                  background: isCreating ? "rgba(255,255,255,0.08)" : "white",
                  color: isCreating ? "rgba(255,255,255,0.3)" : "black",
                  fontWeight: 700, cursor: isCreating ? "default" : "pointer", fontSize: "13px",
                }}
              >
                {isCreating ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}