"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createInitialState,
  normalizeForDupCheck,
  normalizeName,
} from "@/lib/appState";
import { useAppState } from "@/lib/useAppState";

export default function SetupPage() {
  const router = useRouter();
  const { state, update, hydrated } = useAppState();

  const initialInputs = useMemo(() => {
    const base = Array.from({ length: 10 }, () => "");
    if (state?.players?.length === 10) {
      return state.players.map((p) => p);
    }
    return base;
  }, [state?.players]);

  const [inputs, setInputs] = useState<string[]>(initialInputs);
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) {
    return <main className="p-6">Chargement…</main>;
  }

  function onChange(i: number, v: string) {
    const next = inputs.slice();
    next[i] = v;
    setInputs(next);
  }

  function validateAndBuildPlayers(): string[] | null {
    const players = inputs.map(normalizeName);

    if (players.some((p) => p.length === 0)) {
      setError("Il faut remplir les 10 prénoms (pas de champ vide).");
      return null;
    }

    // doublons (case + espaces + accents simplifiés)
    const seen = new Set<string>();
    for (const p of players) {
      const key = normalizeForDupCheck(p);
      if (seen.has(key)) {
        setError(`Doublon détecté: "${p}". Mets des prénoms uniques.`);
        return null;
      }
      seen.add(key);
    }

    setError(null);
    return players;
  }

  function onContinue() {
    const players = validateAndBuildPlayers();
    if (!players) return;

    update(createInitialState(players));
    router.push("/mode");
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Setup</h1>
      <p className="text-sm opacity-80 mt-2">
        Entre 10 prénoms uniques. On commence par la roulette.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 text-sm opacity-70">#{i + 1}</div>
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder={`Prénom ${i + 1}`}
              value={inputs[i] ?? ""}
              onChange={(e) => onChange(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          className="rounded-lg bg-black text-white px-4 py-2"
          onClick={onContinue}
        >
          Continuer
        </button>

        <button
          className="rounded-lg border px-4 py-2"
          onClick={() => {
            setInputs(Array.from({ length: 10 }, () => ""));
            setError(null);
            update(null);
          }}
        >
          Reset
        </button>
      </div>
    </main>
  );
}