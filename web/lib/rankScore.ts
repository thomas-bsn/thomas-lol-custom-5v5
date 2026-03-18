export const RANK_SCORE: Record<string, number> = {
  IRON: 800,
  BRONZE: 1000,
  SILVER: 1200,
  GOLD: 1450,
  PLATINUM: 1700,
  EMERALD: 2000,
  DIAMOND: 2300,
  MASTER: 2600,
  GRANDMASTER: 2900,
};

const DIVISION_BONUS: Record<string, number> = {
  I: 75,
  II: 50,
  III: 25,
  IV: 0,
};

export function getPlayerScore(player: any): number {
  const tier = player.tier?.toUpperCase();
  const division = player.rank; // "I", "II", "III", "IV"

  const base = RANK_SCORE[tier];

  // Master+ n'a pas de division
  if (base === undefined) return player.mmr ?? 1500;
  if (tier === "MASTER" || tier === "GRANDMASTER" || tier === "CHALLENGER") {
    return RANK_SCORE[tier] + (player.leaguePoints ?? 0);
  }

  const bonus = DIVISION_BONUS[division] ?? 0;
  return base + bonus;
}