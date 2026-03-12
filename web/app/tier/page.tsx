"use client";

import { useEffect, useMemo, useState } from "react";

type Player = {
  prenom: string
  riotid: string
  rankTier: string
  rankDivision: number | null
  season: string
}

const TIERS = [
  "Challenger",
  "Grandmaster",
  "Master",
  "Diamond",
  "Emerald",
  "Platinum",
  "Gold",
  "Silver",
  "Bronze",
  "Iron"
] as const;

export default function TierPage() {

  const [players,setPlayers] = useState<Player[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    fetch("/mock/players_bdd.json")
      .then(r=>r.json())
      .then(data=>{
        setPlayers(data)
        setLoading(false)
      })
  },[])

  const playersByTier = useMemo(() => {
    const map: Record<string, Player[]> = {}

    for (const tier of TIERS) {
      map[tier] = []
    }

    for (const p of players) {
      if (map[p.rankTier]) {
        map[p.rankTier].push(p)
      }
    }

    // TRI
    for (const tier of TIERS) {
      map[tier].sort((a, b) => {
        const divA = a.rankDivision ?? 999
        const divB = b.rankDivision ?? 999
        return divA - divB
      })
    }

    return map
  }, [players])

  if(loading){
    return <div className="p-8 text-white/60">Chargement…</div>
  }

  return (

    <div className="space-y-6 w-full">

      <div className="w-full max-w-[1600px] mx-auto px-5 flex justify-between">
        <h1 className="text-2xl font-semibold text-white">Tier List</h1>
        <div className="text-white/40">{players.length} joueurs</div>
      </div>

      {TIERS.map(tier=>{

        const list = playersByTier[tier]

        if(!list || list.length===0) return null

        return(

          <div
            key={tier}
            className="w-full max-w-[1600px] mx-auto rounded-2xl border border-white/10 bg-black/25 overflow-hidden"
          >

            <div className="px-5 py-4 border-b border-white/10 flex justify-between">
              <div className="text-lg font-semibold text-white">{tier}</div>
              <div className="text-sm text-white/50">{list.length} joueurs</div>
            </div>

            <div className="p-5 flex flex-wrap gap-4">

              {list.map(p=>(
                <div
                  key={p.riotid}
                  className="w-[240px] rounded-xl border border-white/10 bg-white/5 p-4"
                >

                  <div className="text-white font-semibold">
                    {p.prenom}
                  </div>

                  <div className="text-sm text-white/60 mt-1">
                    {p.riotid}
                  </div>

                  <div className="text-xs text-white/40 mt-2">
                    {p.rankDivision
                      ? `${p.rankTier} ${p.rankDivision}`
                      : p.rankTier} • {p.season}
                  </div>

                </div>
              ))}

            </div>

          </div>

        )

      })}

    </div>

  )

}