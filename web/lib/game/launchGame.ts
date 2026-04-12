import type { AppState, GameTeams } from "@/lib/appState";

export async function launchGame(
  state: AppState,
  teams: GameTeams,
  update: (s: AppState) => void,
  router: { push: (path: string) => void }
) {
  const seriesId = state.seriesId ?? null;
  const boFormat = !seriesId ? (state.boFormat ?? null) : null;

  console.log("launchGame payload", {
    blueTeam: teams.blue.map(p => p.id),
    redTeam: teams.red.map(p => p.id),
    seriesId,
    boFormat,
    stateBoFormat: state.boFormat,
  });

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/game/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blueTeam: teams.blue.map(p => p.id),
      redTeam: teams.red.map(p => p.id),
      seriesId,
      boFormat,
    }),
  });

  const data = await res.json();
  const fakeCode = Math.random().toString(36).slice(2, 8).toUpperCase();

  update({
    ...state,
    seriesId: data.seriesId ?? state.seriesId,
    game: { status: "running", code: fakeCode, teams, gameId: data.gameId },
  });

  router.push("/game");
}