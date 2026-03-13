"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import { createInitialState } from "@/lib/appState";
import { teamScore, diffColor, diffLabel } from "@/lib/draft/draftUtils";

export default function TeamsPage() {
  const router = useRouter();
  const { state, update, hydrated } = useAppState();

  useEffect(() => {
    if (!hydrated) return;

    if (!state?.players || state.players.length !== 10) {
      router.replace("/picker");
      return;
    }

    if (!state.result) {
      router.replace("/mode");
      return;
    }
  }, [hydrated, state, router]);

  if (!hydrated) return <main className="p-6">Chargement…</main>;
  if (!state?.result) return <main className="p-6">Redirection…</main>;

  const { team1, team2 } = state.result;
  const score1 = teamScore(team1);
  const score2 = teamScore(team2);
  const diff = Math.abs(score1 - score2);

  const diffInfo = diffLabel(diff);

  function validate() {
    if (!state) return;

    const fakeCode = Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase();

    update({
      ...state,
      game: {
        status: "running",
        code: fakeCode
      }
    });

    router.push("/game");
  }

  function backAndReset() {
    if (!state) return;

    update(createInitialState(state.players));

    router.push("/mode");
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold">Teams</h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        <section className="rounded-lg border p-4">
          <h2 className="font-semibold flex justify-between">
            <span>Team 1</span>
            <span className="text-xs opacity-60">{score1}</span>
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {team1.map((p) => (
              <span
                key={p.prenom}
                className="text-sm rounded-full border px-3 py-1"
              >
                {p.prenom} • {p.rank} ({p.mmr})
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="font-semibold flex justify-between">
            <span>Team 2</span>
            <span className="text-xs opacity-60">{score2}</span>
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {team2.map((p) => (
              <span
                key={p.prenom}
                className="text-sm rounded-full border px-3 py-1"
              >
                {p.prenom} • {p.rank} ({p.mmr})
              </span>
            ))}
          </div>
        </section>

      </div>

      <div className="mt-4 flex justify-center">
        <span className={`text-xs px-3 py-1 rounded-full border ${diffInfo.color}`}>
          {diffInfo.text} • difference de {diff}
        </span>
      </div>

      <div className="mt-6 flex gap-3">

        <button
          className="rounded-lg bg-black text-white px-4 py-2"
          onClick={validate}
        >
          Lancer la game
        </button>

        <button
          className="rounded-lg border px-4 py-2"
          onClick={backAndReset}
        >
          Retour
        </button>

      </div>

    </main>
  );
}