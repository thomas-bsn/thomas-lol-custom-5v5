'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Player, PlayerDetails } from '@/lib/tier/types';
import { getPlayers, getPlayerDetailsById } from '@/lib/tier/api';

const DD_VERSION = '14.3.1';
const DEFAULT_AVATAR = '/profile.png';

function champIconUrl(key: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/champion/${encodeURIComponent(key)}.png`;
}

const ROLE_ICON: Record<string, string> = {
  top: 'position-top.svg',
  jungle: 'position-jungle.svg',
  mid: 'position-middle.svg',
  adc: 'position-bottom.svg',
  support: 'position-utility.svg',
};

function roleIconUrl(role: string) {
  const file = ROLE_ICON[role.toLowerCase()];
  if (!file) return null;
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/${file}`;
}

function Pill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'good' | 'mid' | 'bad';
}) {
  const cls =
    tone === 'good'
      ? 'bg-emerald-400/15 border-emerald-300/20 text-emerald-100'
      : tone === 'mid'
        ? 'bg-yellow-400/15 border-yellow-300/20 text-yellow-100'
        : tone === 'bad'
          ? 'bg-red-400/15 border-red-300/20 text-red-100'
          : 'bg-white/10 border-white/15 text-white/80';

  return (
    <span className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-[11px] border ${cls}`}>
      {children}
    </span>
  );
}

function stabilityLabel(sd: number) {
  if (sd < 6) return { label: 'Stable', tone: 'good' as const };
  if (sd <= 10) return { label: 'Moyen', tone: 'mid' as const };
  return { label: 'Instable', tone: 'bad' as const };
}

function mean(xs: number[]) {
  if (!Array.isArray(xs) || xs.length === 0) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

function stddev(xs: number[]) {
  if (!Array.isArray(xs) || xs.length < 2) return 0;
  const m = mean(xs);
  let v = 0;
  for (const x of xs) v += (x - m) ** 2;
  v = v / xs.length;
  return Math.sqrt(v);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Normalisation: ton JSON "ares.json" est au format nouveau schema.
// On convertit vers le format "preview-like" pour réutiliser le rendu.
function normalizeDetails(raw: any): {
  winrate?: number;
  recentScores: number[];
  roles: Array<{ role: string; games: number; avgScore: number }>;
  championsMostPlayed: Array<{ key: string; games: number; avgScore: number }>;
  championsBestPerfItems: Array<{ key: string; games: number; avgScore: number }>;
  minGamesBestPerf: number;
} {
  const winrate: number | undefined =
    typeof raw?.winrate === 'number'
      ? raw.winrate
      : typeof raw?.summary?.winrate === 'number'
        ? raw.summary.winrate
        : undefined;

  const recentScores: number[] =
    Array.isArray(raw?.recentScores)
      ? raw.recentScores
      : Array.isArray(raw?.recentScoresObj?.values)
        ? raw.recentScoresObj.values
        : Array.isArray(raw?.recentScores?.values)
          ? raw.recentScores.values
          : [];

  const roles =
    Array.isArray(raw?.roles)
      ? raw.roles
      : Array.isArray(raw?.roleStats)
        ? raw.roleStats
        : [];

  const championsMostPlayed =
    Array.isArray(raw?.champions?.mostPlayed)
      ? raw.champions.mostPlayed
      : Array.isArray(raw?.champStats)
        ? raw.champStats
        : [];

  const championsBestPerfItems =
    Array.isArray(raw?.champions?.bestPerformance?.items)
      ? raw.champions.bestPerformance.items
      : [];

  const minGamesBestPerf =
    raw?.champions?.bestPerformance?.minGamesRule?.clamp?.min ??
    0;

  return {
    winrate,
    recentScores,
    roles,
    championsMostPlayed,
    championsBestPerfItems,
    minGamesBestPerf,
  };
}

export default function PlayerPage() {
  const params = useParams<{ id: string }>();

  const id = useMemo(() => {
    const v = params?.id;
    if (!v) return '';
    return Array.isArray(v) ? v[0] : v;
  }, [params]);

  const [player, setPlayer] = useState<Player | null>(null);
  const [rawDetails, setRawDetails] = useState<PlayerDetails | any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) throw new Error('Paramètre route manquant (id vide).');

        const list = await getPlayers();
        if (cancelled) return;

        const p = list.find(x => x.id === id) ?? null;
        if (!p) throw new Error(`Joueur introuvable dans players.txt (id=${id})`);
        setPlayer(p);

        const d = await getPlayerDetailsById(id);
        if (cancelled) return;
        setRawDetails(d);
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const details = useMemo(() => (rawDetails ? normalizeDetails(rawDetails) : null), [rawDetails]);

  const computed = useMemo(() => {
    if (!player || !details) return null;

    const recent = details.recentScores;
    const sd = stddev(recent);
    const stab = stabilityLabel(sd);

    // Si ton JSON fournit déjà une règle minGames -> on l’utilise, sinon fallback comme preview
    const fallbackMinGames = clamp(Math.ceil(player.games * 0.2), 3, 10);
    const minGames = details.minGamesBestPerf > 0 ? details.minGamesBestPerf : fallbackMinGames;

    const bestPerf =
      details.championsBestPerfItems.length > 0
        ? details.championsBestPerfItems.slice(0, 5)
        : details.championsMostPlayed
            .filter(c => c.games >= minGames)
            .slice()
            .sort((a, b) => b.avgScore - a.avgScore || b.games - a.games)
            .slice(0, 5);

    return { sd, stab, minGames, bestPerf };
  }, [player, details]);

  if (loading) return <div className="p-10 text-white/70">Chargement…</div>;

  if (error) {
    return (
      <div className="min-h-screen p-10 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-red-300 font-semibold">Erreur</div>
          <div className="mt-2 text-white/70">{error}</div>
          <div className="mt-4">
            <Link className="underline text-white/80" href="/tier">
              Retour tier list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!player || !details || !computed) {
    return <div className="p-10 text-white/70">Aucune donnée.</div>;
  }

  return (
    <div className="min-h-screen p-6 md:p-10 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-white/50 text-sm">Joueur</div>
            <h1 className="text-3xl font-semibold">{player.name}</h1>
          </div>

          <Link
            href="/tier"
            className="text-white/70 hover:text-white px-3 py-2 rounded-xl border border-white/10 hover:border-white/20"
          >
            Retour tier list
          </Link>
        </div>

        {/* Header card */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center gap-4">
            <img
              src={player.avatarUrl || DEFAULT_AVATAR}
              alt={player.name}
              className="w-[76px] h-[76px] rounded-full object-cover border border-white/10 bg-white/5"
              onError={e => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
            <div className="min-w-0">
              <div className="text-xl font-semibold break-words">{player.name}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill>Cost {player.cost ?? '—'}</Pill>
                <Pill>Score {player.score.toFixed(1)}</Pill>
                <Pill>
                  <span className="capitalize">{player.mainRole ?? '—'}</span> · {player.games} games
                </Pill>
                {details.winrate != null && <Pill>Winrate {Math.round(details.winrate * 100)}%</Pill>}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Stability */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Stabilité</div>
              <Pill tone={computed.stab.tone}>{computed.stab.label}</Pill>
            </div>
            <div className="mt-2 text-white/60">
              Écart-type récent: <span className="text-white/85 font-semibold">{computed.sd.toFixed(1)}</span>
            </div>
            {details.recentScores.length < 4 && (
              <div className="mt-2 text-xs text-white/45">Peu de données: stabilité peu fiable.</div>
            )}
          </div>

          {/* Roles */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="text-lg font-semibold">Performance par rôle</div>
            <div className="mt-3 space-y-3">
              {details.roles.length === 0 ? (
                <div className="text-white/50 text-sm">Aucune donnée.</div>
              ) : (
                details.roles.map(r => {
                  const icon = roleIconUrl(r.role);
                  return (
                    <div key={r.role} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {icon ? (
                          <img src={icon} alt={r.role} className="w-6 h-6 opacity-90" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-white/10 border border-white/10" />
                        )}
                        <div className="capitalize text-white/85">{r.role}</div>
                      </div>
                      <div className="text-white/60 text-sm">
                        {r.games} games <span className="text-white/35">·</span>{' '}
                        <span className="text-white/85 font-semibold">{Number(r.avgScore).toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Most played */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="text-lg font-semibold">Most played champions</div>
            <div className="mt-3 space-y-3">
              {details.championsMostPlayed.length === 0 ? (
                <div className="text-white/50 text-sm">Aucune donnée.</div>
              ) : (
                details.championsMostPlayed.map(c => (
                  <div key={c.key} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={champIconUrl(c.key)}
                        alt={c.key}
                        className="w-9 h-9 rounded-lg border border-white/10 bg-white/5"
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="text-white/85 truncate">{c.key}</div>
                    </div>
                    <div className="text-white/60 text-sm">
                      {c.games} games <span className="text-white/35">·</span>{' '}
                      <span className="text-white/85 font-semibold">{Number(c.avgScore).toFixed(1)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Best perf */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold">Best performance champions</div>
              <Pill>min {computed.minGames} games</Pill>
            </div>

            <div className="mt-3 space-y-3">
              {computed.bestPerf.length === 0 ? (
                <div className="text-white/50 text-sm">
                  Aucun champion ne passe le seuil (min {computed.minGames} games).
                </div>
              ) : (
                computed.bestPerf.map(c => (
                  <div key={c.key} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={champIconUrl(c.key)}
                        alt={c.key}
                        className="w-9 h-9 rounded-lg border border-white/10 bg-white/5"
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="text-white/85 truncate">{c.key}</div>
                    </div>
                    <div className="text-white/60 text-sm">
                      <span className="text-white/85 font-semibold">{Number(c.avgScore).toFixed(1)}</span>{' '}
                      <span className="text-white/35">·</span> {c.games} games
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent scores */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="text-lg font-semibold">Derniers scores</div>
          <div className="mt-2 text-xs text-white/45">Lecture: gauche = plus ancien · droite = plus récent</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {details.recentScores.length === 0 ? (
              <div className="text-white/50 text-sm">Aucune donnée.</div>
            ) : (
              details.recentScores.slice(-10).map((s, i) => (
                <span
                  key={`${s}-${i}`}
                  className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white/85 text-sm"
                >
                  {s}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
