"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import { createDraftSession, createInitialState, Player } from "@/lib/appState";
import { teamScore, getTurn, diffColor, evaluatePick, pickAdviceColor, pickAdviceEmoji } from "@/lib/draft/draftUtils";
import { pickPlayer } from "@/lib/draft/draftEngine";

export default function DraftPage() {

  const router = useRouter();
  const { state, update, hydrated } = useAppState();

  const [coinFlipResult, setCoinFlipResult] = useState<string | null>(null);

  useEffect(() => {

    if (!hydrated) return;

    if (!state?.players || state.players.length !== 10) {
      router.replace("/picker");
      return;
    }

    if (state.session?.type !== "draft") {

      update({
        ...state,
        mode: "draft",
        session: createDraftSession(state.players),
        result: undefined
      });

    }

  }, [hydrated, state]);

  if (!hydrated) return <main className="p-6">Chargement…</main>;
  if (!state?.session || state.session.type !== "draft") return <main className="p-6">Redirection…</main>;

  const players = state.players;
  const draft = state.session.data;

  const captain1 = draft.captain1;
  const captain2 = draft.captain2;

  const available = draft.available;
  const team1 = draft.team1;
  const team2 = draft.team2;
  const pickIndex = draft.pickIndex;

  const maxPicks = 8;
  const isDone = draft.phase === "done" || pickIndex >= maxPicks;

  const firstPicker = draft.firstPicker;
  const currentTurn = firstPicker && !isDone ? getTurn(firstPicker, pickIndex) : null;

  const scoreA = teamScore(team1);
  const scoreB = teamScore(team2);
  const diff = Math.abs(scoreA - scoreB);
  const showAdvice = pickIndex >= 2;

  const diffs = available.map(p =>
    evaluatePick(p, team1, team2, currentTurn as 1 | 2)
  )

  const best = Math.min(...diffs)

  const turnLabel =
    currentTurn === 1
      ? `Au tour de ${captain1?.prenom}`
      : currentTurn === 2
      ? `Au tour de ${captain2?.prenom}`
      : "";

  function setCaptain(team: 1 | 2, p: Player | undefined) {

    if (!state) return;

    const nextCaptain1 = team === 1 ? p : captain1;
    const nextCaptain2 = team === 2 ? p : captain2;

    update({
      ...state,
      session: {
        type: "draft",
        data: {
          ...draft,
          phase: "captains",
          captain1: nextCaptain1,
          captain2: nextCaptain2,
          available: players,
          team1: [],
          team2: [],
          pickIndex: 0
        }
      }
    });

  }

  function flipCoinAndStart() {

    if (!captain1 || !captain2) return;

    const fp: 1 | 2 = Math.random() < 0.5 ? 1 : 2;

    setCoinFlipResult(
      fp === 1 ? `${captain1.prenom} commence` : `${captain2.prenom} commence`
    );

    const nextAvailable = players.filter(
      (p) => p !== captain1 && p !== captain2
    );
    if (!state) return;

    update({
      ...state,
      version: 2,
      session: {
        type: "draft",
        data: {
          phase: "picking",
          captain1,
          captain2,
          firstPicker: fp,
          available: nextAvailable,
          team1: [captain1],
          team2: [captain2],
          pickIndex: 0
        }
      }
    });

  }

  function onPick(p: Player) {

    if (!firstPicker) return;

    const result = pickPlayer(
      available,
      team1,
      team2,
      firstPicker,
      pickIndex,
      p
    );

    const doneNow = result.pickIndex >= maxPicks;
    if (!state) return;

    update({
      ...state,
      session: {
        type: "draft",
        data: {
          ...draft,
          phase: doneNow ? "done" : "picking",
          ...result
        }
      },
      result: doneNow
        ? { team1: result.team1, team2: result.team2 }
        : state.result
    });

    if (doneNow) router.push("/teams");

  }
  
  function resetDraft() {
    if (!state) return;
    update({
      ...state,
      session: createDraftSession(players),
      result: undefined
    });

    setCoinFlipResult(null);

  }

  function backToMode() {

    update(createInitialState(players));
    router.push("/mode");

  }

  return (

    <main className="p-6 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold">Draft</h1>

      <div className="mt-4 flex gap-3">

        <button
          className="rounded-lg border px-4 py-2"
          onClick={resetDraft}
        >
          Reset la draft
        </button>

        <button
          className="rounded-lg border px-4 py-2"
          onClick={backToMode}
        >
          Retour aux modes
        </button>

      </div>

      {/* Captain selection */}

      {draft.phase === "captains" && (

        <div className="mt-6 grid grid-cols-2 gap-4">

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Capitaine Team A</h3>

            <select
              className="w-full border rounded p-2 bg-neutral-900 text-white border-neutral-700"
              value={captain1?.prenom ?? ""}
              onChange={(e) => {

                const player = players.find(p => p.prenom === e.target.value);
                setCaptain(1, player);

              }}
            >
              <option value="">Choisir</option>
              {players
                .filter(p => p.prenom !== captain2?.prenom)
                .map(p => (
                  <option key={p.prenom} value={p.prenom}>
                    {p.prenom} • {p.rank} ({p.mmr})
                  </option>
              ))}
            </select>

          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Capitaine Team B</h3>

            <select
              className="w-full border rounded p-2 bg-neutral-900 text-white border-neutral-700"
              value={captain2?.prenom ?? ""}
              onChange={(e) => {

                const player = players.find(p => p.prenom === e.target.value);
                setCaptain(2, player);

              }}
            >
              <option value="">Choisir</option>
              {players
                .filter(p => p.prenom !== captain1?.prenom)
                .map(p => (
                  <option key={p.prenom} value={p.prenom}>
                    {p.prenom} • {p.rank} ({p.mmr})
                  </option>
              ))}
            </select>

          </div>

          <button
            className="col-span-2 mt-4 bg-black text-white px-4 py-2 rounded"
            onClick={flipCoinAndStart}
            disabled={!captain1 || !captain2}
          >
            Pile ou face
          </button>

        </div>

      )}

      {coinFlipResult && pickIndex === 0 && (
        <div className="mt-4">{coinFlipResult}</div>
      )}

      {draft.phase !== "captains" && (

        <>
          <div className="mt-4 text-sm">
            {turnLabel} (pick {pickIndex + 1} / {maxPicks})
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">

            <section className="border rounded-lg p-4">

              <h3 className="font-semibold">Disponibles</h3>
              <div className="mt-2 flex flex-wrap gap-3 text-xs opacity-80">

                <span className="flex items-center gap-1">
                  🟢 <span>équilibré</span>
                </span>

                <span className="flex items-center gap-1">
                  🟡 <span>correct</span>
                </span>

                <span className="flex items-center gap-1">
                  🟠 <span>déséquilibré</span>
                </span>

                <span className="flex items-center gap-1">
                  🔴 <span>très déséquilibré</span>
                </span>

                <span className="flex items-center gap-1">
                  💀 <span>catastrophe</span>
                </span>

              </div>

              <div className="mt-3 flex flex-wrap gap-2">

                {available.map((p) => {

                  const diff = evaluatePick(p, team1, team2, currentTurn as 1 | 2);
                  const color = pickAdviceColor(diff);

                  return (
                    <button
                      key={p.prenom}
                      onClick={() => onPick(p)}
                      className={`flex items-center gap-2 text-sm rounded-full border px-3 py-1 hover:bg-black hover:text-white
                        ${showAdvice && diff === best ? "ring-2 ring-green-400" : ""}
                      `}
                    >
                      <span>
                        {p.prenom} • {p.rank} ({p.mmr})
                      </span>

                      {showAdvice && (
                        <span className="text-sm">
                          {pickAdviceEmoji(diff)}
                        </span>
                      )}

                    </button>
                  );

                })}

              </div>

            </section>

            <section
              className={`rounded-lg p-4 border transition ${
                currentTurn === 1
                  ? "border-green-500 shadow-lg shadow-green-500/30 animate-pulse"
                  : "border-neutral-600"
              }`}
            >

              <h3 className="font-semibold flex justify-between items-center">
                <span>Team A</span>

                {currentTurn === 1 && (
                  <span className="text-xs bg-green-500 text-black px-2 py-0.5 rounded">
                    PICK
                  </span>
                )}

                <span className="text-xs opacity-60">{scoreA}</span>
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">

                {team1.map((p) => (

                  <span key={p.prenom} className="text-sm rounded-full border px-3 py-1">
                    {p.prenom} • {p.rank} ({p.mmr})
                  </span>

                ))}

              </div>

            </section>

            <section
              className={`rounded-lg p-4 border transition ${
                currentTurn === 2
                  ? "border-green-500 shadow-lg shadow-green-500/30 animate-pulse"
                  : "border-neutral-600"
              }`}
            >

              <h3 className="font-semibold flex justify-between items-center">
                <span>Team B</span>

                {currentTurn === 2 && (
                  <span className="text-xs bg-green-500 text-black px-2 py-0.5 rounded">
                    PICK
                  </span>
                )}

                <span className="text-xs opacity-60">{scoreB}</span>
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">

                {team2.map((p) => (

                  <span key={p.prenom} className="text-sm rounded-full border px-3 py-1">
                    {p.prenom} • {p.rank} ({p.mmr})
                  </span>

                ))}

              </div>

            </section>

          </div>

          <div className="mt-4 flex justify-center">

            <span className={`text-xs px-3 py-1 rounded-full border ${diffColor(diff)}`}>
              difference de MMR : {diff}
            </span>

          </div>

        </>

      )}

    </main>

  );

}