import { Player } from "../appState";

export function otherTeam(t: 1 | 2): 1 | 2 {
  return t === 1 ? 2 : 1;
}

export function getTurn(firstPicker: 1 | 2, pickIndex: number): 1 | 2 {
  return pickIndex % 2 === 0 ? firstPicker : otherTeam(firstPicker);
}

export function teamScore(team: Player[]) {
  return team.reduce((sum, p) => sum + p.mmr, 0);
}

export function diffColor(diff: number) {
  if (diff > 700) return "text-red-400";
  if (diff > 300) return "text-yellow-400";
  return "text-green-400";
}

export function evaluatePick(
  player: Player,
  team1: Player[],
  team2: Player[],
  currentTurn: 1 | 2
) {
  const newTeam1 = currentTurn === 1 ? [...team1, player] : team1;
  const newTeam2 = currentTurn === 2 ? [...team2, player] : team2;

  const scoreA = teamScore(newTeam1);
  const scoreB = teamScore(newTeam2);

  const diff = Math.abs(scoreA - scoreB);

  return diff;
}

export function pickAdviceColor(diff: number) {

  if (diff <= 200) {
    return "bg-green-500 text-black"
  }

  if (diff <= 600) {
    return "bg-yellow-400 text-black"
  }

  if (diff <= 1200) {
    return "bg-orange-500 text-white"
  }

  if (diff <= 2000) {
    return "bg-red-600 text-white"
  }

  if (diff <= 3000) {
    return "bg-purple-600 text-white"
  }

  return "bg-pink-600 text-white"
}

export function diffLabel(diff: number) {
  if (diff <= 200) {
    return { text: "Équipes très équilibrées", color: "bg-green-500 text-black" }
  }

  if (diff <= 600) {
    return { text: "Équipes équilibrées", color: "bg-green-400 text-black" }
  }

  if (diff <= 1200) {
    return { text: "Équilibre correct", color: "bg-yellow-400 text-black" }
  }

  if (diff <= 2000) {
    return { text: "Équipes déséquilibrées", color: "bg-orange-500 text-white" }
  }

  return { text: "Équipes très déséquilibrées", color: "bg-red-600 text-white" }
}