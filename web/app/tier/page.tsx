'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Player } from '@/lib/tier/types';
import { getPlayers } from '@/lib/tier/api';

const COSTS = [7, 6, 5, 4, 3, 2, 1] as const;
const PLACEMENT_MIN_GAMES = 4;
const PLACEMENT_DEFAULT_COST = 1;
const DEFAULT_AVATAR = '/profile.png';

function AvatarCover({ src, alt }: { src?: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_AVATAR);

  useEffect(() => {
    setImgSrc(src || DEFAULT_AVATAR);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className="w-full h-[160px] object-cover"
      onError={() => {
        if (imgSrc !== DEFAULT_AVATAR) setImgSrc(DEFAULT_AVATAR);
      }}
    />
  );
}

function PlacementBadge() {
  return (
    <div
      className="
        inline-flex items-center gap-1
        px-3 py-1
        rounded-full
        text-[11px] font-semibold uppercase tracking-wide
        bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500
        text-black
        shadow-[0_0_12px_rgba(255,180,0,0.6)]
      "
    >
      ⚠ Placement
    </div>
  );
}

export default function TierPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await getPlayers();
        if (!cancelled) setPlayers(list);
      } catch (e) {
        if (!cancelled) setError(`Impossible de charger la liste (${String(e)})`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const playersByCost = useMemo(() => {
    const map: Record<number, Player[]> = {};
    for (const c of COSTS) map[c] = [];

    for (const p of players) {
      const isPlacement = p.games < PLACEMENT_MIN_GAMES || !p.cost;
      const targetCost = isPlacement ? PLACEMENT_DEFAULT_COST : (p.cost as number);
      if (map[targetCost]) map[targetCost].push(p);
    }

    for (const c of COSTS) {
      map[c].sort((a, b) => b.score - a.score);
    }

    return map;
  }, [players]);

  if (loading) return <div className="p-8 text-white/70">Chargement…</div>;

  if (error) {
    return (
      <div className="p-8 text-white/70">
        <div className="text-red-300 font-medium">Erreur</div>
        <div className="mt-2 text-white/60">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Tier List</h1>
        <div className="text-sm text-white/50">{players.length} joueurs</div>
      </div>

      {COSTS.map(cost => {
        const list = playersByCost[cost];

        return (
          <div
            className="
              w-full max-w-[1600px] mx-auto
              rounded-2xl border border-white/10 bg-black/25 overflow-hidden
            "
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg font-semibold text-white">Cost {cost}</div>
                <div className="text-sm text-white/50">{list.length} joueurs</div>
              </div>
            </div>

            <div className="p-5">
              {list.length === 0 ? (
                <div className="text-white/40 italic">Aucun joueur</div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {list.map(p => {
                    const isPlacement = p.games < PLACEMENT_MIN_GAMES || !p.cost;

                    return (
                      <Link
                        key={p.id}
                        href={`/tier/players/${encodeURIComponent(p.id)}`}
                        className="
                          text-left
                          w-full sm:w-[280px]
                          rounded-2xl overflow-hidden
                          bg-white/5 border border-white/10
                          hover:bg-white/7 hover:border-white/15
                          transition
                        "
                      >
                        <div className="relative">
                          <AvatarCover src={p.avatarUrl} alt={p.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-white font-semibold leading-snug break-words">
                                {p.name}
                              </div>
                              <div className="text-sm text-white/60 mt-1">
                                <span className="capitalize">{p.mainRole ?? '-'}</span>
                                <span className="text-white/35"> · </span>
                                <span>{p.games} games</span>
                              </div>
                            </div>

                            {!isPlacement && (
                              <div className="text-right shrink-0">
                                <div className="text-white font-semibold text-xl leading-none">
                                  {p.score.toFixed(1)}
                                </div>
                                <div className="text-xs text-white/40">score</div>
                              </div>
                            )}
                          </div>

                          {isPlacement && (
                            <div className="pt-1">
                              <PlacementBadge />
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
