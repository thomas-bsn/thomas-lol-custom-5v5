"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppState } from "@/lib/useAppState"
import { createInitialState } from "@/lib/appState"
import { pickPlayer } from "@/lib/rouletteEngine"

export default function RoulettePage() {

  const router = useRouter()
  const { state, update, hydrated } = useAppState()

  const [isSpinning, setIsSpinning] = useState(false)
  const [rollingName, setRollingName] = useState<string | null>(null)

  const rollTimerRef = useRef<number | null>(null)

  useEffect(() => {

    if (!hydrated) return

    if (!state?.players || state.players.length !== 10) {
      router.replace("/picker")
      return
    }

    if (!state.roulette) {
      update(createInitialState(state.players))
    }

  }, [hydrated, state])

  if (!hydrated || !state?.roulette)
    return <main className="p-6">Chargement…</main>

  const roulette = state.roulette

  const remaining = roulette.remaining ?? []
  const history = roulette.history ?? []

  const teams = state.teams ?? { team1: [], team2: [] }

  const balanced = state.mode === "balancedRoulette"

  const selectionDone =
    teams.team1.length === 5 && teams.team2.length === 5

  const canSpin =
    !isSpinning &&
    remaining.length > 0 &&
    !selectionDone

  const scoreA = teams.team1.reduce((sum, p) => sum + p.mmr, 0)
  const scoreB = teams.team2.reduce((sum, p) => sum + p.mmr, 0)

  const diff = Math.abs(scoreA - scoreB)

  const modeLabel = balanced
    ? "Roulette équilibrée (MMR)"
    : "Roulette aléatoire"

  const modeDescription = balanced
    ? "Les tirages favorisent des équipes équilibrées en se basant sur le MMR."
    : "Les joueurs sont tirés complètement au hasard."

  function stopRolling() {

    if (rollTimerRef.current) {
      window.clearInterval(rollTimerRef.current)
      rollTimerRef.current = null
    }

    setRollingName(null)
  }

  function spin() {

    if (!canSpin) return

    setIsSpinning(true)

    let i = 0

    rollTimerRef.current = window.setInterval(() => {

      setRollingName(remaining[i % remaining.length].prenom)
      i++

    }, 60)

    window.setTimeout(() => {

      stopRolling()

      const idx = pickPlayer(
        remaining,
        teams.team1,
        teams.team2,
        balanced
      )

      const picked = remaining[idx]

      if (!picked) {
        setIsSpinning(false)
        return
      }

      const nextRemaining = remaining.filter((p) => p.prenom !== picked.prenom)

      const nextHistory = [picked, ...history]

      let team1 = [...teams.team1]
      let team2 = [...teams.team2]

      if (team1.length <= team2.length) {
        team1.push(picked)
      } else {
        team2.push(picked)
      }

      if (!state) return

      update({
        ...state,
        version: 1,
        roulette: {
          remaining: nextRemaining,
          history: nextHistory,
          lastPicked: picked
        },
        teams: {
          team1,
          team2,
          validated: false,
          source: balanced ? "balanced" : "roulette"
        }
      })

      setIsSpinning(false)

    }, 1200)

  }

  function reset() {
    if (!state) return
    update(createInitialState(state.players))
  }

  return (

    <main className="p-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold">Roulette</h1>

      <div className="mt-2 rounded-lg border p-3 text-sm">

        <div className="font-semibold">
          Mode : {modeLabel}
        </div>

        <div className="opacity-70 mt-1">
          {modeDescription}
        </div>

      </div>

      <div className="mt-4 rounded-lg border p-4">

        <div className="text-sm opacity-70">
          Dernier tiré
        </div>

        <div className="text-4xl font-bold mt-2">
          {rollingName ?? roulette.lastPicked?.prenom ?? "—"}
        </div>

        <div className="mt-4 flex gap-3">

          <button
            className={`rounded-lg px-4 py-2 ${
              canSpin ? "bg-black text-white" : "bg-gray-300 text-gray-500"
            }`}
            disabled={!canSpin}
            onClick={spin}
          >
            {selectionDone ? "Terminé" : isSpinning ? "Spinning…" : "Spin"}
          </button>

          <button
            className="rounded-lg border px-4 py-2"
            onClick={reset}
          >
            Reset
          </button>

        </div>

      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">

        <div className="rounded-lg border p-4">

          <h2 className="font-semibold mb-2">
            Team 1
          </h2>

          {teams.team1.length === 0
            ? <span className="text-sm opacity-70">Personne.</span>
            : teams.team1.map((p) => (
                <div key={p.prenom} className="text-sm">
                  {p.prenom} • {p.rank} ({p.mmr})
                </div>
              ))
          }

        </div>

        <div className="rounded-lg border p-4">

          <h2 className="font-semibold mb-2">
            Team 2
          </h2>

          {teams.team2.length === 0
            ? <span className="text-sm opacity-70">Personne.</span>
            : teams.team2.map((p) => (
                <div key={p.prenom} className="text-sm">
                  {p.prenom} • {p.rank} ({p.mmr})
                </div>
              ))
          }

        </div>

      </div>

      {selectionDone && (

        <div className="mt-4 rounded-lg border p-4 text-sm">

          <div>
            Equipe A: <b>{scoreA}</b>
          </div>

          <div>
            Equipe B: <b>{scoreB}</b>
          </div>

          <div className="mt-1">
            Différence: <b>{diff}</b>
          </div>

        </div>

      )}

      {!selectionDone && (

        <div className="mt-6 rounded-lg border p-4">

          <h2 className="font-semibold mb-2">
            Restants
          </h2>

          <div className="flex flex-wrap gap-2">

            {remaining.map((p) => (
              <span
                key={p.prenom}
                className="text-sm rounded-full border px-3 py-1"
              >
                {p.prenom}
              </span>
            ))}

          </div>

        </div>

      )}

    </main>

  )

}