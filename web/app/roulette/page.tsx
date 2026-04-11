"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import { generateTeams } from "@/lib/roulette/engine";
import { createRouletteSession } from "@/lib/appState";
import type { Player, Teams } from "@/lib/appState";

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

function interleaveTeams(result: Teams): Player[] {
  const picks: Player[] = [];
  for (let i = 0; i < 5; i++) {
    if (result.team1[i]) picks.push(result.team1[i]);
    if (result.team2[i]) picks.push(result.team2[i]);
  }
  return picks;
}

function isSamePlayer(a: Player, b: Player): boolean {
  return a.prenom === b.prenom && a.rank === b.rank && a.mmr === b.mmr;
}

function removePlayerOnce(players: Player[], target: Player): Player[] {
  const index = players.findIndex((p) => isSamePlayer(p, target));
  if (index === -1) return players;
  return [...players.slice(0, index), ...players.slice(index + 1)];
}

function PlayerRow({ player }: { player: Player }) {
  const color = getTierColor(player.rank);
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

export default function RoulettePage() {
  const router = useRouter();
  const { state, update, hydrated } = useAppState();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rollingName, setRollingName] = useState<string | null>(null);
  const rollIntervalRef = useRef<number | null>(null);
  const rollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!state || !state.players || state.players.length !== 10) { router.replace("/picker"); return; }
    if (!state.session || state.session.type !== "roulette") { router.replace("/mode"); return; }
    if (state.mode !== "roulette" && state.mode !== "balanced") { router.replace("/mode"); }
  }, [hydrated, state, router]);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) window.clearTimeout(rollTimerRef.current);
      if (rollIntervalRef.current) window.clearInterval(rollIntervalRef.current);
    };
  }, []);

  if (!hydrated) return <main style={{ padding: "24px", color: "white" }}>Chargement…</main>;
  if (!state || !state.session || state.session.type !== "roulette") return <main style={{ padding: "24px", color: "white" }}>Redirection…</main>;

  const session = state.session.data;
  const team1 = session.history.filter((_, i) => i % 2 === 0);
  const team2 = session.history.filter((_, i) => i % 2 === 1);
  const totalPicked = session.history.length;
  const finished = totalPicked === 10;

  const scoreA = team1.reduce((s, p) => s + p.mmr, 0);
  const scoreB = team2.reduce((s, p) => s + p.mmr, 0);
  const diff = Math.abs(scoreA - scoreB);
  const diffColor = diff < 200 ? "#50DC8C" : diff < 500 ? "#FFB932" : "#FF5050";

  const modeLabel = state.mode === "balanced" ? "Équilibré" : "Aléatoire";

  function spin() {
    if (isSpinning || finished || !state) return;
    const existingResult = state.result;
    const result = existingResult ?? generateTeams(state.players, state.mode === "balanced" ? "balanced" : "roulette");
    const pickOrder = interleaveTeams(result);
    const nextPlayer = pickOrder[session.history.length];
    if (!nextPlayer) { update({ ...state, result }); router.push("/teams"); return; }

    setIsSpinning(true);
    setRollingName(null);

    rollIntervalRef.current = window.setInterval(() => {
      const r = session.remaining[Math.floor(Math.random() * session.remaining.length)];
      if (r) setRollingName(r.prenom);
    }, 70);

    rollTimerRef.current = window.setTimeout(() => {
      if (rollIntervalRef.current) window.clearInterval(rollIntervalRef.current);
      const newHistory = [...session.history, nextPlayer];
      const newRemaining = removePlayerOnce(session.remaining, nextPlayer);
      update({ ...state, result, session: { type: "roulette" as const, data: { remaining: newRemaining, history: newHistory, lastPicked: nextPlayer } } });
      setRollingName(nextPlayer.prenom);
      setIsSpinning(false);
      if (newHistory.length === 10) window.setTimeout(() => router.push("/teams"), 700);
    }, 900);
  }

  function resetRoulette() {
    if (!state) return;
    update({ ...state, session: createRouletteSession(state.players), result: undefined });
    setRollingName(null);
  }

  return (
    <main style={{ padding: "0 48px 40px", width: "100%" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Roulette</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: "4px" }}>
            Mode <span style={{ color: "rgba(255,255,255,0.65)" }}>{modeLabel}</span> · {totalPicked}/10 joueurs tirés
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={resetRoulette} style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", fontSize: "13px", cursor: "pointer" }}>Reset</button>
          <button onClick={() => router.push("/mode")} style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", fontSize: "13px", cursor: "pointer" }}>← Modes</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 280px", gap: "16px", alignItems: "start" }}>

        {/* Team A */}
        <div style={{ background: "rgba(80,180,255,0.04)", border: "1px solid rgba(80,180,255,0.15)", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(80,180,255,0.04)" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>Team Blue</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{scoreA} MMR</span>
          </div>
          <div style={{ padding: "10px", minHeight: "180px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {team1.length === 0
              ? <div style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>En attente…</div>
              : team1.map((p, i) => <PlayerRow key={i} player={p} />)
            }
          </div>
        </div>

        {/* Team B */}
        <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,80,80,0.15)", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,80,80,0.04)" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>Team Red</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{scoreB} MMR</span>
          </div>
          <div style={{ padding: "10px", minHeight: "180px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {team2.length === 0
              ? <div style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>En attente…</div>
              : team2.map((p, i) => <PlayerRow key={i} player={p} />)
            }
          </div>
        </div>

        {/* Colonne droite — tirage + restants */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "sticky", top: "24px" }}>

          {/* Tirage */}
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "12px" }}>
              DERNIER TIRÉ
            </div>
            <div style={{
              fontSize: "1.8rem", fontWeight: 800, color: "white", minHeight: "48px",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.07s",
              opacity: isSpinning ? 0.7 : 1,
              transform: isSpinning ? "scale(1.08)" : "scale(1)",
              letterSpacing: "-0.02em",
            }}>
              {rollingName ?? session.lastPicked?.prenom ?? "?"}
            </div>

            <button
              onClick={spin}
              disabled={isSpinning || finished}
              style={{
                marginTop: "16px", width: "100%",
                padding: "11px", borderRadius: "9px", border: "none",
                background: finished ? "rgba(255,255,255,0.05)" : isSpinning ? "rgba(255,255,255,0.1)" : "white",
                color: finished || isSpinning ? "rgba(255,255,255,0.3)" : "black",
                fontWeight: 700, fontSize: "14px",
                cursor: finished || isSpinning ? "default" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {finished ? "✓ Terminé" : isSpinning ? "Tirage…" : "Lancer →"}
            </button>

            {/* Diff MMR */}
            <div style={{ marginTop: "12px" }}>
              <span style={{ fontSize: "11px", color: diffColor }}>
                Δ MMR {diff}
              </span>
            </div>
          </div>

          {/* Restants */}
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "14px" }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "10px" }}>
              RESTANTS ({session.remaining.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {session.remaining.length === 0
                ? <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>Plus personne</span>
                : session.remaining.map((p, i) => (
                  <span key={i} style={{
                    padding: "4px 10px", borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.6)", fontSize: "12px",
                  }}>
                    {p.prenom}
                  </span>
                ))
              }
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}