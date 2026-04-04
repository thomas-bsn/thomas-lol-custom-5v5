import { Player } from "@/lib/appState"
import { RANK_SCORE } from "@/lib/rankScore"
import { DBPlayer } from "./types"
import { TIER_ORDER } from "@/lib/tierOrder"

const DIVISION_BONUS: Record<number, number> = {
  1: 75,
  2: 50,
  3: 25,
  4: 0,
}

export function mapDBPlayer(p: DBPlayer): Player {
  
  const currentTier = (p.rankTier ?? "GOLD").toUpperCase()
  const peakTier = p.peakTier?.toUpperCase()

  const usePeak = peakTier && peakTier !== "UNRANKED" &&
    (TIER_ORDER[peakTier] ?? -1) > (TIER_ORDER[currentTier] ?? -1)

  const tier = usePeak ? peakTier! : currentTier
  const division = usePeak ? p.peakDivision : p.rankDivision
  const lp = usePeak ? (p.peakLp ?? 0) : (p.lp ?? 0)

  const base = RANK_SCORE[tier] ?? 1500
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier)

  let mmr = base
  if (isMasterPlus) {
    mmr = base + lp
  } else if (division) {
    mmr = base + (DIVISION_BONUS[division] ?? 0)
  }

  return {
    prenom: p.prenom,
    rank: tier + (division ? ` ${division}` : ""),
    mmr
  }
}