"use client";

import { useRouter } from "next/navigation";

export default function HelpTournamentButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/tuto")}
      style={{
        position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
        display: "flex", alignItems: "center", gap: "8px",
        padding: "10px 16px", borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
        color: "rgba(255,255,255,0.6)",
        fontSize: "12px", fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.8)";
        (e.currentTarget as HTMLButtonElement).style.color = "white";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.6)";
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      <span style={{ fontSize: "14px" }}>❓</span>
      Rejoindre un tournoi LoL
    </button>
  );
}