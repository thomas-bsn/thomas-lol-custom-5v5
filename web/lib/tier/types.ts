export type Player = {
  id: string;          // slug stable pour URL + fichier JSON
  name: string;

  cost: number | null;
  score: number;
  games: number;

  mainRole?: string;
  roles?: string[];
  avatarUrl?: string;
};

export type RoleStat = { role: string; games: number; avgScore: number };

export type ChampStat = { key: string; games: number; avgScore: number };

export type PlayerDetails = {
  winrate?: number; // 0..1

  // format "preview" ou "new schema", on normalise dans la page
  recentScores?: number[];
  roleStats?: RoleStat[];
  champStats?: ChampStat[];

  // nouveau schema mock (celui que tu montres)
  recentScoresObj?: { order?: string; values?: number[] };
  roles?: Array<{ role: string; games: number; avgScore: number }>;
  champions?: {
    mostPlayed?: ChampStat[];
    bestPerformance?: {
      minGamesRule?: { clamp?: { min?: number; max?: number } };
      items?: ChampStat[];
    };
  };
};
