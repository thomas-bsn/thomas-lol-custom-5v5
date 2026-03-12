"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";

export default function ModePage() {
  const router = useRouter();
  const { state, update, hydrated } = useAppState();

  const [rouletteType, setRouletteType] = useState<"random" | "balanced">("random");

  useEffect(() => {
    if (!hydrated) return;
    if (!state || !state.players || state.players.length !== 10) {
      router.replace("/picker");
    }
  }, [hydrated, state, router]);

  if (!hydrated) return <main className="p-6">Chargement…</main>;
  if (!state) return <main className="p-6">Redirection…</main>;

  const players = state.players;

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Mode</h1>

      <div className="mt-4 rounded-lg border p-3">
        <div className="text-sm opacity-70 mb-2">Joueurs</div>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <span key={p} className="text-sm rounded-full border px-3 py-1">
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">

        {/* ROULETTE */}

        <div className="rounded-lg border px-4 py-3">
          <div className="font-semibold">Roulette</div>
          <div className="text-sm opacity-80 mb-3">
            Tirage automatique pour former deux équipes.
          </div>

          <div className="flex flex-col gap-2 text-sm">

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={rouletteType === "random"}
                onChange={() => setRouletteType("random")}
              />
              Aléatoire
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={rouletteType === "balanced"}
                onChange={() => setRouletteType("balanced")}
              />
              Équilibrée (basée sur le MMR)
            </label>

          </div>

          <button
            className="mt-3 rounded-lg bg-black text-white px-4 py-2"
            onClick={() => {

              update({
                ...state,
                mode: rouletteType === "balanced"
                  ? "balancedRoulette"
                  : "roulette"
              });

              router.push("/roulette");

            }}
          >
            Commencer la roulette
          </button>
        </div>

        {/* DRAFT */}

        <button
          className="rounded-lg border px-4 py-3 text-left"
          onClick={() => {
            update({ ...state, mode: "draft" });
            router.push("/draft");
          }}
        >
          <div className="font-semibold">Draft</div>
          <div className="text-sm opacity-80">
            Deux capitaines, pile ou face, puis draft snake.
          </div>
        </button>

      </div>

      <div className="mt-6">
        <button
          className="rounded-lg border px-4 py-2"
          onClick={() => router.push("/picker")}
        >
          Modifier les prénoms
        </button>
      </div>
    </main>
  );
}