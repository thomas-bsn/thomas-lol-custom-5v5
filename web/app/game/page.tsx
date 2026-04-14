"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import type { Player } from "@/lib/appState";

const TIER_COLORS: Record<string, { text: string; border: string }> = {
  CHALLENGER:  { text: "#FFD700", border: "rgba(255,215,0,0.4)" },
  GRANDMASTER: { text: "#FF5050", border: "rgba(255,80,80,0.4)" },
  MASTER:      { text: "#B450FF", border: "rgba(180,80,255,0.4)" },
  DIAMOND:     { text: "#50B4FF", border: "rgba(80,180,255,0.4)" },
  EMERALD:     { text: "#50DC8C", border: "rgba(80,220,140,0.4)" },
  PLATINUM:    { text: "#50C8B4", border: "rgba(80,200,180,0.4)" },
  GOLD:        { text: "#FFB932", border: "rgba(255,185,50,0.4)" },
  SILVER:      { text: "#B4BED2", border: "rgba(180,190,210,0.4)" },
  BRONZE:      { text: "#B46E3C", border: "rgba(180,110,60,0.4)" },
  IRON:        { text: "#78787A", border: "rgba(120,120,130,0.4)" },
};

type SeriesStatus = {
  seriesId: number;
  format: number;
  blueWins: number;
  redWins: number;
  lastGame: {
    id: number;
    winner: string | null;
    blueTeam: { prenom: string; riotId: string; rankTier?: string | null; rankDivision?: number | null }[];
    redTeam:  { prenom: string; riotId: string; rankTier?: string | null; rankDivision?: number | null }[];
  } | null;
};

function RankBadge({ tier, division }: { tier?: string | null; division?: number | null }) {
  const t = (tier ?? "UNRANKED").toUpperCase();
  const colors = TIER_COLORS[t] ?? {
    text: "rgba(255,255,255,0.25)",
    border: "rgba(255,255,255,0.1)",
  };

  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(t);
  const label =
    t === "UNRANKED"
      ? "Unranked"
      : isMasterPlus
        ? t.charAt(0) + t.slice(1).toLowerCase()
        : division
          ? `${t.charAt(0) + t.slice(1).toLowerCase()} ${division}`
          : t.charAt(0) + t.slice(1).toLowerCase();

  return (
    <span
      style={{
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: "5px",
        padding: "1px 7px",
        fontSize: "10px",
        fontWeight: 600,
        whiteSpace: "nowrap",
        background: `${colors.text}15`,
      }}
    >
      {label}
    </span>
  );
}

function PlayerRow({ player }: { player: Player }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 10px",
        borderRadius: "7px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <img
        src={`/rank_icons/${player.rank.split(" ")[0].toLowerCase()}.svg`}
        style={{ width: "18px", height: "18px", flexShrink: 0 }}
      />
      <span style={{ color: "white", fontWeight: 600, fontSize: "13px", flex: 1 }}>
        {player.prenom}
      </span>
      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{player.rank}</span>
    </div>
  );
}

export default function GamePage() {
  const router = useRouter();
  const { state, hydrated } = useAppState();
  const [seriesStatus, setSeriesStatus] = useState<SeriesStatus | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!state?.game?.code) {
      router.replace("/picker");
      return;
    }
    if (state.seriesId) fetchSeriesStatus(state.seriesId);
  }, [hydrated, state?.seriesId]);

  async function fetchSeriesStatus(seriesId: number) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/series/${seriesId}`);
      if (res.ok) setSeriesStatus(await res.json());
    } catch {}
  }

  if (!hydrated) {
    return <main style={{ padding: "24px", color: "white" }}>Chargement…</main>;
  }

  if (!state?.game?.code) {
    return <main style={{ padding: "24px", color: "white" }}>Redirection…</main>;
  }

  const blueTeam = state.game.teams?.blue ?? state.result?.team1 ?? [];
  const redTeam = state.game.teams?.red ?? state.result?.team2 ?? [];

  const isBo = state.seriesId && seriesStatus;
  const gameNumber = isBo ? seriesStatus!.blueWins + seriesStatus!.redWins + 1 : null;

  return (
    <main style={{ padding: "0 32px 40px", width: "100%", maxWidth: "800px" }}>
      <div
        style={{
          marginBottom: "28px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 4px" }}>
            {isBo ? `BO${seriesStatus!.format} — Game ${gameNumber}` : "Match en cours"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", margin: 0 }}>
            Les équipes qui s&apos;affrontent
          </p>
        </div>

        {isBo && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "12px 20px",
            }}
          >
            <span
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color:
                  seriesStatus!.blueWins > seriesStatus!.redWins
                    ? "#50B4FF"
                    : "rgba(255,255,255,0.3)",
              }}
            >
              {seriesStatus!.blueWins}
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>—</span>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color:
                  seriesStatus!.redWins > seriesStatus!.blueWins
                    ? "#FF5050"
                    : "rgba(255,255,255,0.3)",
              }}
            >
              {seriesStatus!.redWins}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
        {[
          { team: blueTeam, label: "Blue side", accent: "80,180,255" },
          { team: redTeam, label: "Red side", accent: "255,80,80" },
        ].map(({ team, label, accent }) => (
          <div
            key={label}
            style={{
              background: "rgba(0,0,0,0.3)",
              border: `1px solid rgba(${accent},0.15)`,
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: `rgba(${accent},0.05)`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: `rgb(${accent})`, fontWeight: 700, fontSize: "13px" }}>
                {label}
              </span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>
                {team.reduce((s, p) => s + p.mmr, 0)} MMR
              </span>
            </div>

            <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {team.map((p, i) => (
                <PlayerRow key={i} player={p} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/sessions")}
        style={{
          width: "100%",
          padding: "16px 18px",
          borderRadius: "14px",
          border: "1px solid rgba(124,92,255,0.22)",
          background: "rgba(124,92,255,0.08)",
          color: "rgba(220,210,255,0.92)",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
          Match lancé
        </div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
          Suivez en cours votre match dans Sessions →
        </div>
      </button>
    </main>
  );
}