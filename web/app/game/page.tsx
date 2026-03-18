"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";

export default function GamePage() {
  const router = useRouter();
  const { state, hydrated } = useAppState();

  useEffect(() => {
    if (!hydrated) return;
    if (!state?.game?.code) router.replace("/picker");
  }, [hydrated, state, router]);

  if (!hydrated) return <main style={{ padding: "24px", color: "white" }}>Chargement…</main>;
  if (!state?.game?.code) return <main style={{ padding: "24px", color: "white" }}>Redirection…</main>;

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
        {/* Glow derrière le code */}
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
        color: "#FFB932", fontSize: "12px", marginBottom: "24px",
      }}>
        ⚠️ Le code est actuellement généré de façon aléatoire (WIP)
      </div>

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