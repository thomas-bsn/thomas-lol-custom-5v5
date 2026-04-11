"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TIER_ORDER } from "@/lib/tierOrder";

type Player = {
  id: number;
  prenom: string;
  riotId: string;
  rankTier: string | null;
  rankDivision: number | null;
  lp: number | null;
  peakTier: string | null;
  peakDivision: number | null;
  peakLp: number | null;
  mainRole: string | null;
  peakSeason: string | null;
  currentCost: number;
  isPlacement: boolean;
};

const TIERS = [
  "CHALLENGER", "GRANDMASTER", "MASTER", "DIAMOND",
  "EMERALD", "PLATINUM", "GOLD", "SILVER", "BRONZE", "IRON", "UNRANKED",
] as const;

const COST_TIERS = ["SS", "S", "A", "B", "C", "D"] as const;

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

const COST_TIER_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  SS: { text: "#FF5050", bg: "rgba(255,80,80,0.08)", border: "rgba(255,80,80,0.2)" },
  S:  { text: "#FFD700", bg: "rgba(255,215,0,0.08)", border: "rgba(255,215,0,0.2)" },
  A:  { text: "#50DC8C", bg: "rgba(80,220,140,0.08)", border: "rgba(80,220,140,0.2)" },
  B:  { text: "#50B4FF", bg: "rgba(80,180,255,0.08)", border: "rgba(80,180,255,0.2)" },
  C:  { text: "#B4BED2", bg: "rgba(180,190,210,0.08)", border: "rgba(180,190,210,0.2)" },
  D:  { text: "#78787A", bg: "rgba(120,120,130,0.08)", border: "rgba(120,120,130,0.2)" },
};

const DIVISIONS_LABEL = ["I", "II", "III", "IV"];

function getCostTierLabel(cost: number): string {
  if (cost === 6) return "SS";
  if (cost === 5) return "S";
  if (cost === 4) return "A";
  if (cost === 3) return "B";
  if (cost === 2) return "C";
  return "D";
}

function getRankScore(tier: string, division: number | null, lp: number | null): number {
  const tierScore = (TIER_ORDER[tier] ?? 0) * 400;
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);
  const divScore = isMasterPlus ? 0 : (4 - (division ?? 4)) * 100;
  return tierScore + divScore + (lp ?? 0);
}

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "0.04em" }}>
        RANG MOYEN
      </span>
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: colors.bg, border: `1px solid ${colors.border}`,
        borderRadius: "10px", padding: "7px 12px",
      }}>
        <img src={`/rank_icons/${avg.tier.toLowerCase()}.svg`} style={{ width: "22px", height: "22px", flexShrink: 0 }} />
        <span style={{ color: colors.text, fontWeight: 700, fontSize: "13px" }}>
          {tierLabel}{divLabel}
        </span>
        <span style={{
          color: "rgba(255,255,255,0.35)", fontSize: "12px",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          paddingLeft: "8px", marginLeft: "2px",
        }}>
          {avg.lp} LP
        </span>
      </div>
    </div>
  );
}

function AverageCostBadge({ players }: { players: Player[] }) {
  const avgCost = players.reduce((sum, p) => sum + p.currentCost, 0) / players.length;
  const tierLabel = getCostTierLabel(Math.round(avgCost));
  const colors = COST_TIER_COLORS[tierLabel];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "0.04em" }}>
        COST MOYEN
      </span>
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: colors.bg, border: `1px solid ${colors.border}`,
        borderRadius: "10px", padding: "7px 12px",
      }}>
        <span style={{ color: colors.text, fontWeight: 700, fontSize: "15px" }}>
          {tierLabel}
        </span>
        <span style={{
          color: "rgba(255,255,255,0.35)", fontSize: "12px",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          paddingLeft: "8px", marginLeft: "2px",
        }}>
          {avgCost.toFixed(1)} pts
        </span>
      </div>
    </div>
  );
}

