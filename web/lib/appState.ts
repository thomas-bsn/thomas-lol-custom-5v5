export type Mode = "roulette" | "draft";

export type AppState = {
  version: 1;
  players: string[]; // length 10
  mode?: Mode;

  roulette?: {
    remaining: string[];
    history: string[];
    lastPicked?: string;
  };

  draft?: {
    phase: "captains" | "picking" | "done";
    captain1?: string;
    captain2?: string;

    // après pile ou face
    firstPicker?: 1 | 2; // 1 = team1 commence, 2 = team2 commence

    available: string[];
    team1: string[];
    team2: string[];
    pickIndex: number; // 0..7 (8 picks)
  };

  teams?: {
    team1: string[];
    team2: string[];
    validated: boolean;
    source: "roulette" | "draft";
  };

  game?: {
    status: "wip" | "running" | "ended";
    code?: string; // future: code reçu du backend
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

export function createInitialState(players: string[]): AppState {
  return {
    version: 1 as const,
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

export function createDraftState(players: string[]): AppState["draft"] {
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