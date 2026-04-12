"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GameTeams } from "@/lib/appState";
import { useAppState } from "@/lib/useAppState";
import { launchGame } from "@/lib/game/launchGame";


type Face = "pile" | "face";
type CoinState = "idle" | "flipping" | "done";
type Side = "blue" | "red";

function Coin({ state, result }: { state: CoinState; result: Face | null }) {
  return (
    <div style={{ perspective: "400px", width: "96px", height: "96px" }}>
      <style>{`
        @keyframes coinSpin {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(1800deg); }
        }
        .coin-inner {
          width: 96px;
          height: 96px;
          position: relative;
          transform-style: preserve-3d;
          animation: ${state === "flipping" ? "coinSpin 1.8s cubic-bezier(0.4,0,0.2,1) forwards" : "none"};
        }
        .coin-face, .coin-back {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 15px;
          letter-spacing: 0.04em;
        }
        .coin-face {
          background: ${state === "done" ? (result === "pile" ? "rgba(80,220,140,0.12)" : "rgba(255,80,80,0.1)") : "rgba(255,255,255,0.06)"};
          border: 2px solid ${state === "done" ? (result === "pile" ? "rgba(80,220,140,0.7)" : "rgba(255,80,80,0.6)") : "rgba(255,255,255,0.18)"};
          color: ${state === "done" ? (result === "pile" ? "#50DC8C" : "#FF5050") : "rgba(255,255,255,0.6)"};
        }
        .coin-back {
          background: rgba(255,200,50,0.08);
          border: 2px solid rgba(255,200,50,0.4);
          color: rgba(255,200,50,0.8);
          transform: rotateY(180deg);
        }
      `}</style>
      <div className="coin-inner">
        <div className="coin-face">
          {state === "idle" ? "?" : state === "flipping" ? "?" : (result === "pile" ? "PILE" : "FACE")}
        </div>
        <div className="coin-back">◈</div>
      </div>
    </div>
  );
}

