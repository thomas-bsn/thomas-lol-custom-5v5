import { DBPlayer } from "./types"

export async function loadPlayers(): Promise<DBPlayer[]> {
  const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/players")
  if (!res.ok) throw new Error(`Failed to fetch players: ${res.status}`)
  return res.json()
}