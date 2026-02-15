"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";

export default function GamePage() {
  const router = useRouter();
  const { state, hydrated } = useAppState();

  useEffect(() => {
    if (!hydrated) return;

    // si pas de teams validées, retourne
    if (!state?.teams?.validated) {
      router.replace("/teams");
      return;
    }

    // si pas de game, on reste quand même (mais c'est censé être set au validate)
  }, [hydrated, state, router]);

  if (!hydrated) return <main className="p-6">Chargement…</main>;
  if (!state?.teams?.validated) return <main className="p-6">Redirection…</main>;

  const code = state.game?.code;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">LANCEMENT DE LA GAME</h1>
      <p className="text-sm opacity-80 mt-2">Game en cours</p>

      <div className="mt-6 rounded-lg border p-4">
        <div className="text-sm opacity-70">Code de game</div>
        <div className="text-xl font-semibold mt-2">
          {code ? code : "En attente du backend…"}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="rounded-lg border px-4 py-2" onClick={() => router.push("/teams")}>
          Retour teams
        </button>
      </div>
    </main>
  );
}