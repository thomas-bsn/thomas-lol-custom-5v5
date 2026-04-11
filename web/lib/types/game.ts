export type PendingGame = {
  id: number;
  playedAt: string;
  participants: { playerId: number; team: string; prenom: string }[];
};