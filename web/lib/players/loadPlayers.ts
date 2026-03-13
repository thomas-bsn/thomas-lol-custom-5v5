import { DBPlayer } from "./types"

export async function loadPlayers(): Promise<DBPlayer[]> {
  const res = await fetch("/mock/players_bdd.json")
  return res.json()
}