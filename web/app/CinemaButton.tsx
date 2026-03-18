"use client";
import { useState } from "react";

export default function CinemaButton() {
  const [cinema, setCinema] = useState(false);

  function toggle() {
    const next = !cinema;
    setCinema(next);
    document.body.setAttribute("data-cinema", next ? "true" : "false");
  }

  return (
    <>
      <button onClick={toggle} style={{
        position: "fixed", bottom: "70px", right: "24px", zIndex: 100,
        display: "flex", alignItems: "center", gap: "8px",
        padding: "10px 16px", borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.15)",
        background: cinema ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
        color: cinema ? "white" : "rgba(255,255,255,0.6)",
        fontSize: "12px", fontWeight: 500, cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}>
        {cinema ? "⬅ Retour" : "🎬 Cinéma"}
      </button>
    </>
  );
}