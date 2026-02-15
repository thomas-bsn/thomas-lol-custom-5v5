"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import { createInitialState } from "@/lib/appState";

export default function TeamsPage() {
  const router = useRouter();
  const { state, update, hydrated } = useAppState();

  useEffect(() => {
    if (!hydrated) return;

    if (!state?.players || state.players.length !== 10) {
      router.replace("/setup");
      return;
    }

    if (!state.teams || state.teams.team1.length !== 5 || state.teams.team2.length !== 5) {
      router.replace("/mode");
      return;
    }
  }, [hydrated, state, router]);

  if (!hydrated) return <main className="p-6">Chargement…</main>;
  if (!state?.teams) return <main className="p-6">Redirection…</main>;

  const { team1, team2, validated, source } = state.teams;

  function validate() {
    const fakeCode = Math.random().toString(36).slice(2, 8).toUpperCase(); // TODO: remplacer par un vrai code généré par le backend

    update({
      ...state,
      teams: { ...state.teams!, validated: true },
      game: { status: "running", code: fakeCode },
    });

    router.push("/game");
  }

  function backAndReset() {
    // on garde le mode d'origine pour revenir au bon écran
    update(createInitialState(state.players));
    router.push(source === "draft" ? "/draft" : "/roulette");
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Teams</h1>

      <p className="text-sm opacity-80 mt-2">
        {source === "draft"
          ? "Draft terminé. Team 1 et Team 2."
          : "5 tirages. Team 1 = tirés. Team 2 = restants."}
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-lg border p-4">
          <h2 className="font-semibold">Team 1</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {team1.map((p) => (
              <span key={p} className="text-sm rounded-full border px-3 py-1">
                {p}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="font-semibold">Team 2</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {team2.map((p) => (
              <span key={p} className="text-sm rounded-full border px-3 py-1">
                {p}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          className={`rounded-lg px-4 py-2 ${
            validated ? "bg-gray-200 text-gray-500" : "bg-black text-white"
          }`}
          onClick={validate}
          disabled={validated}
        >
          {validated ? "Validé" : "Valider"}
        </button>

        <button className="rounded-lg border px-4 py-2" onClick={backAndReset}>
          Retour + reset
        </button>
      </div>
    </main>
  );
}