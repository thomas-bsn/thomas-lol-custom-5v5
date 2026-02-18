// lib/tier/stats.ts
import type { ChampStat, RoleStat, PlayerDetails } from './types';

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function mean(xs: number[]) {
  if (!Array.isArray(xs) || xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function stddev(xs: number[]) {
  if (!Array.isArray(xs) || xs.length < 2) return 0;
  const m = mean(xs);
  const v = xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / xs.length;
  return Math.sqrt(v);
}

export function stabilityLabel(sd: number) {
  if (sd < 6) return { label: 'Stable', tone: 'good' as const };
  if (sd <= 10) return { label: 'Moyen', tone: 'mid' as const };
  return { label: 'Instable', tone: 'bad' as const };
}

// ---------- Normalisation ----------

function toNumberArray(raw: unknown): number[] {
  if (Array.isArray(raw)) {
    return raw.map(Number).filter((n: number) => Number.isFinite(n));
  }

  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map(s => Number(s.trim()))
      .filter((n: number) => Number.isFinite(n));
  }

  if (raw && typeof raw === 'object' && Array.isArray((raw as any).values)) {
    return (raw as any).values.map(Number).filter((n: number) => Number.isFinite(n));
  }

  return [];
}

function normalizeRoleStats(raw: unknown): RoleStat[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((r: any): RoleStat => ({
      role: String(r?.role ?? '').trim(),
      games: Number.isFinite(Number(r?.games)) ? Number(r.games) : 0,
      avgScore: Number.isFinite(Number(r?.avgScore)) ? Number(r.avgScore) : 0,
    }))
    .filter((r: RoleStat) => r.role.length > 0)
    .sort((a, b) => b.games - a.games);
}

export function normalizeChampStats(raw: unknown): ChampStat[] {
  // raw peut être:
  // - details.champStats (array)
  // - { champStats: [...] }
  const arr = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as any)?.champStats)
      ? (raw as any).champStats
      : [];

  return arr
    .map((c: any): ChampStat => ({
      // ton type attend "key". On accepte plusieurs noms d'entrée possibles.
      key: String(c?.key ?? c?.name ?? c?.champ ?? c?.champion ?? '').trim(),
      games: Number.isFinite(Number(c?.games)) ? Number(c.games) : 0,
      avgScore: Number.isFinite(Number(c?.avgScore)) ? Number(c.avgScore) : 0,
    }))
    .filter((c: ChampStat) => c.key.length > 0);
}

export function normalizeDetails(raw: any): PlayerDetails {
  const winrateRaw = raw?.winrate ?? raw?.global?.winrate;
  const winrate =
    winrateRaw == null || Number.isNaN(Number(winrateRaw)) ? undefined : Number(winrateRaw);

  const recentScores = toNumberArray(
    raw?.recentScores ?? raw?.scores?.recent ?? raw?.lastScores ?? raw?.recent?.scores
  );

  const roleStats = normalizeRoleStats(
    raw?.roleStats ?? raw?.roles ?? raw?.byRole ?? raw?.rolePerformance
  );

  const champStats = normalizeChampStats(raw?.champStats ?? raw?.champions ?? raw?.byChampion);

  return { winrate, recentScores, roleStats, champStats };
}

// ---------- Champions compute ----------

export function computeChampions(champStats: ChampStat[], totalGames: number) {
  const safe: ChampStat[] = Array.isArray(champStats) ? champStats : [];

  const minGamesBestPerf = clamp(Math.ceil((totalGames || 0) * 0.2), 3, 10);

  const mostPlayed = [...safe]
    .sort((a, b) => b.games - a.games || b.avgScore - a.avgScore)
    .slice(0, 5);

  const bestPerf = [...safe]
    .filter((c: ChampStat) => c.games >= minGamesBestPerf)
    .sort((a, b) => b.avgScore - a.avgScore || b.games - a.games)
    .slice(0, 5);

  return { minGamesBestPerf, mostPlayed, bestPerf };
}
