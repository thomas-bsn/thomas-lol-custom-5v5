import { DBPlayer } from "./types"

export async function loadPlayers(): Promise<DBPlayer[]> {
  const res = await fetch("http://localhost:5221/players")
  if (!res.ok) throw new Error(`Failed to fetch players: ${res.status}`)
  return res.json()
}