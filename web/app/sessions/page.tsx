"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";

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
  lastGame: {
    id: number;
    winner: string | null;
    blueTeam: TeamEntry[];
    redTeam: TeamEntry[];
  } | null;
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

export default function SessionsPage() {
  const router = useRouter();
  const { state, update } = useAppState();
  const [series, setSeries] = useState<SeriesStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingWinner, setSettingWinner] = useState<number | null>(null);
  const [expandedSeries, setExpandedSeries] = useState<number | null>(null);

  useEffect(() => {
    fetchActive();
  }, []);

  async function fetchActive() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/series/active`);
      const data = await res.json();
      setSeries(data.series ?? []);
    } catch {}
    setLoading(false);
  }

  async function handleWinner(gameId: number, winner: "blue" | "red", seriesId: number) {
    setSettingWinner(gameId);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}/result`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner }),
    });
    await fetchActive();
    setSettingWinner(null);
  }

  function handleNextGame(s: SeriesStatus) {
    update({ ...state!, seriesId: s.seriesId, game: undefined });
    router.push("/sides");
  }

  const boOver = (s: SeriesStatus) =>
    s.blueWins > s.format / 2 || s.redWins > s.format / 2;

  return (
    <main style={{ padding: "0 24px 60px", width: "100%", maxWidth: "860px" }}>

      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 4px" }}>Sessions</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", margin: 0 }}>
            BO en cours — marque le vainqueur ou lance la game suivante
          </p>
        </div>
        <button onClick={fetchActive} style={{
          padding: "8px 14px", borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.5)", fontSize: "12px", cursor: "pointer",
        }}>
          ↻ Rafraîchir
        </button>
      </div>

      {loading && (
        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", padding: "40px 0", textAlign: "center" }}>
          Chargement…
        </div>
      )}

      {!loading && series.length === 0 && (
        <div style={{
          padding: "60px 0", textAlign: "center",
          color: "rgba(255,255,255,0.2)", fontSize: "13px",
        }}>
          Aucun BO en cours.
        </div>
      )}

      {!loading && series.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {series.map((s) => {
            const over = boOver(s);
            const isPending = s.lastGame && !s.lastGame.winner;

            return (
                <div
                key={s.seriesId}
                onClick={() => router.push(`/sessions/${s.seriesId}`)}
                style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "14px", overflow: "hidden",
                    cursor: "pointer", transition: "border-color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                >
                {/* Top bar */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 18px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: "rgba(255,255,255,0.02)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                        fontSize: "11px", fontWeight: 800, padding: "3px 10px", borderRadius: "6px",
                        background: "rgba(124,92,255,0.15)", border: "1px solid rgba(124,92,255,0.3)",
                        color: "rgba(180,140,255,0.9)", letterSpacing: "0.04em",
                    }}>
                        BO{s.format}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>Série #{s.seriesId}</span>
                    {isPending && (
                        <span style={{
                        fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
                        background: "rgba(255,185,50,0.1)", border: "1px solid rgba(255,185,50,0.3)",
                        color: "#FFB932",
                        }}>⏳ En attente</span>
                    )}
                    {over && (
                        <span style={{
                        fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
                        background: "rgba(80,220,140,0.1)", border: "1px solid rgba(80,220,140,0.3)",
                        color: "#50DC8C",
                        }}>✓ Terminé</span>
                    )}
                    </div>

                    {/* Score */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px", fontWeight: 900, color: s.blueWins > s.redWins ? "#50B4FF" : "rgba(255,255,255,0.25)" }}>
                        {s.blueWins}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "14px" }}>—</span>
                    <span style={{ fontSize: "20px", fontWeight: 900, color: s.redWins > s.blueWins ? "#FF5050" : "rgba(255,255,255,0.25)" }}>
                        {s.redWins}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", marginLeft: "4px" }}>→</span>
                    </div>
                </div>

                {/* Teams preview */}
                {s.lastGame && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "12px 18px", gap: "12px" }}>
                    {(["blue", "red"] as const).map((team) => {
                        const players = team === "blue" ? s.lastGame!.blueTeam : s.lastGame!.redTeam;
                        const accent = team === "blue" ? "80,180,255" : "255,80,80";
                        return (
                        <div key={team}>
                            <div style={{ color: `rgb(${accent})`, fontSize: "10px", fontWeight: 700, marginBottom: "6px", letterSpacing: "0.05em" }}>
                            {team === "blue" ? "BLUE" : "RED"}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {players.map(p => (
                                <span key={p.riotId} style={{
                                fontSize: "11px", color: "rgba(255,255,255,0.6)",
                                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: "5px", padding: "2px 7px",
                                }}>
                                {p.prenom}
                                </span>
                            ))}
                            </div>
                        </div>
                        );
                    })}
                    </div>
                )}
                </div>
            );
            })}
        </div>
      )}
    </main>
  );
}