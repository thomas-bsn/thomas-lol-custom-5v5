import { Player, Teams } from "../appState";

export function randomTeams(players: Player[]): Teams {

  const shuffled = [...players].sort(() => Math.random() - 0.5);

  const team1: Player[] = [];
  const team2: Player[] = [];

  shuffled.forEach((p, i) => {
    if (i % 2 === 0) team1.push(p);
    else team2.push(p);
  });

  return { team1, team2 };
}