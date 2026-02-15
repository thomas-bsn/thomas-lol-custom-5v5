"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import { createDraftState, createInitialState } from "@/lib/appState";

function otherTeam(t: 1 | 2): 1 | 2 {
  return t === 1 ? 2 : 1;
}

// Snake sur 8 picks:
// first, other, other, first, first, other, other, first
const SNAKE_PATTERN: Array<0 | 1> = [0, 1, 1, 0, 0, 1, 1, 0];

function getTurn(firstPicker: 1 | 2, pickIndex: number): 1 | 2 {
  const p = SNAKE_PATTERN[pickIndex] ?? 0;
  return p === 0 ? firstPicker : otherTeam(firstPicker);
}

export default function DraftPage() {
  const router = useRouter();
  const { state, update, hydrated } = useAppState();

  const [coinFlipResult, setCoinFlipResult] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    if (!state?.players || state.players.length !== 10) {
      router.replace("/setup");
      return;
    }

    if (!state.draft) {
      update({
        ...state,
        version: 1,
        mode: "draft",
        draft: createDraftState(state.players),
        teams: undefined,
      });
      return;
    }
  }, [hydrated, state, router, update]);

  if (!hydrated) return <main className="p-6">Chargement…</main>;
  if (!state?.players) return <main className="p-6">Redirection…</main>;
  if (!state.draft) return <main className="p-6">Redirection…</main>;

  const draft = state.draft;
  const players = state.players;

  const captain1 = draft.captain1;
  const captain2 = draft.captain2;

  const availableCaptainsFor1 = players;
  const availableCaptainsFor2 = captain1 ? players.filter((p) => p !== captain1) : players;

  const canFlip = Boolean(captain1 && captain2);

  const available = draft.available ?? [];
  const team1 = draft.team1 ?? [];
  const team2 = draft.team2 ?? [];
  const pickIndex = draft.pickIndex ?? 0;

  const maxPicks = 8;
  const isDone = draft.phase === "done" || pickIndex >= maxPicks;

  const firstPicker = draft.firstPicker;
  const currentTurn = firstPicker && !isDone ? getTurn(firstPicker, pickIndex) : null;

  const team1Name = captain1 ? `Team 1 (cap: ${captain1})` : "Team 1";
  const team2Name = captain2 ? `Team 2 (cap: ${captain2})` : "Team 2";

  let turnLabel = "";
  if (currentTurn === 1) turnLabel = captain1 ? `Au tour de Team 1 (${captain1})` : "Au tour de Team 1";
  if (currentTurn === 2) turnLabel = captain2 ? `Au tour de Team 2 (${captain2})` : "Au tour de Team 2";

  function setCaptain(team: 1 | 2, value: string) {
    if (!state) return;

    const v = value === "" ? undefined : value;

    const nextCaptain1 = team === 1 ? v : captain1;
    const nextCaptain2 = team === 2 ? v : captain2;

    // empêche les doublons
    const c1 = nextCaptain1;
    const c2 = c1 && nextCaptain2 === c1 ? undefined : nextCaptain2;

    update({
      ...state,
      version: 1,
      mode: "draft",
      draft: {
        ...draft,
        phase: "captains",
        captain1: c1,
        captain2: c2,
        firstPicker: undefined,
        available: [...players],
        team1: [],
        team2: [],
        pickIndex: 0,
      },
      teams: undefined,
    });

    setCoinFlipResult(null);
  }

  function flipCoinAndStart() {
    if (!state) return;
    if (!captain1 || !captain2) return;

    const fp: 1 | 2 = Math.random() < 0.5 ? 1 : 2;
    setCoinFlipResult(fp === 1 ? `${captain1} commence` : `${captain2} commence`);

    const nextAvailable = players.filter((p) => p !== captain1 && p !== captain2);

    update({
      ...state,
      version: 1,
      mode: "draft",
      draft: {
        phase: "picking",
        captain1,
        captain2,
        firstPicker: fp,
        available: nextAvailable,
        team1: [captain1],
        team2: [captain2],
        pickIndex: 0,
      },
      teams: undefined,
    });
  }

  function pickPlayer(p: string) {
    if (!state) return;
    if (!firstPicker) return;
    if (isDone) return;
    if (!available.includes(p)) return;

    const turn = getTurn(firstPicker, pickIndex);

    const nextAvailable = available.filter((x) => x !== p);
    const nextTeam1 = turn === 1 ? [...team1, p] : team1;
    const nextTeam2 = turn === 2 ? [...team2, p] : team2;
    const nextPickIndex = pickIndex + 1;

    const doneNow = nextPickIndex >= maxPicks;

    update({
      ...state,
      version: 1,
      mode: "draft",
      draft: {
        ...draft,
        phase: doneNow ? "done" : "picking",
        available: nextAvailable,
        team1: nextTeam1,
        team2: nextTeam2,
        pickIndex: nextPickIndex,
      },
      teams: doneNow
        ? { team1: nextTeam1, team2: nextTeam2, validated: false, source: "draft" }
        : state.teams,
    });

    if (doneNow) router.push("/teams");
  }

  function resetDraft() {
    if (!state) return;

    update({
      ...state,
      version: 1,
      mode: "draft",
      draft: createDraftState(players),
      teams: undefined,
    });

    setCoinFlipResult(null);
  }

  function backToModeResetAll() {
    update(createInitialState(players));
    router.push("/mode");
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Draft</h1>

      <div className="mt-4 rounded-lg border p-4">
        <h2 className="font-semibold">1) Choix des capitaines</h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm opacity-70 mb-2">Capitaine Team 1</div>
            <select
              className="w-full rounded-lg border px-3 py-2 bg-white text-black"
              value={captain1 ?? ""}
              onChange={(e) => setCaptain(1, e.target.value)}
              disabled={draft.phase !== "captains"}
            >
              <option value="">Sélectionner…</option>
              {availableCaptainsFor1.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-sm opacity-70 mb-2">Capitaine Team 2</div>
            <select
              className="w-full rounded-lg border px-3 py-2 bg-white text-black"
              value={captain2 ?? ""}
              onChange={(e) => setCaptain(2, e.target.value)}
              disabled={draft.phase !== "captains"}
            >
              <option value="">Sélectionner…</option>
              {availableCaptainsFor2.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className={`rounded-lg px-4 py-2 ${canFlip ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}
            onClick={flipCoinAndStart}
            disabled={!canFlip || draft.phase !== "captains"}
          >
            Pile ou face, puis commencer
          </button>

          <button className="rounded-lg border px-4 py-2" onClick={resetDraft}>
            Reset draft
          </button>

          <button className="rounded-lg border px-4 py-2" onClick={backToModeResetAll}>
            Retour modes (reset tout)
          </button>
        </div>

        {coinFlipResult && (
          <div className="mt-4 text-sm rounded-lg border p-3">
            Résultat: <span className="font-semibold">{coinFlipResult}</span>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <h2 className="font-semibold">2) Draft (snake)</h2>
        <p className="text-sm opacity-70 mt-1">Après pile ou face, ordre snake sur 8 picks.</p>

        {!firstPicker || draft.phase === "captains" ? (
          <div className="mt-4 text-sm opacity-70">Choisis les deux capitaines et lance le pile ou face.</div>
        ) : (
          <>
            <div className="mt-4 text-sm">
              <span className="opacity-70">Statut:</span>{" "}
              <span className="font-semibold">{isDone ? "Terminé" : turnLabel}</span>{" "}
              <span className="opacity-70">
                (pick {Math.min(pickIndex + 1, maxPicks)} / {maxPicks})
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <section className="rounded-lg border p-4 md:col-span-1">
                <h3 className="font-semibold">Joueurs disponibles</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {available.length === 0 ? (
                    <span className="text-sm opacity-70">Plus personne.</span>
                  ) : (
                    available.map((p) => (
                      <button
                        key={p}
                        className="text-sm rounded-full border px-3 py-1 hover:bg-black hover:text-white"
                        onClick={() => pickPlayer(p)}
                        disabled={isDone}
                      >
                        {p}
                      </button>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-lg border p-4 md:col-span-1">
                <h3 className="font-semibold">{team1Name}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {team1.map((p) => (
                    <span key={p} className="text-sm rounded-full border px-3 py-1">
                      {p}
                    </span>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border p-4 md:col-span-1">
                <h3 className="font-semibold">{team2Name}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {team2.map((p) => (
                    <span key={p} className="text-sm rounded-full border px-3 py-1">
                      {p}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {isDone && (
              <div className="mt-4 flex gap-3">
                <button className="rounded-lg bg-black text-white px-4 py-2" onClick={() => router.push("/teams")}>
                  Voir teams
                </button>
                <button className="rounded-lg border px-4 py-2" onClick={resetDraft}>
                  Refaire un draft (reset)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}