"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type TeamEntry = {
  prenom: string;
  riotId: string;
  rankTier?: string | null;
  rankDivision?: number | null;
};

type SeriesStatus = {
  seriesId: number;
  format: number;
  blueWins: number;
  redWins: number;
  teamAWins: number;      // ✨ NOUVEAU
  teamBWins: number;      // ✨ NOUVEAU
  teamAReference: string[]; // ✨ NOUVEAU
  lastGame: {
    id: number;
    winner: string | null;
    blueTeam: TeamEntry[];
    redTeam: TeamEntry[];
  } | null;
};

type DBPlayer = {
  id: number;
  prenom: string;
  riotId: string;
  rankTier?: string | null;
  rankDivision?: number | null;
};

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CHALLENGER:  { bg: "rgba(255,215,0,0.15)",   text: "#FFD700", border: "rgba(255,215,0,0.4)" },
  GRANDMASTER: { bg: "rgba(255,80,80,0.15)",   text: "#FF5050", border: "rgba(255,80,80,0.4)" },
  MASTER:      { bg: "rgba(180,80,255,0.15)",  text: "#B450FF", border: "rgba(180,80,255,0.4)" },
  DIAMOND:     { bg: "rgba(80,180,255,0.15)",  text: "#50B4FF", border: "rgba(80,180,255,0.4)" },
  EMERALD:     { bg: "rgba(80,220,140,0.15)",  text: "#50DC8C", border: "rgba(80,220,140,0.4)" },
  PLATINUM:    { bg: "rgba(80,200,180,0.15)",  text: "#50C8B4", border: "rgba(80,200,180,0.4)" },
  GOLD:        { bg: "rgba(255,185,50,0.15)",  text: "#FFB932", border: "rgba(255,185,50,0.4)" },
  SILVER:      { bg: "rgba(180,190,210,0.15)", text: "#B4BED2", border: "rgba(180,190,210,0.4)" },
  BRONZE:      { bg: "rgba(180,110,60,0.15)",  text: "#B46E3C", border: "rgba(180,110,60,0.4)" },
  IRON:        { bg: "rgba(120,120,130,0.15)", text: "#78787A", border: "rgba(120,120,130,0.4)" },
};

