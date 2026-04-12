"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import { createRouletteSession, createDraftSession } from "@/lib/appState";

const MMR_TO_TIER: [number, string][] = [
  [800, "IRON"], [1000, "BRONZE"], [1200, "SILVER"], [1450, "GOLD"],
  [1700, "PLATINUM"], [2000, "EMERALD"], [2300, "DIAMOND"], [2600, "MASTER"],
  [2900, "GRANDMASTER"], [3200, "CHALLENGER"]
];

function getAvgTier(mmr: number): string {
  return [...MMR_TO_TIER].reverse().find(([m]) => mmr >= m)?.[1] ?? "IRON";
}

function PlayerChip({ prenom, rank }: { prenom: string; rank: string }) {
  const tier = rank?.split(" ")[0]?.toUpperCase();
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "8px", padding: "6px 10px",
    }}>
      <img src={`/rank_icons/${tier.toLowerCase()}.svg`} style={{ width: "18px", height: "18px", flexShrink: 0 }} />
      <span style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>{prenom}</span>
      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{rank}</span>
    </div>
  );
}

export default function ModePage() {
  const router = useRouter();
  const { state, update, hydrated } = useAppState();
  const [rouletteType, setRouletteType] = useState<"random" | "balanced">("random");

  useEffect(() => {
    if (!hydrated) return;
    if (!state || !state.players || state.players.length !== 10) {
      router.replace("/picker");
    }
  }, [hydrated, state, router]);

  if (!hydrated) return <main style={{ padding: "24px", color: "white" }}>Chargement…</main>;
  if (!state) return <main style={{ padding: "24px", color: "white" }}>Redirection…</main>;

  const players = state.players;
  const avgMmr = Math.round(players.reduce((s, p) => s + p.mmr, 0) / players.length);
  const avgTier = getAvgTier(avgMmr);

  return (
    <main style={{ padding: "0 24px 40px", width: "100%" }}>

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Mode de jeu</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: "4px" }}>
          Choisis comment former les équipes
        </p>
      </div>

      {/* Sélecteur BO */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "10px" }}>
          FORMAT
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {([1, 3, 5] as const).map((format) => {
            const active = (state.boFormat ?? 1) === format;
            return (
              <button
                key={format}
                onClick={() => update({ ...state, boFormat: format, seriesId: undefined })}
                style={{
                  padding: "8px 20px", borderRadius: "8px",
                  border: active ? "1px solid rgba(124,92,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  background: active ? "rgba(124,92,255,0.15)" : "rgba(255,255,255,0.04)",
                  color: active ? "white" : "rgba(255,255,255,0.4)",
                  fontSize: "13px", fontWeight: active ? 700 : 400,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                BO{format}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px", alignItems: "start" }}>

        {/* Colonne gauche — modes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* Roulette */}
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>🎰</span>
              <div style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>Roulette</div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: "0 0 16px" }}>
              Tirage automatique pour former deux équipes.
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {(["random", "balanced"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setRouletteType(type)}
                  style={{
                    padding: "7px 14px", borderRadius: "8px",
                    border: rouletteType === type ? "1px solid rgba(124,92,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
                    background: rouletteType === type ? "rgba(124,92,255,0.15)" : "rgba(255,255,255,0.04)",
                    color: rouletteType === type ? "white" : "rgba(255,255,255,0.4)",
                    fontSize: "13px", fontWeight: rouletteType === type ? 600 : 400,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {type === "random" ? "Aléatoire" : "Équilibrée (MMR)"}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                const session = createRouletteSession(players);
                update({
                  ...state,
                  boFormat: state.boFormat ?? 1,
                  mode: rouletteType === "balanced" ? "balanced" : "roulette",
                  session
                });
                router.push("/roulette");
              }}
              style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "white", color: "black", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
            >
              Commencer →
            </button>
          </div>

          {/* Draft */}
          <button
            onClick={() => {
              const session = createDraftSession(players);
              update({
                ...state,
                boFormat: state.boFormat ?? 1,
                mode: "draft",
                session
              });
              router.push("/draft");
            }}
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px", textAlign: "left", cursor: "pointer", transition: "border-color 0.15s", width: "100%" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>⚔️</span>
                <div style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>Draft</div>
              </div>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "18px" }}>→</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: "8px 0 0" }}>
              Deux capitaines, pile ou face, puis choix de joueur.
            </p>
          </button>

          {/* Retour */}
          <button
            onClick={() => router.push("/picker")}
            style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.35)", fontSize: "13px", cursor: "pointer", alignSelf: "flex-start" }}
          >
            ← Modifier la sélection
          </button>
        </div>

        {/* Colonne droite — joueurs */}
        <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden", position: "sticky", top: "24px" }}>

          {/* Header avec niveau moyen */}
          <div style={{ padding: "14px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em" }}>
              JOUEURS ({players.length})
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <img src={`/rank_icons/${avgTier.toLowerCase()}.svg`} style={{ width: "22px", height: "22px" }} />
              <div>
                <span style={{ color: "white", fontSize: "12px", fontWeight: 600 }}>
                  Niveau moyen : {avgTier.charAt(0) + avgTier.slice(1).toLowerCase()}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginLeft: "6px" }}>
                  ({avgMmr} MMR)
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {players.map((p) => (
              <PlayerChip key={p.prenom} prenom={p.prenom} rank={p.rank} />
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}