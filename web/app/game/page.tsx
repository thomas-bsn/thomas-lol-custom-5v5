"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";

export default function GamePage() {
  const router = useRouter();
  const { state, hydrated } = useAppState();

  useEffect(() => {
    if (!hydrated) return;

    // si pas de game, retour au début
    if (!state?.game?.code) {
      router.replace("/setup");
    }
  }, [hydrated, state, router]);

  if (!hydrated) return <main className="p-6">Chargement…</main>;
  if (!state?.game?.code) return <main className="p-6">Redirection…</main>;

  return (
    <main className="p-6 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold">CODE</h1>

      <div className="mt-6 rounded-xl border p-8">
        <div className="text-6xl font-extrabold tracking-widest">
          {state.game.code}
        </div>
        <div className="mt-4 text-sm opacity-80">À utiliser pour rejoindre la game</div>
      </div>

      <div className="mt-6">
        <button
          className="rounded-lg border px-4 py-2"
          onClick={() => router.push("/tuto")}
        >
          Comment rejoindre un tournoi LoL ?
        </button>
      </div>
    </main>
  );
}