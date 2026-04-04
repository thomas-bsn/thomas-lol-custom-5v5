export type DBPlayer = {
  prenom: string
  riotId: string
  rankTier?: string
  rankDivision?: number | null
  lp?: number | null
  peakTier?: string | null
  peakDivision?: number | null
  peakLp?: number | null
}