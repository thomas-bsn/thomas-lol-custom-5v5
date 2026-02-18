'use client';

import { useMemo } from 'react';

const DD_VERSION = '14.3.1';
const DEFAULT_AVATAR = '/profile.png';

function champIconUrl(key: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/champion/${encodeURIComponent(
    key
  )}.png`;
}

// Mapping explicite. Les noms exacts des fichiers CommunityDragon peuvent varier.
// Si une icône ne charge pas, ouvre l’URL et ajuste le nom ici.
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

export default function PreviewPlayerPage() {
  // Données mock: tu changes vite fait les keys si tu veux
  const player = {
    name: 'ARES',
    cost: 6,
    score: 73.4,
    games: 11,
    mainRole: 'top',
    avatarUrl: DEFAULT_AVATAR,
  };

  const details = {
    winrate: 0.64,
    recentScores: [69, 72, 74, 73, 76, 71, 74, 70, 75, 73],
    roles: [
      { role: 'top', games: 7, avgScore: 74.2 },
      { role: 'jungle', games: 4, avgScore: 69.1 },
    ],
    champions: {
      mostPlayed: [
        { key: 'Darius', games: 5, avgScore: 75.0 },
        { key: 'Garen', games: 4, avgScore: 70.2 },
        { key: 'Jax', games: 3, avgScore: 72.4 },
        { key: 'Renekton', games: 3, avgScore: 68.0 },
        { key: 'Ornn', games: 2, avgScore: 66.5 },
      ],
    },
  };

  const computed = useMemo(() => {
    const recent = details.recentScores;
    const sd = stddev(recent);
    const stab = stabilityLabel(sd);

    // "Best performance" calculé en live pour la visu
    const minGames = clamp(Math.ceil(player.games * 0.2), 3, 10);
    const bestPerf = details.champions.mostPlayed
      .filter(c => c.games >= minGames)
      .slice()
      .sort((a, b) => b.avgScore - a.avgScore || b.games - a.games)
      .slice(0, 5);

    return { sd, stab, minGames, bestPerf };
  }, [player.games]);

  return (
    <div className="min-h-screen p-6 md:p-10 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-white/50 text-sm">Preview page</div>
            <h1 className="text-3xl font-semibold">Joueur</h1>
          </div>

          <a
            href="/tier"
            className="text-white/70 hover:text-white px-3 py-2 rounded-xl border border-white/10 hover:border-white/20"
          >
            Retour tier list
          </a>
        </div>

        {/* Header card */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center gap-4">
            <img
              src={player.avatarUrl}
              alt={player.name}
              className="w-[76px] h-[76px] rounded-full object-cover border border-white/10 bg-white/5"
            />
            <div className="min-w-0">
              <div className="text-xl font-semibold break-words">{player.name}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill>Cost {player.cost}</Pill>
                <Pill>Score {player.score.toFixed(1)}</Pill>
                <Pill>
                  <span className="capitalize">{player.mainRole}</span> · {player.games} games
                </Pill>
                <Pill>Winrate {Math.round(details.winrate * 100)}%</Pill>
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
              {details.roles.map(r => {
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
                      <span className="text-white/85 font-semibold">{r.avgScore.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Most played */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="text-lg font-semibold">Most played champions</div>
            <div className="mt-3 space-y-3">
              {details.champions.mostPlayed.map(c => (
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
                    <span className="text-white/85 font-semibold">{c.avgScore.toFixed(1)}</span>
                  </div>
                </div>
              ))}
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
                      <span className="text-white/85 font-semibold">{c.avgScore.toFixed(1)}</span>{' '}
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
            {details.recentScores.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white/85 text-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
