export const RANK_SCORE: Record<string, number> = {
  Iron: 800,
  Bronze: 1000,
  Silver: 1200,
  Gold: 1450,
  Platinum: 1700,
  Emerald: 2000,
  Diamond: 2300,
  Master: 2600,
  Grandmaster: 2900,
};

export function getPlayerScore(player: any) {
  return RANK_SCORE[player.rankTier] ?? 1000;
}