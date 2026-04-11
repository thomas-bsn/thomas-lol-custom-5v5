"use client";

import type { PendingGame } from "@/lib/types/game";


type Props = {
  games: PendingGame[];
  open: boolean;
  onToggle: () => void;
  onSelect: (game: PendingGame) => void;
};

export default function PendingGamesSection({ games, open, onToggle, onSelect }: Props) {
  if (games.length === 0) return null;

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
        background: "rgba(255,185,50,0.08)", border: "1px solid rgba(255,185,50,0.25)",
        color: "#FFB932", fontSize: "12px", fontWeight: 600,
      }}>
        <span>⏳ {games.length} en attente</span>
        <span style={{ fontSize: "9px", opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {games.map(g => (
            <div key={g.id} onClick={() => onSelect(g)} style={{
              padding: "8px 10px", borderRadius: "7px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer",
            }}>
              <div style={{ color: "white", fontSize: "12px", fontWeight: 600 }}>Game #{g.id}</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", marginTop: "2px" }}>
                {new Date(g.playedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}