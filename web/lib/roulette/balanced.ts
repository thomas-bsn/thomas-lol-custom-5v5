import { Player, Teams } from "../appState";
import { getPlayerScore } from "../rankScore";

export function balancedTeams(players: Player[]): Teams {

  const sorted = [...players].sort(
    (a, b) => getPlayerScore(b) - getPlayerScore(a)
  );

  const team1: Player[] = [];
  const team2: Player[] = [];

  let score1 = 0;
  let score2 = 0;

  for (const p of sorted) {
    const score = getPlayerScore(p);

    if (score1 <= score2) {
      team1.push(p);
      score1 += score;
    } else {
      team2.push(p);
      score2 += score;
    }
  }

  return { team1, team2 };
}