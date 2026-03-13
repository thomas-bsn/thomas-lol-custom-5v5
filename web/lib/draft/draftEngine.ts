import { Player } from "../appState";
import { getTurn } from "./draftUtils";

export function pickPlayer(
  available: Player[],
  team1: Player[],
  team2: Player[],
  firstPicker: 1 | 2,
  pickIndex: number,
  player: Player
) {
  const turn = getTurn(firstPicker, pickIndex);

  const nextAvailable = available.filter((p) => p !== player);

  const nextTeam1 = turn === 1 ? [...team1, player] : team1;
  const nextTeam2 = turn === 2 ? [...team2, player] : team2;

  return {
    available: nextAvailable,
    team1: nextTeam1,
    team2: nextTeam2,
    pickIndex: pickIndex + 1
  };
}