function RankBadge({ tier, division }: { tier?: string | null; division?: number | null }) {
  const t = (tier ?? "UNRANKED").toUpperCase();
  const colors = TIER_COLORS[t] ?? { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.25)", border: "rgba(255,255,255,0.1)" };
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(t);
  const label = t === "UNRANKED" ? "Unranked"
    : isMasterPlus ? t.charAt(0) + t.slice(1).toLowerCase()
    : division ? `${t.charAt(0) + t.slice(1).toLowerCase()} ${division}`
    : t.charAt(0) + t.slice(1).toLowerCase();
  return (
    <span style={{
      background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
      borderRadius: "5px", padding: "1px 7px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

function ButtonLoadingDots({ color }: { color: string }) {
  return (
    <>
      <style>{`
        @keyframes winnerDotsPulse {
          0%, 80%, 100% {
            opacity: 0.25;
            transform: scale(0.85);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "999px",
              background: color,
              display: "inline-block",
              animation: `winnerDotsPulse 0.9s ease-in-out ${i * 0.15}s infinite`,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        ))}
      </div>
    </>
  );
}

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = Number(params?.seriesId);

  const [series, setSeries] = useState<SeriesStatus | null>(null);
  const [allPlayers, setAllPlayers] = useState<DBPlayer[]>([]);
  const [blueTeam, setBlueTeam] = useState<TeamEntry[]>([]);
  const [redTeam, setRedTeam] = useState<TeamEntry[]>([]);
  const [initialBlueTeam, setInitialBlueTeam] = useState<TeamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingWinner, setSettingWinner] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [sidesSwapped, setSidesSwapped] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
  const [swapTarget, setSwapTarget] = useState<{ team: "blue" | "red"; riotId: string; top: number; left: number; width: number } | null>(null);
  const [lastWinnerTeam, setLastWinnerTeam] = useState<"A" | "B" | null>(null);

  useEffect(() => {
    if (seriesId) init();
  }, [seriesId]);

  async function init() {
    setLoading(true);
    try {
      const [seriesRes, playersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/series/${seriesId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/players`),
      ]);
      const seriesData: SeriesStatus = await seriesRes.json();
      const playersData: DBPlayer[] = await playersRes.json();

      setSeries(seriesData);
      setAllPlayers(playersData);

      if (seriesData.lastGame) {
        setBlueTeam(seriesData.lastGame.blueTeam);
        setRedTeam(seriesData.lastGame.redTeam);
        setInitialBlueTeam(seriesData.lastGame.blueTeam);
      }
    } catch {}
    setLoading(false);
  }

  async function handleWinner(winner: "blue" | "red") {
    if (!series?.lastGame) return;
    
    // Le backend va automatiquement incrémenter teamAWins ou teamBWins
    setSettingWinner(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/${series.lastGame.id}/result`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner }),
    });
    
    // Stocker quelle équipe a gagné côté client pour le badge WINNER
    const teamAReference = series.teamAReference ?? [];
    const currentIsTeamAOnBlue = teamAReference.length > 0
      ? teamAReference.some(riotId => blueTeam.some(p => p.riotId === riotId))
      : true;
    const winnerTeam = (winner === "blue" && currentIsTeamAOnBlue) || (winner === "red" && !currentIsTeamAOnBlue) ? "A" : "B";
    setLastWinnerTeam(winnerTeam);
    
    await init();
    setSettingWinner(false);
    setSidesSwapped(false);
  }

  function handleSwapSides() {
    setBlueTeam(redTeam);
    setRedTeam(blueTeam);
    setSidesSwapped(s => !s);
  }

  function handleSwapPlayer(team: "blue" | "red", riotId: string, newPlayer: DBPlayer) {
    const entry: TeamEntry = {
      prenom: newPlayer.prenom,
      riotId: newPlayer.riotId,
      rankTier: newPlayer.rankTier,
      rankDivision: newPlayer.rankDivision,
    };
    if (team === "blue") {
      setBlueTeam(prev => prev.map(p => p.riotId === riotId ? entry : p));
    } else {
      setRedTeam(prev => prev.map(p => p.riotId === riotId ? entry : p));
    }
    setSwapTarget(null);
  }

  async function handleLaunchNextGame() {
    if (!series) return;
    setLaunching(true);

    const blueIds = blueTeam.map(p => allPlayers.find(ap => ap.riotId === p.riotId)?.id).filter(Boolean) as number[];
    const redIds  = redTeam.map(p => allPlayers.find(ap => ap.riotId === p.riotId)?.id).filter(Boolean) as number[];
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blueTeam: blueIds,
        redTeam: redIds,
        seriesId: series.seriesId,
        boFormat: null,
      }),
    });

    const data = await res.json();
    setLaunching(false);

    // Reset le winner de la game précédente
    setLastWinnerTeam(null);
    
    // Rafraîchit la page pour afficher la nouvelle game
    await init();
    setSidesSwapped(false);
  }

  function handleAbandon() {
    setShowAbandonConfirm(true);
  }

  const usedRiotIds = [...blueTeam, ...redTeam].map(p => p.riotId);
  const availablePlayers = allPlayers.filter(p => !usedRiotIds.includes(p.riotId));

  // Déterminer quelle équipe originale (A ou B) est sur quel side
  // On utilise teamAReference du backend (RiotIds de Team A pour tout le BO)
  const teamAReference = series?.teamAReference ?? [];
  const isTeamAOnBlue = teamAReference.length > 0
    ? teamAReference.some(riotId => blueTeam.some(p => p.riotId === riotId))
    : true;

  if (loading) return (
    <main style={{ padding: "0 24px", width: "100%", maxWidth: "860px", height: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "20px" }}>
        <style>{`
        @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1); }
        }
        @keyframes bar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }
        `}</style>
        <div style={{ display: "flex", gap: "6px" }}>
        {["80,180,255", "124,92,255", "255,80,80"].map((c, i) => (
            <div key={c} style={{
            width: "10px", height: "10px", borderRadius: "50%",
            background: `rgb(${c})`,
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
        ))}
        </div>
        <div style={{ width: "200px", height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
            height: "100%", borderRadius: "2px",
            background: "linear-gradient(90deg, rgba(80,180,255,0.8), rgba(124,92,255,0.8))",
            animation: "bar 1.5s ease-in-out infinite",
        }} />
        </div>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", letterSpacing: "0.1em" }}>
        CHARGEMENT
        </span>
    
    </main>
    );
  if (!series) return <main style={{ padding: "24px", color: "rgba(255,255,255,0.4)" }}>Série introuvable.</main>;

  const isPending = !series.lastGame?.winner;
  const boOver = series.teamAWins > series.format / 2 || series.teamBWins > series.format / 2;
  const gameNumber = series.blueWins + series.redWins + (isPending ? 1 : 0);
  const lastWinner = series.lastGame?.winner;
  const hasChanges = JSON.stringify(blueTeam.map(p => p.riotId)) !== JSON.stringify(series.lastGame?.blueTeam.map(p => p.riotId))
    || JSON.stringify(redTeam.map(p => p.riotId)) !== JSON.stringify(series.lastGame?.redTeam.map(p => p.riotId));

  return (
    <main style={{
        padding: "0 24px 60px",
        width: "100%",
        maxWidth: "860px",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
    }}>

      {/* Back */}
      <button onClick={() => router.push("/sessions")} style={{
        background: "none", border: "none", color: "rgba(255,255,255,0.35)",
        fontSize: "13px", cursor: "pointer", padding: "0 0 16px", display: "flex", alignItems: "center", gap: "6px",
      }}>
        ← Sessions
      </button>

      {/* Header + Score */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 4px" }}>
            BO{series.format} — {boOver ? "Terminé" : isPending ? `Game ${gameNumber} en cours` : `Game ${gameNumber + 1}`}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", margin: 0 }}>Série #{series.seriesId}</p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "16px",
          background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "14px", padding: "14px 24px",
        }}>
          {/* Team A - couleur selon son side actuel */}
          <div style={{ textAlign: "center" }}>
            <div style={{ color: isTeamAOnBlue ? "rgba(80,180,255,0.6)" : "rgba(255,80,80,0.6)", fontSize: "10px", fontWeight: 700, marginBottom: "4px" }}>A</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: series.teamAWins > series.teamBWins ? (isTeamAOnBlue ? "#50B4FF" : "#FF5050") : "rgba(255,255,255,0.25)" }}>
              {series.teamAWins}
            </div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.15)", fontSize: "18px" }}>—</div>
          {/* Team B - couleur selon son side actuel */}
          <div style={{ textAlign: "center" }}>
            <div style={{ color: isTeamAOnBlue ? "rgba(255,80,80,0.6)" : "rgba(80,180,255,0.6)", fontSize: "10px", fontWeight: 700, marginBottom: "4px" }}>B</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: series.teamBWins > series.teamAWins ? (isTeamAOnBlue ? "#FF5050" : "#50B4FF") : "rgba(255,255,255,0.25)" }}>
              {series.teamBWins}
            </div>
          </div>
        </div>
      </div>

      {/* BO terminé */}
      {boOver && (
        <div style={{
          padding: "14px 18px", borderRadius: "12px", marginBottom: "24px",
          background: "rgba(80,220,140,0.07)", border: "1px solid rgba(80,220,140,0.2)",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <span style={{ fontSize: "22px" }}>🏆</span>
          <div style={{ color: "#50DC8C", fontWeight: 700, fontSize: "15px" }}>
            Team {series.teamAWins > series.teamBWins ? "A" : "B"} remporte le BO{series.format} ({series.teamAWins}-{series.teamBWins})
          </div>
        </div>
      )}

      {/* Teams éditable */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
        {(["blue", "red"] as const).map(team => {
          const players = team === "blue" ? blueTeam : redTeam;
          const accent = team === "blue" ? "80,180,255" : "255,80,80";
          
          // Déterminer le label en fonction de quelle équipe originale est sur ce side
          const isTeamA = (team === "blue" && isTeamAOnBlue) || (team === "red" && !isTeamAOnBlue);
          const label = isTeamA ? "Team A" : "Team B";
          const side = team === "blue" ? "Blue side" : "Red side";
          
          // Le winner badge suit l'équipe qui a gagné, pas le side
          const won = lastWinnerTeam ? (lastWinnerTeam === "A" && isTeamA) || (lastWinnerTeam === "B" && !isTeamA) : false;
          
          return (
            <div key={team} style={{
              background: won ? `rgba(${accent},0.05)` : "rgba(0,0,0,0.3)",
              border: `1px solid rgba(${accent},${won ? "0.3" : "0.15"})`,
              borderRadius: "14px", overflow: "hidden",
            }}>
              <div style={{
                padding: "10px 14px", borderBottom: `1px solid rgba(${accent},0.1)`,
                background: `rgba(${accent},0.08)`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "white", fontWeight: 700, fontSize: "13px" }}>
                      {label}
                    </span>
                    {won && (
                      <span style={{
                        fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "3px",
                        background: `rgba(${accent},0.2)`, border: `1px solid rgba(${accent},0.4)`,
                        color: `rgb(${accent})`,
                      }}>WINNER</span>
                    )}
                  </div>
                  <span style={{ color: `rgb(${accent})`, fontSize: "10px", fontWeight: 600 }}>
                    {side}
                  </span>
                </div>
              </div>
              <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "4px", overflow: "visible" }}>
                {players.map(p => (
                  <div key={p.riotId} style={{ position: "relative" }}>
                    <div
                      onClick={(e) => {
                        if (isPending) return;
                        if (swapTarget?.riotId === p.riotId) { setSwapTarget(null); return; }
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setSwapTarget({ team, riotId: p.riotId, top: rect.bottom + 4, left: rect.left, width: rect.width });
                      }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "6px 10px", borderRadius: "7px",
                        background: swapTarget?.riotId === p.riotId ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                        border: swapTarget?.riotId === p.riotId ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
                        cursor: !isPending ? "pointer" : "default",
                        transition: "all 0.12s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img src={`/rank_icons/${(p.rankTier ?? "unranked").toLowerCase()}.svg`} style={{ width: "16px", height: "16px" }} />
                        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", fontWeight: 500 }}>{p.prenom}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <RankBadge tier={p.rankTier} division={p.rankDivision} />
                        {!isPending && (
                          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>⇄</span>
                        )}
                      </div>
                    </div>

                    {/* Dropdown swap joueur */}
                    {swapTarget?.riotId === p.riotId && swapTarget?.team === team && (
                      <div style={{
                        position: "fixed",
                        top: swapTarget.top,
                        left: swapTarget.left,
                        width: swapTarget.width,
                        zIndex: 200,
                        background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "10px", overflow: "hidden",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
                        maxHeight: "220px", overflowY: "auto",
                      }}>
                        {availablePlayers.map(ap => (
                          <div
                            key={ap.riotId}
                            onClick={() => handleSwapPlayer(team, p.riotId, ap)}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "9px 12px", cursor: "pointer",
                              borderBottom: "1px solid rgba(255,255,255,0.04)",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <img src={`/rank_icons/${(ap.rankTier ?? "unranked").toLowerCase()}.svg`} style={{ width: "14px", height: "14px" }} />
                              <span style={{ color: "white", fontSize: "12px", fontWeight: 600 }}>{ap.prenom}</span>
                            </div>
                            <RankBadge tier={ap.rankTier} division={ap.rankDivision} />
                          </div>
                        ))}
                        {availablePlayers.length === 0 && (
                          <div style={{ padding: "12px", color: "rgba(255,255,255,0.3)", fontSize: "12px", textAlign: "center" }}>
                            Aucun joueur disponible
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions teams */}
      {!isPending && !boOver && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button onClick={handleSwapSides} style={{
            padding: "9px 16px", borderRadius: "8px",
            border: sidesSwapped ? "1px solid rgba(124,92,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
            background: sidesSwapped ? "rgba(124,92,255,0.12)" : "rgba(255,255,255,0.04)",
            color: sidesSwapped ? "rgba(180,140,255,0.9)" : "rgba(255,255,255,0.5)",
            fontSize: "12px", fontWeight: 600, cursor: "pointer",
          }}>
            ⇄ Swap sides {sidesSwapped ? "(inversé)" : ""}
          </button>
          {hasChanges && (
            <button onClick={() => {
              setSeries(s => s ? { ...s } : s);
              setBlueTeam(series.lastGame?.blueTeam ?? []);
              setRedTeam(series.lastGame?.redTeam ?? []);
              setInitialBlueTeam(series.lastGame?.blueTeam ?? []);
              setSidesSwapped(false);
            }} style={{
              padding: "9px 16px", borderRadius: "8px",
              border: "1px solid rgba(255,185,50,0.25)", background: "rgba(255,185,50,0.06)",
              color: "#FFB932", fontSize: "12px", cursor: "pointer",
            }}>
              ↺ Reset modifications
            </button>
          )}
        </div>
      )}

      {/* Marquer vainqueur */}
      {isPending && !boOver && (
        <div style={{
          background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "12px", padding: "16px 18px", marginBottom: "12px",
        }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "12px" }}>
            QUI A GAGNÉ CETTE GAME ?
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
                onClick={() => handleWinner("blue")}
                disabled={settingWinner}
                style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "9px",
                    cursor: settingWinner ? "default" : "pointer",
                    background: "rgba(80,180,255,0.15)",
                    border: "1px solid rgba(80,180,255,0.4)",
                    color: "#50B4FF",
                    fontWeight: 700,
                    fontSize: "14px",
                    opacity: settingWinner ? 0.7 : 1,
                }}
                >
                {settingWinner ? <ButtonLoadingDots color="#50B4FF" /> : `Team ${isTeamAOnBlue ? "A" : "B"} a gagné`}
                </button>

                <button
                onClick={() => handleWinner("red")}
                disabled={settingWinner}
                style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "9px",
                    cursor: settingWinner ? "default" : "pointer",
                    background: "rgba(255,80,80,0.12)",
                    border: "1px solid rgba(255,80,80,0.4)",
                    color: "#FF5050",
                    fontWeight: 700,
                    fontSize: "14px",
                    opacity: settingWinner ? 0.7 : 1,
                }}
                >
                {settingWinner ? <ButtonLoadingDots color="#FF5050" /> : `Team ${isTeamAOnBlue ? "B" : "A"} a gagné`}
                </button>
          </div>
        </div>
      )}

      {/* Lancer game suivante */}
      {!isPending && !boOver && (
        <button onClick={handleLaunchNextGame} disabled={launching} style={{
          width: "100%", padding: "14px", borderRadius: "10px", border: "none",
          background: launching ? "rgba(255,255,255,0.1)" : "white",
          color: launching ? "rgba(255,255,255,0.3)" : "black",
          fontWeight: 700, fontSize: "14px", cursor: launching ? "default" : "pointer",
          marginBottom: "10px",
        }}>
          {launching ? "Lancement…" : "Lancer la game suivante →"}
        </button>
      )}

      {/* Abandonner */}
      {!boOver && (
        <button onClick={handleAbandon} style={{
          width: "100%", padding: "11px", borderRadius: "9px",
          border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)",
          color: "rgba(255,80,80,0.6)", fontSize: "13px", cursor: "pointer",
        }}>
          Abandonner le BO
        </button>
      )}

      {boOver && (
        <button onClick={() => router.push("/sessions")} style={{
          width: "100%", padding: "11px", borderRadius: "9px",
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.5)", fontSize: "13px", cursor: "pointer",
        }}>
          ← Retour aux sessions
        </button>
      )}
      {showAbandonConfirm && (
        <div
          onClick={() => setShowAbandonConfirm(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "380px",
              background: "#0e0e0e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "22px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ color: "white", fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>
              Abandonner le BO ?
            </div>

            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", lineHeight: 1.5, marginBottom: "18px" }}>
              Confirmer l'abandon du BO ? Cette action est prévue pour éviter un missclick.
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowAbandonConfirm(false)}
                style={{
                  flex: 1,
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>

              <button
                onClick={async () => {
                  if (!series) return;
                  setAbandoning(true);
                  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/series/${series.seriesId}/abandon`, {
                    method: "PUT",
                  });
                  setShowAbandonConfirm(false);
                  setAbandoning(false);
                  router.push("/sessions");
                }}
                disabled={abandoning}
                style={{
                  flex: 1, padding: "11px 14px", borderRadius: "10px",
                  border: "1px solid rgba(255,80,80,0.22)", background: "rgba(255,80,80,0.08)",
                  color: "rgba(255,80,80,0.85)", fontSize: "13px", fontWeight: 700,
                  cursor: abandoning ? "default" : "pointer",
                  opacity: abandoning ? 0.7 : 1,
                }}
              >
                {abandoning ? <ButtonLoadingDots color="rgba(255,80,80,0.85)" /> : "Oui, abandonner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}