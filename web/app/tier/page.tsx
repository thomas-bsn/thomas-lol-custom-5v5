"use client";

import { useEffect, useMemo, useState } from "react";

type Player = {
  prenom: string;
  riotId: string;
  rankTier: string | null;
  rankDivision: number | null;
  lp: number | null;
  peakTier: string | null;
  peakDivision: number | null;
  peakLp: number | null;
  peakSeason: string | null;
};

const TIERS = [
  "CHALLENGER", "GRANDMASTER", "MASTER", "DIAMOND",
  "EMERALD", "PLATINUM", "GOLD", "SILVER", "BRONZE", "IRON", "UNRANKED",
] as const;

const TIER_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  CHALLENGER:  { text: "#FFD700", bg: "rgba(255,215,0,0.08)",   border: "rgba(255,215,0,0.2)" },
  GRANDMASTER: { text: "#FF5050", bg: "rgba(255,80,80,0.08)",   border: "rgba(255,80,80,0.2)" },
  MASTER:      { text: "#B450FF", bg: "rgba(180,80,255,0.08)",  border: "rgba(180,80,255,0.2)" },
  DIAMOND:     { text: "#50B4FF", bg: "rgba(80,180,255,0.08)",  border: "rgba(80,180,255,0.2)" },
  EMERALD:     { text: "#50DC8C", bg: "rgba(80,220,140,0.08)",  border: "rgba(80,220,140,0.2)" },
  PLATINUM:    { text: "#50C8B4", bg: "rgba(80,200,180,0.08)",  border: "rgba(80,200,180,0.2)" },
  GOLD:        { text: "#FFB932", bg: "rgba(255,185,50,0.08)",  border: "rgba(255,185,50,0.2)" },
  SILVER:      { text: "#B4BED2", bg: "rgba(180,190,210,0.08)", border: "rgba(180,190,210,0.2)" },
  BRONZE:      { text: "#B46E3C", bg: "rgba(180,110,60,0.08)",  border: "rgba(180,110,60,0.2)" },
  IRON:        { text: "#78787A", bg: "rgba(120,120,130,0.08)", border: "rgba(120,120,130,0.2)" },
  UNRANKED:    { text: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)" },
};

const DIVISIONS_LABEL = ["I", "II", "III", "IV"];

const TIER_ORDER: Record<string, number> = {
  IRON: 0, BRONZE: 1, SILVER: 2, GOLD: 3, PLATINUM: 4,
  EMERALD: 5, DIAMOND: 6, MASTER: 7, GRANDMASTER: 8, CHALLENGER: 9,
};

// Score numérique d'un tier+division+lp pour calculer la moyenne
// Chaque tier vaut 400 pts, chaque division 100 pts
function getRankScore(tier: string, division: number | null, lp: number | null): number {
  const tierScore = (TIER_ORDER[tier] ?? 0) * 400;
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);
  const divScore = isMasterPlus ? 0 : (4 - (division ?? 4)) * 100;
  return tierScore + divScore + (lp ?? 0);
}

// Convertit un score numérique en tier+division+lp
function scoreToRank(score: number): { tier: string; division: number | null; lp: number } {
  const tierIndex = Math.min(Math.floor(score / 400), 9);
  const tierName = Object.keys(TIER_ORDER).find(t => TIER_ORDER[t] === tierIndex) ?? "IRON";
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tierName);
  const remainder = score - tierIndex * 400;
  if (isMasterPlus) {
    return { tier: tierName, division: null, lp: Math.round(remainder) };
  }
  const division = 4 - Math.min(Math.floor(remainder / 100), 3);
  const lp = Math.round(remainder % 100);
  return { tier: tierName, division, lp };
}

function getDisplayRank(p: Player) {
  const hasCurrentRank = p.rankTier && p.rankTier !== "UNRANKED";
  const hasPeak = !!p.peakTier;

  if (hasCurrentRank && hasPeak) {
    const currentOrder = TIER_ORDER[p.rankTier!] ?? -1;
    const peakOrder = TIER_ORDER[p.peakTier!] ?? -1;
    if (peakOrder > currentOrder)
      return { tier: p.peakTier!, division: p.peakDivision, lp: p.peakLp, isPeak: true };
    return { tier: p.rankTier!, division: p.rankDivision, lp: p.lp, isPeak: false };
  }
  if (hasCurrentRank)
    return { tier: p.rankTier!, division: p.rankDivision, lp: p.lp, isPeak: false };
  if (hasPeak)
    return { tier: p.peakTier!, division: p.peakDivision, lp: p.peakLp, isPeak: p.peakTier !== "UNRANKED" };
  return { tier: "UNRANKED", division: null, lp: null, isPeak: false };
}

function getRankLabel(tier: string, division: number | null, lp: number | null) {
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);
  const tierLabel = tier.charAt(0) + tier.slice(1).toLowerCase();
  if (isMasterPlus) return `${tierLabel} — ${lp ?? 0} LP`;
  const divLabel = division != null ? DIVISIONS_LABEL[division - 1] : "";
  return `${tierLabel} ${divLabel} — ${lp ?? 0} LP`;
}

