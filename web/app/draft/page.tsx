"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import { createDraftSession, createInitialState, Player } from "@/lib/appState";
import { teamScore, getTurn, evaluatePick, pickAdviceEmoji } from "@/lib/draft/draftUtils";
import { pickPlayer } from "@/lib/draft/draftEngine";

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

function PlayerBadge({ player, onClick, highlight, advice, small }: {
  player: Player;
  onClick?: () => void;
  highlight?: boolean;
  advice?: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: small ? "5px 10px" : "8px 12px",
        borderRadius: "8px",
        border: highlight ? "1px solid rgba(80,220,140,0.5)" : "1px solid rgba(255,255,255,0.08)",
        background: highlight ? "rgba(80,220,140,0.08)" : "rgba(255,255,255,0.04)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.12s",
        boxShadow: highlight ? "0 0 8px rgba(80,220,140,0.2)" : "none",
        width: "100%",
        textAlign: "left",
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = highlight ? "rgba(80,220,140,0.08)" : "rgba(255,255,255,0.04)"; }}
    >
      <img src={`/rank_icons/${player.rank.split(" ")[0].toLowerCase()}.svg`} style={{ width: "18px", height: "18px", flexShrink: 0 }} />
      <span style={{ color: "white", fontSize: small ? "12px" : "13px", fontWeight: 600 }}>{player.prenom}</span>
      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{player.rank}</span>
      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>({player.mmr})</span>
      {advice && <span style={{ marginLeft: "auto", fontSize: "14px" }}>{advice}</span>}
    </button>
  );
}

