"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import type { Player } from "@/lib/appState";

const TIER_COLORS: Record<string, string> = {
  CHALLENGER:  "#FFD700",
  GRANDMASTER: "#FF5050",
  MASTER:      "#B450FF",
  DIAMOND:     "#50B4FF",
  EMERALD:     "#50DC8C",
  PLATINUM:    "#50C8B4",
  GOLD:        "#FFB932",
  SILVER:      "#B4BED2",
  BRONZE:      "#B46E3C",
  IRON:        "#78787A",
};

function getTierColor(rank: string) {
  const tier = rank?.split(" ")[0]?.toUpperCase();
  return TIER_COLORS[tier] ?? "rgba(255,255,255,0.3)";
}

function PlayerRow({ player }: { player: Player }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      padding: "7px 10px", borderRadius: "7px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.05)",
    }}>
      <img src={`/rank_icons/${player.rank.split(" ")[0].toLowerCase()}.svg`} style={{ width: "18px", height: "18px", flexShrink: 0 }} />
      <span style={{ color: "white", fontWeight: 600, fontSize: "13px", flex: 1 }}>{player.prenom}</span>
      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{player.rank}</span>
    </div>
  );
}

export default function GamePage() {
  const router = useRouter();
  const { state, hydrated } = useAppState();

  useEffect(() => {
    if (!hydrated) return;
    if (!state?.game?.code) router.replace("/picker");
  }, [hydrated, state, router]);

  if (!hydrated) return <main style={{ padding: "24px", color: "white" }}>Chargement…</main>;
  if (!state?.game?.code) return <main style={{ padding: "24px", color: "white" }}>Redirection…</main>;

  const blueTeam = state.game.teams?.blue ?? state.result?.team1 ?? [];
  const redTeam  = state.game.teams?.red  ?? state.result?.team2 ?? [];

  return (
    <main style={{ padding: "0 48px 40px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Code de la partie</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: "4px" }}>
          À utiliser pour rejoindre la game personnalisée
        </p>
      </div>

      {/* Code card */}
      <div style={{
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "48px 80px",
        textAlign: "center",
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, rgba(124,92,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", marginBottom: "16px" }}>
          CODE PERSONNALISÉ
        </div>
        <div style={{
          fontSize: "4rem", fontWeight: 900, color: "white",
          letterSpacing: "0.15em", lineHeight: 1,
          textShadow: "0 0 40px rgba(255,255,255,0.15)",
        }}>
          {state.game.code}
        </div>
        <div style={{ marginTop: "16px", color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
          Partage ce code avec tous les joueurs
        </div>
      </div>

      {/* WIP notice */}
      <div style={{
        padding: "8px 16px", borderRadius: "8px",
        border: "1px solid rgba(255,185,50,0.2)", background: "rgba(255,185,50,0.06)",
        color: "#FFB932", fontSize: "12px", marginBottom: "32px",
      }}>
        ⚠️ Le code est actuellement généré de façon aléatoire (WIP)
      </div>

      {/* Teams */}
      {state.result && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", width: "100%", maxWidth: "700px", marginBottom: "32px" }}>
          {([
            { team: blueTeam, label: "Blue", accent: "80,180,255" },
            { team: redTeam,  label: "Red",  accent: "255,80,80"  },
          ]).map(({ team, label, accent }) => (
            <div key={label} style={{
              background: "rgba(0,0,0,0.3)",
              border: `1px solid rgba(${accent},0.15)`,
              borderRadius: "14px", overflow: "hidden",
            }}>
              <div style={{
                padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: `rgba(${accent},0.05)`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ color: `rgb(${accent})`, fontWeight: 700, fontSize: "13px" }}>{label} side</span>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>
                  {team.reduce((s, p) => s + p.mmr, 0)} MMR
                </span>
              </div>
              <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {team.map((p, i) => <PlayerRow key={i} player={p} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => router.push("/tuto")}
        style={{
          padding: "10px 20px", borderRadius: "9px",
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.6)", fontSize: "13px", cursor: "pointer",
        }}
      >
        Comment rejoindre un tournoi LoL ?
      </button>

    </main>
  );
}