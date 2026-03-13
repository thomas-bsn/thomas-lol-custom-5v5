import { Player } from "@/lib/appState"
import { RANK_SCORE } from "@/lib/rankScore"
import { DBPlayer } from "./types"

export function mapDBPlayer(p: DBPlayer): Player {

  const tier = p.rankTier ?? "Gold"
  const division = p.rankDivision ? ` ${p.rankDivision}` : ""

  return {
    prenom: p.prenom,
    rank: `${tier}${division}`,
    mmr: RANK_SCORE[tier] ?? 1500
  }
}