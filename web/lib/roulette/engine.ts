import { Player, Teams } from "../appState";
import { randomTeams } from "./random";
import { balancedTeams } from "./balanced";

export function generateTeams(
  players: Player[],
  mode: "roulette" | "balanced"
): Teams {

  if (mode === "balanced") {
    return balancedTeams(players);
  }

  return randomTeams(players);
}