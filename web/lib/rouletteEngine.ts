import { weightedPick } from "./weightedPick"
import { getPlayerScore } from "./rankScore"

export function pickPlayer(
  remaining: any[],
  teamA: any[],
  teamB: any[],
  balanced: boolean
) {
  if (!balanced) {
    return Math.floor(Math.random() * remaining.length)
  }

  const scoreA = teamA.reduce((s, p) => s + getPlayerScore(p), 0)
  const scoreB = teamB.reduce((s, p) => s + getPlayerScore(p), 0)

  const targetTeam = scoreA > scoreB ? "B" : "A"

  const weights = remaining.map((p) => {
    const mmr = getPlayerScore(p)

    if (targetTeam === "A") {
      return mmr
    } else {
      return 1 / (mmr + 1)
    }
  })

  return weightedPick(remaining, weights)
}