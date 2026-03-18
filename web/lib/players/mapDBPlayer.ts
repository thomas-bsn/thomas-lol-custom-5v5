import { Player } from "@/lib/appState"
import { RANK_SCORE } from "@/lib/rankScore"
import { DBPlayer } from "./types"

const DIVISION_BONUS: Record<number, number> = {
  1: 75,
  2: 50,
  3: 25,
  4: 0,
}

export function mapDBPlayer(p: DBPlayer): Player {
  const tier = (p.rankTier ?? "GOLD").toUpperCase()
  const base = RANK_SCORE[tier] ?? 1500

  let mmr = base

  if (tier === "MASTER" || tier === "GRANDMASTER" || tier === "CHALLENGER") {
    mmr = base + (p.lp ?? 0)
  } else if (p.rankDivision) {
    mmr = base + (DIVISION_BONUS[p.rankDivision] ?? 0)
  }

  return {
    prenom: p.prenom,
    rank: tier + (p.rankDivision ? ` ${p.rankDivision}` : ""),
    mmr
  }
}