"use client";

import { useState } from "react";
import type { PendingGame } from "@/lib/types/game";

type Props = {
  game: PendingGame;
  onClose: () => void;
  onWinner: (gameId: number, winner: string) => Promise<void>;
};

export default function GameResultModal({ game, onClose, onWinner }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleWinner(winner: string) {
    setLoading(true);
    setSuccess(winner); // immédiat, pas besoin d'attendre le fetch
    setTimeout(() => onClose(), 2500);
    await onWinner(game.id, winner); // fetch en arrière-plan
    setLoading(false);
    }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px", padding: "24px", width: "340px",
        transition: "all 0.3s",
      }}>

        {success ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "12px", padding: "16px 0",
            animation: "fadeInUp 0.3s ease forwards",
          }}>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes popIn {
                    0%   { transform: scale(0.5); opacity: 0; }
                    70%  { transform: scale(1.15); }
                    100% { transform: scale(1); opacity: 1; }
                }
                `}</style>
            <div style={{
              fontSize: "40px",
              animation: "popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
            }}>
              🏆
            </div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>
              Résultat enregistré !
            </div>
            <div style={{
              fontSize: "13px", fontWeight: 700, padding: "4px 14px", borderRadius: "6px",
              background: success === "blue" ? "rgba(80,180,255,0.15)" : "rgba(255,80,80,0.12)",
              border: `1px solid ${success === "blue" ? "rgba(80,180,255,0.4)" : "rgba(255,80,80,0.4)"}`,
              color: success === "blue" ? "#50B4FF" : "#FF5050",
            }}>
              {success === "blue" ? "Blue" : "Red"} a gagné
            </div>
          </div>
        ) : (
          <>
            <div style={{ color: "white", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>
              Game #{game.id}
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginBottom: "20px" }}>
              {new Date(game.playedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {(["blue", "red"] as const).map(team => (
                <div key={team} style={{
                  borderRadius: "10px", overflow: "hidden",
                  border: `1px solid ${team === "blue" ? "rgba(80,180,255,0.2)" : "rgba(255,80,80,0.2)"}`,
                }}>
                  <div style={{
                    padding: "7px 10px", fontSize: "11px", fontWeight: 700,
                    color: team === "blue" ? "#50B4FF" : "#FF5050",
                    background: team === "blue" ? "rgba(80,180,255,0.08)" : "rgba(255,80,80,0.08)",
                  }}>
                    {team === "blue" ? "Blue" : "Red"}
                  </div>
                  <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {game.participants.filter(p => p.team === team).map(p => (
                      <div key={p.playerId} style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
                        {p.prenom}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => handleWinner("blue")} disabled={loading} style={{
                flex: 1, padding: "11px", borderRadius: "9px", cursor: loading ? "default" : "pointer",
                background: "rgba(80,180,255,0.15)", border: "1px solid rgba(80,180,255,0.4)",
                color: "#50B4FF", fontWeight: 700, fontSize: "13px",
                opacity: loading ? 0.5 : 1,
              }}>
                Blue a gagné
              </button>
              <button onClick={() => handleWinner("red")} disabled={loading} style={{
                flex: 1, padding: "11px", borderRadius: "9px", cursor: loading ? "default" : "pointer",
                background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.4)",
                color: "#FF5050", fontWeight: 700, fontSize: "13px",
                opacity: loading ? 0.5 : 1,
              }}>
                Red a gagné
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}