// Composant badge rang moyen
function AverageRankBadge({ players }: { players: Player[] }) {
  const ranked = players.filter(p => {
    const d = getDisplayRank(p);
    return d.tier !== "UNRANKED";
  });

  if (ranked.length === 0) return null;

  const avgScore = ranked.reduce((sum, p) => {
    const d = getDisplayRank(p);
    return sum + getRankScore(d.tier, d.division, d.lp);
  }, 0) / ranked.length;

  const avg = scoreToRank(avgScore);
  const colors = TIER_COLORS[avg.tier];
  const tierLabel = avg.tier.charAt(0) + avg.tier.slice(1).toLowerCase();
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(avg.tier);
  const divLabel = !isMasterPlus && avg.division != null ? " " + DIVISIONS_LABEL[avg.division - 1] : "";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "4px",
    }}>
      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "0.04em" }}>
        RANG MOYEN
      </span>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "10px",
        padding: "7px 12px",
      }}>
        <img
          src={`/rank_icons/${avg.tier.toLowerCase()}.svg`}
          style={{ width: "22px", height: "22px", flexShrink: 0 }}
        />
        <span style={{ color: colors.text, fontWeight: 700, fontSize: "13px" }}>
          {tierLabel}{divLabel}
        </span>
        <span style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: "12px",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          paddingLeft: "8px",
          marginLeft: "2px",
        }}>
          {avg.lp} LP
        </span>
      </div>
    </div>
  );
}

export default function TierPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/players`)
      .then(r => r.json())
      .then(data => { setPlayers(data); setLoading(false); });
  }, []);

  const playersByTier = useMemo(() => {
    const map: Record<string, Player[]> = {};
    for (const tier of TIERS) map[tier] = [];

    for (const p of players) {
      const display = getDisplayRank(p);
      if (display && map[display.tier]) map[display.tier].push(p);
    }

    for (const tier of TIERS) {
      map[tier].sort((a, b) => {
        const dA = getDisplayRank(a);
        const dB = getDisplayRank(b);
        const divA = dA?.division ?? 999;
        const divB = dB?.division ?? 999;
        if (divA !== divB) return divA - divB;
        return (dB?.lp ?? 0) - (dA?.lp ?? 0);
      });
    }
    return map;
  }, [players]);

  const totalPlayers = useMemo(
    () => players.filter(p => getDisplayRank(p) !== null).length,
    [players]
  );

  if (loading) {
    return <div style={{ padding: "32px", color: "rgba(255,255,255,0.4)" }}>Chargement…</div>;
  }

  return (
    <div style={{ padding: "0 48px 40px", width: "100%" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Tier List</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: "4px", marginBottom: 0 }}>
            Classement des joueurs par rang
            <span style={{ marginLeft: "12px", color: "rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ marginLeft: "12px" }}>{totalPlayers} joueurs</span>
          </p>
        </div>
        <AverageRankBadge players={players} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {TIERS.map(tier => {
          const list = playersByTier[tier];
          if (!list || list.length === 0) return null;
          const colors = TIER_COLORS[tier];

          return (
            <div key={tier} style={{
              background: "rgba(0,0,0,0.3)",
              border: `1px solid ${colors.border}`,
              borderRadius: "14px",
              overflow: "hidden",
            }}>
              {/* Header tier */}
              <div style={{
                padding: "12px 18px",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: colors.bg,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={`/rank_icons/${tier.toLowerCase()}.svg`} style={{ width: "28px", height: "28px" }} />
                  <span style={{ color: colors.text, fontWeight: 700, fontSize: "14px", letterSpacing: "0.02em" }}>
                    {tier.charAt(0) + tier.slice(1).toLowerCase()}
                  </span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                  {list.length} joueur{list.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Cards */}
              <div style={{ padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {list.map(p => {
                  const display = getDisplayRank(p)!;
                  const displayColors = TIER_COLORS[display.tier];

                  return (
                    <div key={p.riotId} style={{
                      width: "220px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <img src={`/rank_icons/${display.tier.toLowerCase()}.svg`} style={{ width: "20px", height: "20px", flexShrink: 0 }} />
                        <span style={{ color: "white", fontWeight: 600, fontSize: "14px", flex: 1 }}>{p.prenom}</span>
                        {display.isPeak && (
                          <span style={{
                            fontSize: "9px", fontWeight: 700,
                            color: "rgba(255,185,50,0.9)",
                            background: "rgba(255,185,50,0.1)",
                            border: "1px solid rgba(255,185,50,0.25)",
                            borderRadius: "4px",
                            padding: "2px 5px",
                            letterSpacing: "0.04em",
                            flexShrink: 0,
                          }}>
                            PEAK ELO
                          </span>
                        )}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginBottom: "6px" }}>{p.riotId}</div>
                      <div style={{
                        color: displayColors.text,
                        fontSize: "11px", fontWeight: 600,
                        background: displayColors.bg,
                        border: `1px solid ${displayColors.border}`,
                        borderRadius: "5px",
                        padding: "2px 8px",
                        display: "inline-block",
                      }}>
                        {getRankLabel(display.tier, display.division, display.lp)}
                        {display.isPeak && p.peakSeason && (
                          <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: "4px" }}>
                            — {p.peakSeason}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}