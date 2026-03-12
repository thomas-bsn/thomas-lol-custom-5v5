export type Mode = "roulette" | "draft" | "balancedRoulette";

export type Player = {
  prenom: string;
  rank: string;
  mmr: number;
};

export type AppState = {
  version: 1;
  players: Player[];

  mode?: Mode;

  roulette?: {
    remaining: Player[];
    history: Player[];
    lastPicked?: Player;
  };

  draft?: {
    phase: "captains" | "picking" | "done";

    captain1?: Player;
    captain2?: Player;

    firstPicker?: 1 | 2;

    available: Player[];
    team1: Player[];
    team2: Player[];

    pickIndex: number;
  };

  teams?: {
    team1: Player[];
    team2: Player[];
    validated: boolean;
    source: "roulette" | "draft" | "balanced";
  };

  game?: {
    status: "wip" | "running" | "ended";
    code?: string;
  };
};

const STORAGE_KEY = "team-picker-state";

export function loadState(): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== 1) return null;
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
    version: 1,
    players,
    mode: undefined,

    roulette: {
      remaining: [...players],
      history: [],
      lastPicked: undefined,
    },

    draft: {
      phase: "captains",
      captain1: undefined,
      captain2: undefined,
      firstPicker: undefined,

      available: [...players],
      team1: [],
      team2: [],
      pickIndex: 0,
    },

    teams: undefined,
  };
}

export function createDraftState(players: Player[]): AppState["draft"] {
  return {
    phase: "captains",
    captain1: undefined,
    captain2: undefined,
    firstPicker: undefined,

    available: [...players],
    team1: [],
    team2: [],
    pickIndex: 0,
  };
}