function CaptainPicker({ label, players, value, onChange, accent }: {
  label: string;
  players: Player[];
  value: Player | undefined;
  onChange: (p: Player | undefined) => void;
  accent: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        background: value ? `rgba(${accent}, 0.06)` : "rgba(0,0,0,0.3)",
        border: value ? `1px solid rgba(${accent}, 0.4)` : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        padding: "18px",
        transition: "all 0.2s",
      }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "12px" }}>
          CAPITAINE {label}
        </div>

        {/* Trigger */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,0,0,0.3)", cursor: "pointer",
          }}
        >
          {value ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img src={`/rank_icons/${value.rank.split(" ")[0].toLowerCase()}.svg`} style={{ width: "18px", height: "18px" }} />
              <span style={{ color: "white", fontWeight: 600, fontSize: "13px" }}>{value.prenom}</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>{value.rank}</span>
            </div>
          ) : (
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>— Choisir un capitaine —</span>
          )}
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{open ? "▲" : "▼"}</span>
        </button>

        {/* Dropdown */}
        {open && (
          <div style={{
            position: "absolute", left: 0, right: 0, zIndex: 10,
            background: "#0e0e0e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            marginTop: "6px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}>
            {players.map(p => (
              <button
                key={p.prenom}
                onClick={() => { onChange(p); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 16px", background: "transparent", border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer", textAlign: "left",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <img src={`/rank_icons/${p.rank.split(" ")[0].toLowerCase()}.svg`} style={{ width: "18px", height: "18px", flexShrink: 0 }} />
                <span style={{ color: "white", fontWeight: 600, fontSize: "13px" }}>{p.prenom}</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>{p.rank}</span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", marginLeft: "auto" }}>{p.mmr} MMR</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DraftPage() {
  const router = useRouter();
  const { state, update, hydrated } = useAppState();
  const [coinFlipResult, setCoinFlipResult] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!state?.players || state.players.length !== 10) { router.replace("/picker"); return; }
    if (state.session?.type !== "draft") {
      update({ ...state, mode: "draft", session: createDraftSession(state.players), result: undefined });
    }
  }, [hydrated, state]);

  if (!hydrated) return <main style={{ padding: "24px", color: "white" }}>Chargement…</main>;
  if (!state?.session || state.session.type !== "draft") return <main style={{ padding: "24px", color: "white" }}>Redirection…</main>;

  const players = state.players;
  const draft = state.session.data;
  const { captain1, captain2, available, team1, team2, pickIndex } = draft;
  const maxPicks = 8;
  const isDone = draft.phase === "done" || pickIndex >= maxPicks;
  const firstPicker = draft.firstPicker;
  const currentTurn = firstPicker && !isDone ? getTurn(firstPicker, pickIndex) : null;
  const scoreA = teamScore(team1);
  const scoreB = teamScore(team2);
  const diff = Math.abs(scoreA - scoreB);
  const showAdvice = pickIndex >= 2;
  const diffs = available.map(p => evaluatePick(p, team1, team2, currentTurn as 1 | 2));
  const best = Math.min(...diffs);
  const turnLabel = currentTurn === 1 ? `Au tour de ${captain1?.prenom}` : currentTurn === 2 ? `Au tour de ${captain2?.prenom}` : "";

  function setCaptain(team: 1 | 2, p: Player | undefined) {
    if (!state) return;
    update({
      ...state,
      session: {
        type: "draft",
        data: { ...draft, phase: "captains", captain1: team === 1 ? p : captain1, captain2: team === 2 ? p : captain2, available: players, team1: [], team2: [], pickIndex: 0 }
      }
    });
  }

  function flipCoinAndStart() {
    if (!captain1 || !captain2) return;
    const fp: 1 | 2 = Math.random() < 0.5 ? 1 : 2;
    setCoinFlipResult(fp === 1 ? `🎲 ${captain1.prenom} commence !` : `🎲 ${captain2.prenom} commence !`);
    const nextAvailable = players.filter(p => p !== captain1 && p !== captain2);
    if (!state) return;
    update({
      ...state, version: 2,
      session: { type: "draft", data: { phase: "picking", captain1, captain2, firstPicker: fp, available: nextAvailable, team1: [captain1], team2: [captain2], pickIndex: 0 } }
    });
  }

  function onPick(p: Player) {
    if (!firstPicker) return;
    const result = pickPlayer(available, team1, team2, firstPicker, pickIndex, p);
    const doneNow = result.pickIndex >= maxPicks;
    if (!state) return;
    update({
      ...state,
      session: { type: "draft", data: { ...draft, phase: doneNow ? "done" : "picking", ...result } },
      result: doneNow ? { team1: result.team1, team2: result.team2 } : state.result
    });
    if (doneNow) router.push("/teams");
  }

  function resetDraft() {
    if (!state) return;
    update({ ...state, session: createDraftSession(players), result: undefined });
    setCoinFlipResult(null);
  }

  function backToMode() {
    update(createInitialState(players));
    router.push("/mode");
  }

  return (
    <main style={{ padding: "0 32px 40px", width: "100%" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Draft</h1>
          {draft.phase !== "captains" && (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginTop: "4px" }}>
              Pick {pickIndex + 1} / {maxPicks} — {turnLabel}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={resetDraft} style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: "13px", cursor: "pointer" }}>Reset</button>
          <button onClick={backToMode} style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: "13px", cursor: "pointer" }}>← Modes</button>
        </div>
      </div>

      {/* Phase capitaines */}
      {draft.phase === "captains" && (
        // Retire le maxWidth
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "900px" }}>
            <CaptainPicker
              label="TEAM A" value={captain1} accent="80,180,255"
              players={players.filter(p => p.prenom !== captain2?.prenom)}
              onChange={p => setCaptain(1, p)}
            />
            <CaptainPicker
              label="TEAM B" value={captain2} accent="255,80,80"
              players={players.filter(p => p.prenom !== captain1?.prenom)}
              onChange={p => setCaptain(2, p)}
            />
          </div>

          {coinFlipResult && (
            <div style={{ padding: "14px 18px", borderRadius: "10px", border: "1px solid rgba(255,215,0,0.3)", background: "rgba(255,215,0,0.07)", color: "#FFD700", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
              {coinFlipResult}
            </div>
          )}

          <button
            onClick={flipCoinAndStart}
            disabled={!captain1 || !captain2}
            style={{
              padding: "13px", borderRadius: "10px", border: "none",
              background: captain1 && captain2 ? "white" : "rgba(255,255,255,0.06)",
              color: captain1 && captain2 ? "black" : "rgba(255,255,255,0.2)",
              fontWeight: 700, fontSize: "14px",
              cursor: captain1 && captain2 ? "pointer" : "default",
              transition: "all 0.2s",
            }}
          >
            🎲 Pile ou face
          </button>
        </div>
      )}

      {/* Phase picking */}
      {draft.phase !== "captains" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>

            {/* Disponibles */}
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "18px" }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "12px" }}>
                DISPONIBLES ({available.length})
              </div>
              {showAdvice && (
                <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{
                    padding: "8px 10px", borderRadius: "7px",
                    border: "1px solid rgba(80,220,140,0.2)", background: "rgba(80,220,140,0.05)",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}>
                    <span style={{ fontSize: "12px" }}>🟢</span>
                    <span style={{ color: "rgba(80,220,140,0.8)", fontSize: "11px" }}>
                      Le joueur en vert est le pick le plus équitable pour les deux équipes
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {[["🟢","Idéal"], ["🟡","Acceptable"], ["🟠","Déséquilibré"], ["🔴","Très déséquilibré"], ["💀","À éviter"]].map(([e, l]) => (
                      <span key={l} style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", gap: "3px" }}>{e} {l}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {available.map((p) => {
                  const d = evaluatePick(p, team1, team2, currentTurn as 1 | 2);
                  return (
                    <PlayerBadge key={p.prenom} player={p} onClick={() => onPick(p)}
                      highlight={showAdvice && d === best}
                      advice={showAdvice ? pickAdviceEmoji(d) : undefined}
                    />
                  );
                })}
              </div>
            </div>

            {/* Teams */}
            {([
              { team: team1 as Player[], score: scoreA, turn: 1 as const, label: "TEAM A", accent: "80,180,255" },
              { team: team2 as Player[], score: scoreB, turn: 2 as const, label: "TEAM B", accent: "255,80,80" },
            ]).map(({ team, score, turn, label, accent }) => (
              <div key={label} style={{
                background: currentTurn === turn ? `rgba(${accent}, 0.05)` : "rgba(0,0,0,0.3)",
                border: currentTurn === turn ? `1px solid rgba(${accent}, 0.4)` : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px", padding: "18px",
                boxShadow: currentTurn === turn ? `0 0 20px rgba(${accent}, 0.12)` : "none",
                transition: "all 0.3s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>{label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {currentTurn === turn && (
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: `rgba(${accent}, 0.8)`, color: "white" }}>PICK</span>
                    )}
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>{score} MMR</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {team.map((p) => <PlayerBadge key={p.prenom} player={p} />)}
                </div>
              </div>
            ))}
          </div>

          {/* Diff MMR */}
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
            <span style={{
              fontSize: "12px", padding: "5px 16px", borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)",
              color: "rgba(255,255,255,0.4)",
            }}>
              Différence MMR : <strong style={{ color: diff < 100 ? "#50DC8C" : diff < 300 ? "#FFB932" : "#FF5050" }}>{diff}</strong>
            </span>
          </div>
        </>
      )}
    </main>
  );
}