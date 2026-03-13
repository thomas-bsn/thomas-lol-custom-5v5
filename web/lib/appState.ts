export type Mode = "roulette" | "draft" | "balanced";

export type Player = {
  prenom: string;
  rank: string;
  mmr: number;
};

export type Teams = {
  team1: Player[];
  team2: Player[];
};

export type RouletteSession = {
  remaining: Player[];
  history: Player[];
  lastPicked?: Player;
};

export type DraftSession = {
  phase: "captains" | "picking" | "done";

  captain1?: Player;
  captain2?: Player;

  firstPicker?: 1 | 2;

  available: Player[];
  team1: Player[];
  team2: Player[];

  pickIndex: number;
};

export type BalancedSession = {
  players: Player[];
};

export type Session =
  | { type: "roulette"; data: RouletteSession }
  | { type: "draft"; data: DraftSession }
  | { type: "balanced"; data: BalancedSession };

export type GameState = {
  status: "wip" | "running" | "ended";
  code?: string;
};

export type AppState = {
  version: 2;

  players: Player[];

  mode?: Mode;

  session?: Session;

  result?: Teams;

  game?: GameState;
};

const STORAGE_KEY = "team-picker-state";

export function loadState(): AppState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AppState;

    if (!parsed || parsed.version !== 2) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function normalizeForDupCheck(name: string): string {
  return normalizeName(name).toLocaleLowerCase("fr-FR");
}

export function createInitialState(players: Player[]): AppState {
  return {
    version: 2,
    players,
  };
}

export function createRouletteSession(players: Player[]): Session {
  return {
    type: "roulette",
    data: {
      remaining: [...players],
      history: [],
      lastPicked: undefined,
    },
  };
}

export function createDraftSession(players: Player[]): Session {
  return {
    type: "draft",
    data: {
      phase: "captains",

      captain1: undefined,
      captain2: undefined,

      firstPicker: undefined,

      available: [...players],
      team1: [],
      team2: [],

      pickIndex: 0,
    },
  };
}

export function createBalancedSession(players: Player[]): Session {
  return {
    type: "balanced",
    data: {
      players: [...players],
    },
  };
}

