"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import { createDraftSession, createRouletteSession, Player } from "@/lib/appState";
import { teamScore, diffLabel } from "@/lib/draft/draftUtils";
import { launchGame } from "@/lib/game/launchGame";


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
  const color = getTierColor(player.rank);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "9px 12px", borderRadius: "8px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <img src={`/rank_icons/${player.rank.split(" ")[0].toLowerCase()}.svg`} style={{ width: "20px", height: "20px", flexShrink: 0 }} />
      <span style={{ color: "white", fontWeight: 600, fontSize: "14px", flex: 1 }}>{player.prenom}</span>
      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>{player.rank}</span>
      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>{player.mmr}</span>
    </div>
  );
}

function ButtonLoadingDots({ color = "rgba(255,255,255,0.8)" }: { color?: string }) {
  return (
    <>
      <style>{`
        @keyframes teamsButtonDotsPulse {
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
              animation: `teamsButtonDotsPulse 0.9s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}

export default function TeamsPage() {
  const router = useRouter();
  const { state, update, hydrated } = useAppState();
  const [launchingDirect, setLaunchingDirect] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!state?.players || state.players.length !== 10) { router.replace("/picker"); return; }
    if (!state.result) { router.replace("/mode"); return; }
  }, [hydrated, state, router]);

  if (!hydrated) return <main style={{ padding: "24px", color: "white" }}>Chargement…</main>;
  if (!state?.result) return <main style={{ padding: "24px", color: "white" }}>Redirection…</main>;

  const { team1, team2 } = state.result;
  const score1 = teamScore(team1);
  const score2 = teamScore(team2);
  const diff = Math.abs(score1 - score2);
  const diffInfo = diffLabel(diff);
  const stronger = score1 > score2 ? 1 : score2 > score1 ? 2 : 0;

  function goToSides() {
    if (!state?.result) return;
    // set default avant d'aller sur /sides
    update({ ...state, game: { status: "wip", teams: { blue: state.result.team1, red: state.result.team2 } } });
    router.push("/sides");
  }

  async function launchDirect() {
    if (!state?.result || launchingDirect) return;

    try {
      setLaunchingDirect(true);
      await launchGame(
        state,
        { blue: state.result.team1, red: state.result.team2 },
        update,
        router
      );
    } finally {
      setLaunchingDirect(false);
    }
  }

  function backAndReset() {
    if (!state) return;
    if (state.mode === "draft") {
      update({ ...state, session: createDraftSession(state.players), result: undefined });
      router.push("/draft");
    } else {
      update({ ...state, session: createRouletteSession(state.players), result: undefined });
      router.push("/roulette");
    }
  }

  return (
    <main style={{ padding: "0 48px 40px", width: "100%" }}>

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Équipes</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: "4px" }}>Résultat de la draft</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {([
          { team: team1 as Player[], score: score1, label: "Team A", side: "Blue side", accent: "80,180,255", num: 1 },
          { team: team2 as Player[], score: score2, label: "Team B", side: "Red side", accent: "255,80,80", num: 2 },
        ]).map(({ team, score, label, side, accent, num }) => (
          <div key={label} style={{
            background: "rgba(0,0,0,0.3)",
            border: stronger === num ? `1px solid rgba(${accent}, 0.4)` : "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px", overflow: "hidden",
          }}>
            <div style={{
              padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: stronger === num ? `rgba(${accent}, 0.05)` : "transparent",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>{label}</span>
                <span style={{ color: `rgb(${accent})`, fontSize: "11px", fontWeight: 600 }}>{side}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {stronger === num && (
                  <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: `rgba(${accent}, 0.8)`, color: "white" }}>FAVORI</span>
                )}
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>{score} MMR</span>
              </div>
            </div>
            <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "5px" }}>
              {team.map(p => <PlayerRow key={p.prenom} player={p} />)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
        <span style={{
          fontSize: "13px", padding: "6px 18px", borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)",
          color: "rgba(255,255,255,0.5)",
        }}>
          {diffInfo.text} · différence de <strong style={{ color: diff < 100 ? "#50DC8C" : diff < 300 ? "#FFB932" : "#FF5050" }}>{diff}</strong>
        </span>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button onClick={goToSides} style={{
          padding: "11px 24px", borderRadius: "9px", border: "none",
          background: "white", color: "black", fontWeight: 700, fontSize: "14px", cursor: "pointer",
        }}>
          Choisir les sides →
        </button>
        <button
          onClick={launchDirect}
          disabled={launchingDirect}
          style={{
            padding: "11px 20px", borderRadius: "9px",
            border: "1px solid rgba(255,255,255,0.3)", background: "transparent",
            color: "white", fontWeight: 700, fontSize: "14px",
            cursor: launchingDirect ? "default" : "pointer",
            opacity: launchingDirect ? 0.7 : 1,
            minWidth: "160px", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {launchingDirect ? <ButtonLoadingDots color="white" /> : "Lancer sans choisir les sides"}
        </button>
        <button onClick={backAndReset} style={{ padding: "11px 20px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: "rgba(255,255,255,0.25)", fontSize: "14px", cursor: "pointer" }}>
          Retour
        </button>
      </div>

    </main>
  );
}