"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import { generateTeams } from "@/lib/roulette/engine";
import { createRouletteSession } from "@/lib/appState";
import type { Player, Teams } from "@/lib/appState";

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

export default function RoulettePage() {
  const router = useRouter();
  const { state, update, hydrated } = useAppState();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rollingName, setRollingName] = useState<string | null>(null);
  const modeDescription =
    state?.mode === "balanced"
      ? "Les équipes sont calculées pour réduire l'écart de MMR entre les deux teams."
      : "Les joueurs sont tirés complètement au hasard.";

  const rollIntervalRef = useRef<number | null>(null);

  const rollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    if (!state || !state.players || state.players.length !== 10) {
      router.replace("/picker");
      return;
    }

    if (!state.session || state.session.type !== "roulette") {
      router.replace("/mode");
      return;
    }

    if (state.mode !== "roulette" && state.mode !== "balanced") {
      router.replace("/mode");
    }
  }, [hydrated, state, router]);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) window.clearTimeout(rollTimerRef.current);
      if (rollIntervalRef.current) window.clearInterval(rollIntervalRef.current);
    };
  }, []);

  if (!hydrated) return <main className="p-6">Chargement…</main>;
  if (!state || !state.session || state.session.type !== "roulette") {
    return <main className="p-6">Redirection…</main>;
  }

  const session = state.session.data;
  const team1 = session.history.filter((_, i) => i % 2 === 0);
  const team2 = session.history.filter((_, i) => i % 2 === 1);
  const totalPicked = session.history.length;
  const finished = totalPicked === 10;

  function teamScore(team: Player[]) {
    return team.reduce((sum, p) => sum + p.mmr, 0)
  }

  const scoreA = teamScore(team1)
  const scoreB = teamScore(team2)
  const diff = Math.abs(scoreA - scoreB)

  let diffColor = "text-green-400"

  if (diff > 300) diffColor = "text-yellow-400"
  if (diff > 700) diffColor = "text-red-400"

  function spin() {
    if (isSpinning) return;
    if (finished) return;
    if (!state) return;
    const existingResult = state.result;

    const result =
      existingResult ??
      generateTeams(
        state.players,
        state.mode === "balanced" ? "balanced" : "roulette"
      );

    const pickOrder = interleaveTeams(result);
    const nextPlayer = pickOrder[session.history.length];

    if (!nextPlayer) {
      update({
        ...state,
        result,
      });
      router.push("/teams");
      return;
    }

    setIsSpinning(true);
    setRollingName(null);

    // animation roulette
    rollIntervalRef.current = window.setInterval(() => {
      const r =
        session.remaining[
          Math.floor(Math.random() * session.remaining.length)
        ];
      if (r) setRollingName(r.prenom);
    }, 70);

    rollTimerRef.current = window.setTimeout(() => {

      if (rollIntervalRef.current) {
        window.clearInterval(rollIntervalRef.current);
      }

      const newHistory = [...session.history, nextPlayer];
      const newRemaining = removePlayerOnce(session.remaining, nextPlayer);

      const nextState = {
        ...state,
        result,
        session: {
          type: "roulette" as const,
          data: {
            remaining: newRemaining,
            history: newHistory,
            lastPicked: nextPlayer,
          },
        },
      };

      update(nextState);

      setRollingName(nextPlayer.prenom);
      setIsSpinning(false);

      if (newHistory.length === 10) {
        window.setTimeout(() => {
          router.push("/teams");
        }, 700);
      }

    }, 900);
  }

  function resetRoulette() {
    if (!state) return;

    const session = createRouletteSession(state.players);

    update({
      ...state,
      session,
      result: undefined
    });

    setRollingName(null);
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Roulette</h1>

      <div className="mt-2 text-sm opacity-70">
        Mode : {state.mode === "balanced" ? "Équilibré" : "Aléatoire"}
      </div>

      <div className="text-sm opacity-60 mt-1">
        {modeDescription}
      </div>

      <div className="mt-8 rounded-xl border p-6 text-center">
        <div className="text-sm opacity-60 mb-2">Dernier tiré</div>

        <div className={`min-h-12 flex items-center justify-center text-3xl font-bold transition-all duration-75 ${isSpinning ? "scale-110 opacity-80" : ""}`}>
          {rollingName ?? session.lastPicked?.prenom ?? "?"}
        </div>

        <button
          className="mt-6 rounded-lg bg-black text-white px-5 py-3 disabled:opacity-50"
          onClick={spin}
          disabled={isSpinning || finished}
        >
          {finished ? "Terminé" : isSpinning ? "Tirage..." : "Lancer"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

        

        {/* TEAM A */}

        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Team A</span>
            <span className="text-xs opacity-60">{scoreA}</span>
          </div>

          

          {team1.length === 0 ? (
            <div className="text-sm opacity-70">Personne.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {team1.map((p, i) => (
                <div key={i} className="text-sm">
                  {p.prenom} • {p.rank} ({p.mmr})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TEAM B */}

        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Team B</span>
            <span className="text-xs opacity-60">{scoreB}</span>
          </div>

          {team2.length === 0 ? (
            <div className="text-sm opacity-70">Personne.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {team2.map((p, i) => (
                <div key={i} className="text-sm">
                  {p.prenom} • {p.rank} ({p.mmr})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RESTANTS */}

        <div className="rounded-xl border p-4">
          <div className="font-semibold mb-2">Restants</div>

          {session.remaining.length === 0 ? (
            <div className="text-sm opacity-70">Plus personne.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {session.remaining.map((p, i) => (
                <span
                  key={i}
                  className="text-sm rounded-full border px-3 py-1"
                >
                  {p.prenom}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="mt-4 flex justify-center">
        <span className={`text-xs px-3 py-1 rounded-full border opacity-70 ${diffColor}`}>
          Δ MMR {diff}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          className="rounded-lg border px-4 py-2"
          onClick={() => router.push("/mode")}
        >
          Retour
        </button>

        <button
          className="rounded-lg border px-4 py-2"
          onClick={resetRoulette}
        >
          Reset
        </button>
      </div>
    </main>
  );
}