function ButtonLoadingDots({ color = "rgba(255,255,255,0.85)" }: { color?: string }) {
  return (
    <>
      <style>{`
        @keyframes sidesButtonDotsPulse {
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
              animation: `sidesButtonDotsPulse 0.9s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}

export default function SidesPage() {
  const router = useRouter();
  const { state, update, hydrated } = useAppState();

  const [callerTeam, setCallerTeam] = useState<1 | 2 | null>(null);
  const [callerCall, setCallerCall] = useState<Face | null>(null);
  const [coinState, setCoinState] = useState<CoinState>("idle");
  const [coinResult, setCoinResult] = useState<Face | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [chosenSide, setChosenSide] = useState<Side | null>(null);
  const [launchingGame, setLaunchingGame] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!state?.players || state.players.length !== 10) { router.replace("/picker"); return; }
    if (!state.result) { router.replace("/mode"); return; }
  }, [hydrated, state, router]);

  if (!hydrated || !state?.result) return null;

  function flip() {
    if (coinState === "flipping") return;
    setCoinState("flipping");
    setCoinResult(null);
    setWon(null);
    setChosenSide(null);
    setTimeout(() => {
      const result: Face = Math.random() < 0.5 ? "pile" : "face";
      setCoinResult(result);
      setWon(result === callerCall);
      setCoinState("done");
    }, 1800);
  }

  function reset() {
    setCallerTeam(null);
    setCallerCall(null);
    setCoinState("idle");
    setCoinResult(null);
    setWon(null);
    setChosenSide(null);
  }

  async function launch(side: Side) {
    if (!state?.result || launchingGame) return;

    const teams: GameTeams =
      side === "blue"
        ? {
            blue: sideChooser === 1 ? state.result.team1 : state.result.team2,
            red: sideChooser === 1 ? state.result.team2 : state.result.team1,
          }
        : {
            red: sideChooser === 1 ? state.result.team1 : state.result.team2,
            blue: sideChooser === 1 ? state.result.team2 : state.result.team1,
          };

    try {
      setLaunchingGame(true);
      await launchGame(state, teams, update, router);
    } finally {
      setLaunchingGame(false);
    }
  }

  const tName = (n: 1 | 2) => n === 1 ? "Team Blue" : "Team Red";
  const loser = callerTeam === 1 ? 2 : 1;
  const sideChooser = won ? callerTeam! : loser as 1 | 2;

  return (
    <main style={{ padding: "0 48px 40px", width: "100%" }}>

      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Pile ou face</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: "4px" }}>
          L'équipe gagnante choisit son side
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "400px" }}>

        {/* Step 1 */}
        <div>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>
            1 · Quelle équipe lance la pièce ?
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            {([1, 2] as const).map(n => (
              <button key={n} onClick={() => { setCallerTeam(n); setCallerCall(null); setCoinState("idle"); setCoinResult(null); setWon(null); setChosenSide(null); }} style={{
                flex: 1, padding: "13px 0", borderRadius: "9px", cursor: "pointer",
                border: callerTeam === n
                  ? `1px solid ${n === 1 ? "rgba(80,180,255,0.6)" : "rgba(255,80,80,0.6)"}`
                  : "1px solid rgba(255,255,255,0.1)",
                background: callerTeam === n
                  ? n === 1 ? "rgba(80,180,255,0.1)" : "rgba(255,80,80,0.1)"
                  : "rgba(255,255,255,0.03)",
                color: callerTeam === n
                  ? n === 1 ? "#50B4FF" : "#FF5050"
                  : "rgba(255,255,255,0.4)",
                fontWeight: 700, fontSize: "14px", transition: "all 0.15s",
              }}>
                {tName(n)}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 */}
        {callerTeam !== null && (
          <div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>
              2 · {tName(callerTeam)} choisit : pile ou face ?
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["pile", "face"] as Face[]).map(f => (
                <button key={f} onClick={() => { setCallerCall(f); setCoinState("idle"); setCoinResult(null); setWon(null); setChosenSide(null); }} style={{
                  flex: 1, padding: "13px 0", borderRadius: "9px", cursor: "pointer",
                  border: callerCall === f ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  background: callerCall === f ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
                  color: callerCall === f ? "white" : "rgba(255,255,255,0.4)",
                  fontWeight: 700, fontSize: "14px", textTransform: "capitalize", transition: "all 0.15s",
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {callerCall !== null && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
              3 · On lance
            </p>

            <Coin state={coinState} result={coinResult} />

            {coinState === "idle" && (
              <button onClick={flip} style={{
                alignSelf: "flex-start",
                padding: "11px 24px", borderRadius: "9px", border: "none",
                background: "white", color: "black", fontWeight: 700, fontSize: "14px", cursor: "pointer",
              }}>
                Lancer la pièce
              </button>
            )}

            {coinState === "flipping" && (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", margin: 0 }}>En l'air…</p>
            )}

            {coinState === "done" && coinResult && won !== null && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{
                  padding: "14px 18px", borderRadius: "10px",
                  background: won ? "rgba(80,220,140,0.07)" : "rgba(255,80,80,0.07)",
                  border: `1px solid ${won ? "rgba(80,220,140,0.2)" : "rgba(255,80,80,0.2)"}`,
                }}>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", margin: "0 0 5px" }}>
                    Résultat : <strong style={{ color: "white", textTransform: "capitalize" }}>{coinResult}</strong>
                    {" "}— {tName(callerTeam!)} avait appelé <strong style={{ color: "white", textTransform: "capitalize" }}>{callerCall}</strong>
                  </p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: won ? "#50DC8C" : "#FF5050" }}>
                    {won
                      ? `${tName(callerTeam!)} a gagné — choisissez votre side !`
                      : `${tName(callerTeam!)} a perdu — c'est ${tName(loser as 1 | 2)} qui choisit le side`
                    }
                  </p>
                </div>

                {/* Side choice */}
                {!chosenSide ? (
                  <>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                      {tName(sideChooser)} choisit son side
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {(["blue", "red"] as Side[]).map(side => (
                        <button key={side} onClick={() => setChosenSide(side)} style={{
                          flex: 1, padding: "13px 0", borderRadius: "9px", cursor: "pointer",
                          border: `1px solid ${side === "blue" ? "rgba(80,180,255,0.4)" : "rgba(255,80,80,0.4)"}`,
                          background: side === "blue" ? "rgba(80,180,255,0.1)" : "rgba(255,80,80,0.1)",
                          color: side === "blue" ? "#50B4FF" : "#FF5050",
                          fontWeight: 700, fontSize: "14px", textTransform: "capitalize", transition: "all 0.15s",
                        }}>
                          {side === "blue" ? "Blue side" : "Red side"}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      padding: "12px 16px", borderRadius: "9px",
                      background: chosenSide === "blue" ? "rgba(80,180,255,0.08)" : "rgba(255,80,80,0.08)",
                      border: `1px solid ${chosenSide === "blue" ? "rgba(80,180,255,0.3)" : "rgba(255,80,80,0.3)"}`,
                    }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: chosenSide === "blue" ? "#50B4FF" : "#FF5050" }}>
                        {tName(sideChooser)} joue {chosenSide === "blue" ? "Blue side" : "Red side"}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => launch(chosenSide)}
                        disabled={launchingGame}
                        style={{
                          padding: "11px 22px",
                          borderRadius: "9px",
                          border: "none",
                          background: "white",
                          color: "black",
                          fontWeight: 700,
                          fontSize: "14px",
                          cursor: launchingGame ? "default" : "pointer",
                          opacity: launchingGame ? 0.8 : 1,
                          minWidth: "150px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {launchingGame ? <ButtonLoadingDots color="rgba(0,0,0,0.75)" /> : "Lancer la game →"}
                      </button>
                      <button
                        onClick={reset}
                        disabled={launchingGame}
                        style={{
                          padding: "11px 16px",
                          borderRadius: "9px",
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.04)",
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "13px",
                          cursor: launchingGame ? "default" : "pointer",
                          opacity: launchingGame ? 0.5 : 1,
                        }}
                      >
                        Rejouer
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {coinState !== "done" && (
        <button onClick={() => router.push("/teams")} style={{
          marginTop: "32px", padding: "10px 18px", borderRadius: "9px",
          border: "1px solid rgba(255,255,255,0.08)", background: "transparent",
          color: "rgba(255,255,255,0.3)", fontSize: "13px", cursor: "pointer",
        }}>
          ← Retour
        </button>
      )}

    </main>
  );
}