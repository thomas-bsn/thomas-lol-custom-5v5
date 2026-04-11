import type { AppState, GameTeams } from "@/lib/appState";

export async function launchGame(
  state: AppState,
  teams: GameTeams,
  update: (s: AppState) => void,
  router: { push: (path: string) => void }
) {
  const body = {
    blueTeam: teams.blue.map(p => p.id),
    redTeam: teams.red.map(p => p.id),
  };

  console.log("POST body:", JSON.stringify(body, null, 2));

  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/game/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const fakeCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  update({ ...state, game: { status: "running", code: fakeCode, teams } });
  router.push("/game");
}