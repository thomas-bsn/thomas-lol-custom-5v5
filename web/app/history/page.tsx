"use client";

import { useEffect, useState } from "react";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

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

type TeamEntry = {
  prenom: string;
  riotId: string;
  rankTier?: string | null;
  rankDivision?: number | null;
  cost?: number | null;
};

type Game = {
  id: number;
  playedAt: string;
  winner: "blue" | "red";
  blueTeam: TeamEntry[];
  redTeam: TeamEntry[];
};

type Series = {
  seriesId: number;
  format: number;
  playedAt: string;
  games: Game[];
};

function RankBadge({ tier, division }: { tier?: string | null; division?: number | null }) {
  const t = (tier ?? "UNRANKED").toUpperCase();
  const colors = TIER_COLORS[t] ?? { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.25)", border: "rgba(255,255,255,0.1)" };
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(t);
  const label = t === "UNRANKED"
    ? "Unranked"
    : isMasterPlus
      ? t.charAt(0) + t.slice(1).toLowerCase()
      : division
        ? `${t.charAt(0) + t.slice(1).toLowerCase()} ${division}`
        : t.charAt(0) + t.slice(1).toLowerCase();

  return (
    <span style={{
      background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
      borderRadius: "5px", padding: "1px 7px",
      fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

function teamMMR(players: TeamEntry[]) {
  return players.reduce((sum, p) => sum + (p.cost ?? 0), 0);
}

function seriesScore(games: Game[]): { blue: number; red: number } {
  return games.reduce(
    (acc, g) => {
      if (g.winner === "blue") acc.blue++;
      else acc.red++;
      return acc;
    },
    { blue: 0, red: 0 }
  );
}

export default function HistoryPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/game/history/${year}/${month}`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => setSeries(data.games ?? []))
      .catch(() => setError("Impossible de charger l'historique."))
      .finally(() => setLoading(false));
  }, [year, month]);

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];
  const totalGames = series.reduce((sum, s) => sum + s.games.length, 0);

  return (
    <main style={{ padding: "0 24px 60px", width: "100%", maxWidth: "900px" }}>

      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 4px" }}>Historique</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", margin: 0 }}>
          Retrouve toutes les games jouées par mois
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "28px" }}>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={selectStyle}>
          {MONTHS.map((label, i) => (
            <option key={i + 1} value={i + 1} style={{ background: "#111" }}>{label}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={selectStyle}>
          {years.map((y) => (
            <option key={y} value={y} style={{ background: "#111" }}>{y}</option>
          ))}
        </select>
        {!loading && !error && (
          <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
            {series.length} série{series.length !== 1 ? "s" : ""} · {totalGames} game{totalGames !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading && <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", padding: "40px 0", textAlign: "center" }}>Chargement…</div>}
      {error && <div style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.07)", color: "#FF5050", fontSize: "13px" }}>{error}</div>}
      {!loading && !error && series.length === 0 && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>Aucune game ce mois-ci.</div>
      )}

      {!loading && !error && series.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {series.map((s) => <SeriesCard key={s.seriesId} series={s} />)}
        </div>
      )}
    </main>
  );
}

function SeriesCard({ series }: { series: Series }) {
  const [open, setOpen] = useState(false);
  const score = seriesScore(series.games);
  const date = new Date(series.playedAt);
  const dateLabel = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const isBO1 = series.format === 1;
  const blueWins = score.blue > score.red;
  const redWins = score.red > score.blue;

  return (
    <div style={{
      background: "rgba(0,0,0,0.3)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "14px",
      overflow: "hidden",
    }}>
      {/* Series header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", cursor: "pointer",
          borderBottom: open ? "1px solid rgba(255,255,255,0.05)" : "none",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Format badge */}
          <span style={{
            fontSize: "11px", fontWeight: 800,
            padding: "3px 10px", borderRadius: "6px",
            background: "rgba(124,92,255,0.15)",
            border: "1px solid rgba(124,92,255,0.3)",
            color: "rgba(180,140,255,0.9)",
            letterSpacing: "0.04em",
          }}>
            BO{series.format}
          </span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>{dateLabel}</span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px" }}>
            {series.games.length} game{series.games.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Score */}
          {!isBO1 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                fontSize: "14px", fontWeight: 800,
                color: blueWins ? "#50B4FF" : "rgba(255,255,255,0.3)",
              }}>{score.blue}</span>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>—</span>
              <span style={{
                fontSize: "14px", fontWeight: 800,
                color: redWins ? "#FF5050" : "rgba(255,255,255,0.3)",
              }}>{score.red}</span>
            </div>
          )}
          {isBO1 && series.games[0] && (
            <WinnerBadge winner={series.games[0].winner} />
          )}
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
            {open ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Games list */}
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.03)" }}>
          {series.games.map((game, i) => (
            <GameCard key={game.id} game={game} index={i + 1} showIndex={!isBO1} />
          ))}
        </div>
      )}
    </div>
  );
}

function GameCard({ game, index, showIndex }: { game: Game; index: number; showIndex: boolean }) {
  const date = new Date(game.playedAt);
  const dateLabel = date.toLocaleDateString("fr-FR", {
    weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

  const blueMMR = teamMMR(game.blueTeam);
  const redMMR  = teamMMR(game.redTeam);
  const diff    = Math.abs(blueMMR - redMMR);
  const diffColor = diff <= 5 ? "#50DC8C" : diff <= 15 ? "#FFB932" : "#FF5050";

  return (
    <div style={{ background: "rgba(0,0,0,0.2)" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {showIndex && (
            <span style={{
              fontSize: "10px", fontWeight: 700,
              color: "rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.05)",
              padding: "1px 7px", borderRadius: "4px",
            }}>
              Game {index}
            </span>
          )}
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>#{game.id}</span>
          <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{dateLabel}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontSize: "10px", color: diffColor,
            background: `${diffColor}15`, border: `1px solid ${diffColor}40`,
            borderRadius: "4px", padding: "1px 7px", fontWeight: 600,
          }}>
            Δ {diff} pts
          </span>
          <WinnerBadge winner={game.winner} />
        </div>
      </div>

      {/* Teams */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <TeamColumn label="Blue" players={game.blueTeam} accent="80,180,255" won={game.winner === "blue"} mmr={blueMMR} />
        <TeamColumn label="Red"  players={game.redTeam}  accent="255,80,80"  won={game.winner === "red"}  mmr={redMMR} bordered />
      </div>
    </div>
  );
}

function WinnerBadge({ winner }: { winner: "blue" | "red" }) {
  const isBlue = winner === "blue";
  return (
    <span style={{
      fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px",
      background: isBlue ? "rgba(80,180,255,0.15)" : "rgba(255,80,80,0.12)",
      border: `1px solid ${isBlue ? "rgba(80,180,255,0.4)" : "rgba(255,80,80,0.4)"}`,
      color: isBlue ? "#50B4FF" : "#FF5050",
    }}>
      {isBlue ? "Blue" : "Red"} a gagné
    </span>
  );
}

function TeamColumn({ label, players, accent, won, mmr, bordered }: {
  label: string; players: TeamEntry[]; accent: string;
  won: boolean; mmr: number; bordered?: boolean;
}) {
  return (
    <div style={{
      padding: "10px 14px",
      borderLeft: bordered ? "1px solid rgba(255,255,255,0.04)" : undefined,
      background: won ? `rgba(${accent}, 0.03)` : undefined,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: `rgb(${accent})`, letterSpacing: "0.05em" }}>
          {label}
        </span>
        {won && (
          <span style={{
            fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px",
            background: `rgba(${accent}, 0.15)`, border: `1px solid rgba(${accent}, 0.3)`,
            color: `rgb(${accent})`,
          }}>
            WINNER
          </span>
        )}
        <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
          {mmr} pts
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {players.map((p) => (
          <div key={p.riotId} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "4px 7px", borderRadius: "5px",
            background: "rgba(255,255,255,0.03)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <img
                src={`/rank_icons/${(p.rankTier ?? "unranked").toLowerCase()}.svg`}
                style={{ width: "14px", height: "14px", flexShrink: 0 }}
              />
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", fontWeight: 500 }}>
                {p.prenom}
              </span>
            </div>
            <RankBadge tier={p.rankTier} division={p.rankDivision} />
          </div>
        ))}
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.4)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "white",
  fontSize: "13px",
  padding: "8px 14px",
  cursor: "pointer",
  outline: "none",
};