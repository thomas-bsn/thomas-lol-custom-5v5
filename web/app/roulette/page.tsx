"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import { createInitialState } from "@/lib/appState";

export default function RoulettePage() {
  const router = useRouter();
  const { state, update, hydrated } = useAppState();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rollingName, setRollingName] = useState<string | null>(null);
  const rollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!state?.players || state.players.length !== 10) {
      router.replace("/setup");
      return;
    }
    if (!state.roulette) {
      update(createInitialState(state.players));
    }
  }, [hydrated, state, router, update]);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) window.clearInterval(rollTimerRef.current);
    };
  }, []);

  if (!hydrated) return <main className="p-6">Chargement…</main>;
  if (!state?.roulette) return <main className="p-6">Redirection…</main>;

  const roulette = state.roulette;
  const remaining = roulette.remaining ?? [];
  const history = roulette.history ?? [];
  const lastPicked = roulette.lastPicked;

  const maxPicks = 5;
  const selectionDone = history.length >= maxPicks;
  const canSpin = !isSpinning && !selectionDone && remaining.length > 0;

  function stopRolling() {
    if (rollTimerRef.current) {
      window.clearInterval(rollTimerRef.current);
      rollTimerRef.current = null;
    }
    setRollingName(null);
  }

  function spin() {
    if (!canSpin) return;

    setIsSpinning(true);

    // texte qui défile
    let i = 0;
    rollTimerRef.current = window.setInterval(() => {
      if (remaining.length === 0) return;
      setRollingName(remaining[i % remaining.length]);
      i++;
    }, 60);

    // stop + vrai tirage après 1200ms
    window.setTimeout(() => {
      stopRolling();

      const idx = Math.floor(Math.random() * remaining.length);
      const picked = remaining[idx];

      const nextRemaining = remaining.filter((_, j) => j !== idx);
      const nextHistory = [picked, ...history];

      const nextStateBase = {
        ...state,
        mode: "roulette" as const,
        roulette: {
          remaining: nextRemaining,
          history: nextHistory,
          lastPicked: picked,
        },
      };

      if (nextHistory.length >= maxPicks) {
        const team1 = [...nextHistory].slice(0, maxPicks); // dernier en premier
        const team2 = [...nextRemaining];

        update({
          ...nextStateBase,
          version: 1,
          players: state.players,
          teams: { team1, team2, validated: false, source: "roulette" },
        });
      } else {
        update(nextStateBase);
      }

      setIsSpinning(false);
    }, 1200);
  }

  function resetRoulette() {
    update(createInitialState(state.players));
    setIsSpinning(false);
    stopRolling();
  }

  const displayName = isSpinning ? (rollingName ?? "...") : (lastPicked ?? "—");

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Roulette</h1>

      <div className="mt-4 rounded-lg border p-4">
        <div className="text-sm opacity-70">Dernier tiré</div>
        <div className="text-4xl font-bold mt-2">{displayName}</div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className={`rounded-lg px-4 py-2 ${
              canSpin ? "bg-black text-white" : "bg-gray-200 text-gray-500"
            }`}
            onClick={spin}
            disabled={!canSpin}
          >
            {selectionDone ? "Terminé" : isSpinning ? "Spinning…" : "Spin"}
          </button>

          <button className="rounded-lg border px-4 py-2" onClick={resetRoulette}>
            Reset
          </button>

          <button className="rounded-lg border px-4 py-2" onClick={() => router.push("/mode")}>
            Back
          </button>

          {selectionDone && (
            <button
              className="rounded-lg bg-black text-white px-4 py-2"
              onClick={() => router.push("/teams")}
            >
              Voir teams
            </button>
          )}
        </div>

        <div className="mt-4 text-sm opacity-70">
          Picks: {Math.min(history.length, maxPicks)} / {maxPicks} (après ça on stop)
        </div>
      </div>

      {selectionDone && (
        <div className="mt-6 rounded-lg border p-4">
          <h2 className="font-semibold">Aperçu des teams</h2>
          <p className="text-sm opacity-70 mt-1">On a atteint 5 picks. Tu peux valider.</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm opacity-70 mb-2">Team 1 (tirés)</div>
              <div className="flex flex-wrap gap-2">
                {history.slice(0, 5).map((p, i) => (
                  <span key={`${p}-${i}`} className="text-sm rounded-full border px-3 py-1">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm opacity-70 mb-2">Team 2 (restants)</div>
              <div className="flex flex-wrap gap-2">
                {remaining.map((p) => (
                  <span key={p} className="text-sm rounded-full border px-3 py-1">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-lg border p-4">
          <h2 className="font-semibold">Restants</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {remaining.length === 0 ? (
              <span className="text-sm opacity-70">Plus personne.</span>
            ) : (
              remaining.map((p) => (
                <span key={p} className="text-sm rounded-full border px-3 py-1">
                  {p}
                </span>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="font-semibold">Historique</h2>
          <div className="mt-2 flex flex-col gap-2">
            {history.length === 0 ? (
              <span className="text-sm opacity-70">Aucun tirage.</span>
            ) : (
              history.map((p, i) => (
                <div key={`${p}-${i}`} className="flex justify-between text-sm">
                  <span>{p}</span>
                  <span className="opacity-60">#{history.length - i}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}