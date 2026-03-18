"use client";

import { useEffect, useMemo, useState } from "react";

type Player = {
  prenom: string
  riotId: string
  rankTier: string
  rankDivision: number | null
  lp: number | null
}

const TIERS = [
  "CHALLENGER", "GRANDMASTER", "MASTER", "DIAMOND",
  "EMERALD", "PLATINUM", "GOLD", "SILVER", "BRONZE", "IRON"
] as const;

const TIER_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  CHALLENGER:  { text: "#FFD700", bg: "rgba(255,215,0,0.08)",  border: "rgba(255,215,0,0.2)" },
  GRANDMASTER: { text: "#FF5050", bg: "rgba(255,80,80,0.08)",  border: "rgba(255,80,80,0.2)" },
  MASTER:      { text: "#B450FF", bg: "rgba(180,80,255,0.08)", border: "rgba(180,80,255,0.2)" },
  DIAMOND:     { text: "#50B4FF", bg: "rgba(80,180,255,0.08)", border: "rgba(80,180,255,0.2)" },
  EMERALD:     { text: "#50DC8C", bg: "rgba(80,220,140,0.08)", border: "rgba(80,220,140,0.2)" },
  PLATINUM:    { text: "#50C8B4", bg: "rgba(80,200,180,0.08)", border: "rgba(80,200,180,0.2)" },
  GOLD:        { text: "#FFB932", bg: "rgba(255,185,50,0.08)", border: "rgba(255,185,50,0.2)" },
  SILVER:      { text: "#B4BED2", bg: "rgba(180,190,210,0.08)",border: "rgba(180,190,210,0.2)" },
  BRONZE:      { text: "#B46E3C", bg: "rgba(180,110,60,0.08)", border: "rgba(180,110,60,0.2)" },
  IRON:        { text: "#78787A", bg: "rgba(120,120,130,0.08)",border: "rgba(120,120,130,0.2)" },
};

function getRankLabel(p: Player) {
  const isMasterPlus = p.rankTier === "MASTER" || p.rankTier === "GRANDMASTER" || p.rankTier === "CHALLENGER";
  const tierLabel = p.rankTier.charAt(0) + p.rankTier.slice(1).toLowerCase();
  if (isMasterPlus) return `${tierLabel} — ${p.lp ?? 0} LP`;
  return `${tierLabel} ${p.rankDivision ?? ""} — ${p.lp ?? 0} LP`;
}

export default function TierPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/players`)
      .then(r => r.json())
      .then(data => { setPlayers(data); setLoading(false); })
  }, [])

  const playersByTier = useMemo(() => {
    const map: Record<string, Player[]> = {}
    for (const tier of TIERS) map[tier] = []
    for (const p of players) { if (map[p.rankTier]) map[p.rankTier].push(p); }
    for (const tier of TIERS) {
      map[tier].sort((a, b) => {
        if (a.rankDivision === null && b.rankDivision === null) return (b.lp ?? 0) - (a.lp ?? 0);
        const divA = a.rankDivision ?? 999;
        const divB = b.rankDivision ?? 999;
        if (divA !== divB) return divA - divB;
        return (b.lp ?? 0) - (a.lp ?? 0);
      });
    }
    return map;
  }, [players])

  if (loading) {
    return <div style={{ padding: "32px", color: "rgba(255,255,255,0.4)" }}>Chargement…</div>
  }

  return (
    <div style={{ padding: "0 48px 40px", width: "100%" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Tier List</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: "4px" }}>Classement des joueurs par rang</p>
        </div>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>{players.length} joueurs</span>
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
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{list.length} joueur{list.length > 1 ? "s" : ""}</span>
              </div>

              {/* Cards */}
              <div style={{ padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {list.map(p => (
                  <div key={p.riotId} style={{
                    width: "220px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <img src={`/rank_icons/${p.rankTier.toLowerCase()}.svg`} style={{ width: "20px", height: "20px", flexShrink: 0 }} />
                      <span style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>{p.prenom}</span>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginBottom: "6px" }}>{p.riotId}</div>
                    <div style={{
                      color: colors.text,
                      fontSize: "11px", fontWeight: 600,
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "5px",
                      padding: "2px 8px",
                      display: "inline-block",
                    }}>
                      {getRankLabel(p)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}