export default function RankingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = (searchParams?.get("view") || "soloq") as "soloq" | "custom";

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/players`)
      .then(r => r.json())
      .then(data => {
        setPlayers(data.map((p: any) => ({
          ...p,
          currentCost: p.currentCost ?? 0,
          isPlacement: p.isPlacement ?? false,
        })));
        setLoading(false);
      });
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

  const playersByCost = useMemo(() => {
    const map: Record<string, Player[]> = {
      SS: [], S: [], A: [], B: [], C: [], D: [],
    };

    for (const p of players) {
      const tierLabel = getCostTierLabel(p.currentCost);
      map[tierLabel].push(p);
    }

    for (const tier of COST_TIERS) {
      map[tier].sort((a, b) => {
        if (a.isPlacement !== b.isPlacement) return a.isPlacement ? 1 : -1;
        return b.currentCost - a.currentCost;
      });
    }

    return map;
  }, [players]);

  const totalPlayers = players.length;

  const setView = (newView: "soloq" | "custom") => {
    router.push(`/rankings?view=${newView}`);
  };

  if (loading) {
    return <div style={{ padding: "32px", color: "rgba(255,255,255,0.4)" }}>Chargement…</div>;
  }

  return (
    <div style={{ padding: "0 48px 40px", width: "100%" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Classement</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: "4px", marginBottom: 0 }}>
            {view === "soloq" ? "Rangs officiels Riot Games" : "Système de cost pour draft équilibrée"}
            <span style={{ marginLeft: "12px", color: "rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ marginLeft: "12px" }}>{totalPlayers} joueurs</span>
          </p>
        </div>
        {view === "soloq" ? <AverageRankBadge players={players} /> : <AverageCostBadge players={players} />}
      </div>

      {/* Toggle */}
      <div style={{
        display: "flex", gap: "8px", marginBottom: "20px",
        background: "rgba(0,0,0,0.3)", padding: "4px",
        borderRadius: "12px", width: "fit-content",
      }}>
        <button
          onClick={() => setView("soloq")}
          style={{
            padding: "10px 20px", borderRadius: "8px", border: "none",
            background: view === "soloq" ? "rgba(255,255,255,0.1)" : "transparent",
            color: view === "soloq" ? "white" : "rgba(255,255,255,0.4)",
            fontWeight: 600, fontSize: "13px", cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          🏆 SoloQ Ranks
        </button>
        <button
          onClick={() => setView("custom")}
          style={{
            padding: "10px 20px", borderRadius: "8px", border: "none",
            background: view === "custom" ? "rgba(255,255,255,0.1)" : "transparent",
            color: view === "custom" ? "white" : "rgba(255,255,255,0.4)",
            fontWeight: 600, fontSize: "13px", cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          🎮 Custom Games
        </button>
      </div>

      {/* SoloQ View */}
      {view === "soloq" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {TIERS.map(tier => {
            const list = playersByTier[tier];
            if (!list || list.length === 0) return null;
            const colors = TIER_COLORS[tier];

            return (
              <div key={tier} style={{
                background: "rgba(0,0,0,0.3)", border: `1px solid ${colors.border}`,
                borderRadius: "14px", overflow: "hidden",
              }}>
                <div style={{
                  padding: "12px 18px", borderBottom: `1px solid ${colors.border}`,
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

                <div style={{ padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {list.map(p => {
                    const display = getDisplayRank(p)!;
                    const displayColors = TIER_COLORS[display.tier];

                    return (
                      <div key={p.riotId} style={{
                        width: "220px", background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "10px", padding: "12px 14px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <img src={`/rank_icons/${display.tier.toLowerCase()}.svg`} style={{ width: "20px", height: "20px", flexShrink: 0 }} />
                          <span style={{ color: "white", fontWeight: 600, fontSize: "14px", flex: 1 }}>{p.prenom}</span>
                          {p.mainRole && (
                            <img
                              src={`/role_icons/roleicon_${p.mainRole.toLowerCase()}.png`}
                              style={{ width: "16px", height: "16px", flexShrink: 0, opacity: 0.7 }}
                              title={p.mainRole}
                            />
                          )}
                          {display.isPeak && (
                            <span style={{
                              fontSize: "9px", fontWeight: 700, color: "rgba(255,185,50,0.9)",
                              background: "rgba(255,185,50,0.1)", border: "1px solid rgba(255,185,50,0.25)",
                              borderRadius: "4px", padding: "2px 5px", letterSpacing: "0.04em", flexShrink: 0,
                            }}>
                              PEAK ELO
                            </span>
                          )}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginBottom: "6px" }}>{p.riotId}</div>
                        <div style={{
                          color: displayColors.text, fontSize: "11px", fontWeight: 600,
                          background: displayColors.bg, border: `1px solid ${displayColors.border}`,
                          borderRadius: "5px", padding: "2px 8px", display: "inline-block",
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
      )}

      {/* Custom Games View */}
      {view === "custom" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {COST_TIERS.map(tier => {
            const list = playersByCost[tier];
            if (!list || list.length === 0) return null;
            const colors = COST_TIER_COLORS[tier];
            const costValue = tier === "SS" ? 6 : tier === "S" ? 5 : tier === "A" ? 4 : tier === "B" ? 3 : tier === "C" ? 2 : 1;

            return (
              <div key={tier} style={{
                background: "rgba(0,0,0,0.3)", border: `1px solid ${colors.border}`,
                borderRadius: "14px", overflow: "hidden",
              }}>
                <div style={{
                  padding: "12px 18px", borderBottom: `1px solid ${colors.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: colors.bg,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: colors.text, fontWeight: 700, fontSize: "18px" }}>{tier}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Tier</span>
                    <span style={{
                      color: colors.text, fontSize: "12px", fontWeight: 600,
                      background: "rgba(255,255,255,0.05)", padding: "2px 8px",
                      borderRadius: "6px", marginLeft: "4px",
                    }}>
                      {costValue} pts
                    </span>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                    {list.length} joueur{list.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div style={{ padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {list.map(p => {
                    const display = getDisplayRank(p);
                    const displayColors = TIER_COLORS[display.tier];

                    return (
                      <div key={p.riotId} style={{
                        width: "220px", background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "10px", padding: "12px 14px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{
                            color: colors.text, fontWeight: 700, fontSize: "16px",
                            width: "24px", textAlign: "center",
                          }}>
                            {tier}
                          </span>
                          <span style={{ color: "white", fontWeight: 600, fontSize: "14px", flex: 1 }}>{p.prenom}</span>
                          {p.isPlacement && (
                            <span style={{
                              fontSize: "9px", fontWeight: 700, color: "rgba(255,185,50,0.9)",
                              background: "rgba(255,185,50,0.1)", border: "1px solid rgba(255,185,50,0.25)",
                              borderRadius: "4px", padding: "2px 5px", letterSpacing: "0.04em", flexShrink: 0,
                            }}>
                              PLACEMENT
                            </span>
                          )}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginBottom: "6px" }}>{p.riotId}</div>
                        <div style={{
                          color: displayColors.text, fontSize: "11px", fontWeight: 600,
                          background: displayColors.bg, border: `1px solid ${displayColors.border}`,
                          borderRadius: "5px", padding: "2px 8px", display: "inline-block",
                        }}>
                          {getRankLabel(display.tier, display.division, display.lp)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}