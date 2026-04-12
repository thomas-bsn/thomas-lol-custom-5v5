export type PendingGame = {
  id: number;
  playedAt: string;
  seriesId?: number | null;
  participants: { playerId: number; team: string; prenom: string }[];
};