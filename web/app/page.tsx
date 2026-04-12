"use client";

import { useRouter } from "next/navigation";
import SamShine from "@/components/SamShine";


function VisualPicker() {
  const players = [
    { name: "Aymen",  tier: "GRANDMASTER", color: "#FF5050" },
    { name: "Mehdi",  tier: "PLATINUM",    color: "#50C8B4" },
    { name: "Fares",  tier: "MASTER",      color: "#B450FF" },
    { name: "Xavier", tier: "EMERALD",     color: "#50DC8C" },
    { name: "Sam",    tier: "GOLD",        color: "#FFB932" },
  ];
  const selected = ["Aymen", "Mehdi", "Fares"];

  return (
    <svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
      <rect width="300" height="120" fill="#0a0a0a" />
      <rect x="10" y="10" width="170" height="100" rx="8" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
      <text x="18" y="24" fill="white" fontSize="7" fontWeight="700">Sélection des joueurs</text>
      <text x="18" y="32" fill="rgba(255,255,255,0.3)" fontSize="5.5">Choisis 10 joueurs pour la session</text>
      <rect x="18" y="36" width="154" height="10" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <text x="23" y="43.5" fill="rgba(255,255,255,0.2)" fontSize="5.5">Rechercher un joueur…</text>
      {players.map((p, i) => {
        const y = 52 + i * 13;
        const isSel = selected.includes(p.name);
        return (
          <g key={p.name} opacity={isSel ? 0.35 : 1}>
            <text x="22" y={y + 5} fill="white" fontSize="6.5" fontWeight="600">{p.name}</text>
            <rect x="118" y={y} width="38" height="9" rx="3" fill={`${p.color}22`} stroke={`${p.color}66`} strokeWidth="0.6" />
            <text x="137" y={y + 6.5} fill={p.color} fontSize="5.5" fontWeight="700" textAnchor="middle">
              {p.tier.charAt(0) + p.tier.slice(1).toLowerCase()}
            </text>
            {isSel
              ? <text x="163" y={y + 6} fill="#50DC8C" fontSize="7">✓</text>
              : <text x="163" y={y + 7} fill="rgba(255,255,255,0.2)" fontSize="10">+</text>}
          </g>
        );
      })}
      <rect x="188" y="10" width="102" height="100" rx="8" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
      <text x="196" y="24" fill="white" fontSize="6.5" fontWeight="700">Sélection</text>
      <text x="265" y="24" fill="#50DC8C" fontSize="6.5" fontWeight="700">3 / 10</text>
      <rect x="196" y="28" width="86" height="3" rx="1.5" fill="rgba(255,255,255,0.06)" />
      <rect x="196" y="28" width="26" height="3" rx="1.5" fill="rgba(124,92,255,0.8)" />
      {selected.map((name, i) => {
        const y = 38 + i * 14;
        return (
          <g key={name}>
            <rect x="196" y={y} width="86" height="11" rx="4" fill="rgba(255,255,255,0.04)" />
            <text x="201" y={y + 7.5} fill="rgba(255,255,255,0.3)" fontSize="5">{i + 1}</text>
            <text x="209" y={y + 7.5} fill="white" fontSize="6" fontWeight="600">{name}</text>
            <text x="274" y={y + 7.5} fill="rgba(255,80,80,0.5)" fontSize="9" textAnchor="middle">×</text>
          </g>
        );
      })}
      <rect x="196" y="88" width="58" height="14" rx="5" fill="rgba(255,255,255,0.07)" />
      <text x="225" y="97" fill="rgba(255,255,255,0.25)" fontSize="6" fontWeight="700" textAnchor="middle">Continuer →</text>
    </svg>
  );
}

function VisualTeams() {
  const blue = ["Aymen", "Xavier", "Pehdi"];
  const red  = ["Mehdi", "Sam", "Samy"];
  return (
    <svg viewBox="0 0 300 160" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
      <rect width="300" height="160" fill="#0a0a0a" />
      <text x="14" y="18" fill="white" fontSize="8" fontWeight="700">Mode de jeu</text>
      <text x="14" y="27" fill="rgba(255,255,255,0.3)" fontSize="5.5">Choisis comment former les équipes</text>
      <rect x="14" y="32" width="52" height="13" rx="5" fill="rgba(124,92,255,0.15)" stroke="rgba(124,92,255,0.5)" strokeWidth="0.7" />
      <text x="40" y="40.5" fill="white" fontSize="5.5" fontWeight="700" textAnchor="middle">🎰 Roulette</text>
      <rect x="70" y="32" width="42" height="13" rx="5" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7" />
      <text x="91" y="40.5" fill="rgba(255,255,255,0.4)" fontSize="5.5" textAnchor="middle">⚔️ Draft</text>
      <text x="14" y="56" fill="rgba(255,255,255,0.3)" fontSize="4.5" fontWeight="700" letterSpacing="1">FORMAT</text>
      {(["BO1", "BO3", "BO5"] as const).map((label, idx) => (
        <g key={label}>
          <rect x={14 + idx * 28} y="59" width="22" height="11" rx="4"
            fill={label === "BO3" ? "rgba(124,92,255,0.15)" : "rgba(255,255,255,0.04)"}
            stroke={label === "BO3" ? "rgba(124,92,255,0.5)" : "rgba(255,255,255,0.08)"}
            strokeWidth="0.7" />
          <text x={14 + idx * 28 + 11} y="66.5"
            fill={label === "BO3" ? "white" : "rgba(255,255,255,0.4)"}
            fontSize="5.5" fontWeight={label === "BO3" ? "700" : "400"} textAnchor="middle">{label}</text>
        </g>
      ))}
      <rect x="183" y="32" width="103" height="13" rx="5" fill="rgba(80,220,140,0.07)" stroke="rgba(80,220,140,0.2)" strokeWidth="0.6" />
      <text x="234" y="40.5" fill="#50DC8C" fontSize="5.5" fontWeight="700" textAnchor="middle">Différence MMR : 42 ✓</text>
      <rect x="14" y="78" width="130" height="72" rx="8" fill="rgba(80,180,255,0.05)" stroke="rgba(80,180,255,0.25)" strokeWidth="0.7" />
      <rect x="14" y="78" width="130" height="16" rx="8" fill="rgba(80,180,255,0.12)" />
      <text x="22" y="88.5" fill="#50B4FF" fontSize="6.5" fontWeight="700">TEAM BLUE</text>
      <text x="116" y="88.5" fill="rgba(80,180,255,0.6)" fontSize="5.5" textAnchor="end">12 450 MMR</text>
      {blue.map((n, i) => (
        <g key={n}>
          <rect x="22" y={99 + i * 14} width="114" height="11" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <text x="28" y={99 + i * 14 + 7.5} fill="white" fontSize="6" fontWeight="600">{n}</text>
        </g>
      ))}
      <rect x="156" y="78" width="130" height="72" rx="8" fill="rgba(255,80,80,0.05)" stroke="rgba(255,80,80,0.25)" strokeWidth="0.7" />
      <rect x="156" y="78" width="130" height="16" rx="8" fill="rgba(255,80,80,0.1)" />
      <text x="164" y="88.5" fill="#FF5050" fontSize="6.5" fontWeight="700">TEAM RED</text>
      <text x="258" y="88.5" fill="rgba(255,80,80,0.6)" fontSize="5.5" textAnchor="end">12 408 MMR</text>
      {red.map((n, i) => (
        <g key={n}>
          <rect x="164" y={99 + i * 14} width="114" height="11" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <text x="170" y={99 + i * 14 + 7.5} fill="white" fontSize="6" fontWeight="600">{n}</text>
        </g>
      ))}
    </svg>
  );
}

function VisualSides() {
  return (
    <svg viewBox="0 0 300 155" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
      <rect width="300" height="155" fill="#0a0a0a" />
      <text x="14" y="18" fill="white" fontSize="8" fontWeight="700">Pile ou face</text>
      <text x="14" y="27" fill="rgba(255,255,255,0.3)" fontSize="5.5">L'équipe gagnante choisit son side</text>
      <text x="14" y="42" fill="rgba(255,255,255,0.3)" fontSize="5" fontWeight="700">1 · QUELLE ÉQUIPE LANCE ?</text>
      <rect x="14" y="46" width="66" height="14" rx="5" fill="rgba(80,180,255,0.1)" stroke="rgba(80,180,255,0.5)" strokeWidth="0.8" />
      <text x="47" y="55" fill="#50B4FF" fontSize="6.5" fontWeight="700" textAnchor="middle">Team Blue</text>
      <rect x="84" y="46" width="66" height="14" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
      <text x="117" y="55" fill="rgba(255,255,255,0.4)" fontSize="6.5" textAnchor="middle">Team Red</text>
      <text x="14" y="72" fill="rgba(255,255,255,0.3)" fontSize="5" fontWeight="700">2 · PILE OU FACE ?</text>
      <rect x="14" y="76" width="52" height="14" rx="5" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
      <text x="40" y="85" fill="white" fontSize="6.5" fontWeight="700" textAnchor="middle">Pile</text>
      <rect x="70" y="76" width="52" height="14" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
      <text x="96" y="85" fill="rgba(255,255,255,0.4)" fontSize="6.5" textAnchor="middle">Face</text>
      <circle cx="220" cy="68" r="30" fill="rgba(80,220,140,0.08)" stroke="rgba(80,220,140,0.5)" strokeWidth="1.2" />
      <text x="220" y="73" fill="#50DC8C" fontSize="11" fontWeight="900" textAnchor="middle">PILE</text>
      <rect x="14" y="100" width="272" height="20" rx="6" fill="rgba(80,220,140,0.07)" stroke="rgba(80,220,140,0.2)" strokeWidth="0.7" />
      <text x="150" y="112" fill="#50DC8C" fontSize="5.8" fontWeight="700" textAnchor="middle">✓ Team Blue a gagné — choisissez votre side !</text>
      <rect x="14" y="128" width="60" height="16" rx="5" fill="rgba(80,180,255,0.1)" stroke="rgba(80,180,255,0.4)" strokeWidth="0.7" />
      <text x="44" y="138.5" fill="#50B4FF" fontSize="6" fontWeight="700" textAnchor="middle">Blue side</text>
      <rect x="80" y="128" width="60" height="16" rx="5" fill="rgba(255,80,80,0.1)" stroke="rgba(255,80,80,0.4)" strokeWidth="0.7" />
      <text x="110" y="138.5" fill="#FF5050" fontSize="6" fontWeight="700" textAnchor="middle">Red side</text>
    </svg>
  );
}

function VisualSessions() {
  const blueWins = 1;
  const redWins = 0;
  const blue = ["Thomas", "Kélio", "Fares"];
  const red  = ["Aymen", "Mehdi", "Sam"];

  return (
    <svg viewBox="0 0 300 175" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
      <rect width="300" height="175" fill="#0a0a0a" />

      {/* Header */}
      <text x="14" y="18" fill="white" fontSize="8" fontWeight="700">Sessions</text>
      <text x="14" y="27" fill="rgba(255,255,255,0.3)" fontSize="5.5">BO en cours · Série #29</text>

      {/* Score */}
      <rect x="210" y="8" width="76" height="28" rx="7" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
      <text x="228" y="17" fill="rgba(80,180,255,0.6)" fontSize="5" fontWeight="700" textAnchor="middle">BLUE</text>
      <text x="228" y="29" fill="#50B4FF" fontSize="14" fontWeight="900" textAnchor="middle">{blueWins}</text>
      <text x="248" y="24" fill="rgba(255,255,255,0.15)" fontSize="10" textAnchor="middle">—</text>
      <text x="268" y="17" fill="rgba(255,80,80,0.6)" fontSize="5" fontWeight="700" textAnchor="middle">RED</text>
      <text x="268" y="29" fill="rgba(255,255,255,0.25)" fontSize="14" fontWeight="900" textAnchor="middle">{redWins}</text>

      {/* Teams */}
      <rect x="14" y="36" width="130" height="72" rx="7" fill="rgba(80,180,255,0.05)" stroke="rgba(80,180,255,0.25)" strokeWidth="0.7" />
      <rect x="14" y="36" width="130" height="14" rx="7" fill="rgba(80,180,255,0.12)" />
      <text x="20" y="45.5" fill="#50B4FF" fontSize="6" fontWeight="700">Blue</text>
      <text x="88" y="45.5" fill="rgba(80,180,255,0.5)" fontSize="5.5" textAnchor="middle">WINNER</text>
      {blue.map((n, i) => (
        <g key={n}>
          <rect x="20" y={54 + i * 14} width="118" height="11" rx="3" fill="rgba(255,255,255,0.03)" />
          <text x="26" y={54 + i * 14 + 7.5} fill="rgba(255,255,255,0.7)" fontSize="6" fontWeight="500">{n}</text>
        </g>
      ))}

      <rect x="156" y="36" width="130" height="72" rx="7" fill="rgba(255,80,80,0.04)" stroke="rgba(255,80,80,0.15)" strokeWidth="0.7" />
      <rect x="156" y="36" width="130" height="14" rx="7" fill="rgba(255,80,80,0.08)" />
      <text x="162" y="45.5" fill="#FF5050" fontSize="6" fontWeight="700">Red</text>
      {red.map((n, i) => (
        <g key={n}>
          <rect x="162" y={54 + i * 14} width="118" height="11" rx="3" fill="rgba(255,255,255,0.03)" />
          <text x="168" y={54 + i * 14 + 7.5} fill="rgba(255,255,255,0.7)" fontSize="6" fontWeight="500">{n}</text>
        </g>
      ))}

      {/* Actions */}
      <text x="14" y="123" fill="rgba(255,255,255,0.3)" fontSize="4.5" fontWeight="700" letterSpacing="0.8">ACTIONS</text>

      {/* Swap sides */}
      <rect x="14" y="127" width="58" height="12" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
      <text x="43" y="135" fill="rgba(255,255,255,0.4)" fontSize="5.5" textAnchor="middle">⇄ Swap sides</text>

      {/* Swap joueur */}
      <rect x="76" y="127" width="58" height="12" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
      <text x="105" y="135" fill="rgba(255,255,255,0.4)" fontSize="5.5" textAnchor="middle">⇄ Joueur</text>

      {/* Abandonner */}
      <rect x="138" y="127" width="58" height="12" rx="4" fill="rgba(255,80,80,0.06)" stroke="rgba(255,80,80,0.2)" strokeWidth="0.6" />
      <text x="167" y="135" fill="rgba(255,80,80,0.6)" fontSize="5.5" textAnchor="middle">Abandonner</text>

      {/* Launch */}
      <rect x="14" y="146" width="272" height="18" rx="6" fill="rgba(255,255,255,0.9)" />
      <text x="150" y="157.5" fill="black" fontSize="6.5" fontWeight="800" textAnchor="middle">Lancer la game suivante →</text>
    </svg>
  );
}

function VisualHistory() {
  const series = [
    { format: "BO3", score: "2-1", winner: "Blue", date: "12/04", color: "80,180,255" },
    { format: "BO5", score: "3-2", winner: "Red",  date: "10/04", color: "255,80,80" },
    { format: "BO1", score: "1-0", winner: "Blue", date: "08/04", color: "80,180,255" },
  ];

  return (
    <svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
      <rect width="300" height="140" fill="#0a0a0a" />
      <text x="14" y="18" fill="white" fontSize="8" fontWeight="700">Historique</text>
      <text x="14" y="27" fill="rgba(255,255,255,0.3)" fontSize="5.5">Résultats archivés par mois</text>

      {/* Month selector */}
      <rect x="14" y="32" width="52" height="11" rx="4" fill="rgba(124,92,255,0.15)" stroke="rgba(124,92,255,0.4)" strokeWidth="0.6" />
      <text x="40" y="39.5" fill="rgba(180,140,255,0.9)" fontSize="5.5" fontWeight="700" textAnchor="middle">Avril 2026</text>
      <rect x="70" y="32" width="40" height="11" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
      <text x="90" y="39.5" fill="rgba(255,255,255,0.3)" fontSize="5.5" textAnchor="middle">Mars 2026</text>

      {series.map((s, i) => {
        const y = 50 + i * 28;
        return (
          <g key={i}>
            <rect x="14" y={y} width="272" height="23" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
            {/* Format badge */}
            <rect x="20" y={y + 6} width="20" height="10" rx="3" fill="rgba(124,92,255,0.15)" stroke="rgba(124,92,255,0.3)" strokeWidth="0.5" />
            <text x="30" y={y + 13} fill="rgba(180,140,255,0.9)" fontSize="5" fontWeight="800" textAnchor="middle">{s.format}</text>
            {/* Score */}
            <text x="58" y={y + 13.5} fill="white" fontSize="7" fontWeight="800">{s.score}</text>
            {/* Winner badge */}
            <rect x="82" y={y + 6} width="30" height="10" rx="3" fill={`rgba(${s.color},0.12)`} stroke={`rgba(${s.color},0.3)`} strokeWidth="0.5" />
            <text x="97" y={y + 13} fill={`rgb(${s.color})`} fontSize="5" fontWeight="700" textAnchor="middle">{s.winner} 🏆</text>
            {/* Date */}
            <text x="275" y={y + 13.5} fill="rgba(255,255,255,0.25)" fontSize="5.5" textAnchor="end">{s.date}</text>
          </g>
        );
      })}
    </svg>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Picker",
    description: "Sélectionne 10 joueurs pour la session. Le Picker récupère automatiquement leur rang Riot.",
    href: "/picker",
    cta: "Aller au Picker →",
    primary: true,
    Visual: VisualPicker,
  },
  {
    number: "02",
    title: "Teams",
    description: "Choisis la méthode de formation des équipes (roulette, draft…) et le format BO1/BO3/BO5. Des indicateurs d'équilibre te guident en temps réel.",
    href: null,
    cta: null,
    primary: false,
    Visual: VisualTeams,
  },
  {
    number: "03",
    title: "Sides (optionnel)",
    description: "Tu peux choisir les sides via un coin flip, ou lancer directement la game sans. C'est ton choix.",
    href: null,
    cta: null,
    primary: false,
    Visual: VisualSides,
  },
  {
    number: "04",
    title: "Sessions",
    description: "Retrouve ton BO en cours dans Sessions. Marque le vainqueur, swap les sides, change un joueur ou abandonne. Les games suivantes se lancent directement depuis là.",
    href: "/sessions",
    cta: "Voir les sessions →",
    primary: false,
    Visual: VisualSessions,
  },
  {
    number: "05",
    title: "Historique",
    description: "Une fois le BO terminé, tous les résultats sont archivés dans l'Historique, consultables par mois.",
    href: "/history",
    cta: "Voir l'historique →",
    primary: false,
    Visual: VisualHistory,
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <main style={{ padding: "0 24px 60px", width: "100%", maxWidth: "960px" }}>

      <div style={{ marginBottom: "48px" }}>
        <h1 style={{
          fontSize: "2rem", fontWeight: 800, color: "white",
          margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>
          Bienvenue sur l'outil 👋
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", margin: 0, lineHeight: 1.6 }}>
          Organise tes custom games LoL en 5 étapes. Voilà comment ça marche.
        </p>
      </div>

      {/* 2 colonnes pour les 4 premières, puis la 5ème centrée */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
        {STEPS.slice(0, 4).map(({ number, title, description, href, cta, primary, Visual }) => (
          <div
            key={number}
            style={{
              background: primary ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.3)",
              border: `1px solid ${primary ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: "14px", padding: "24px",
              display: "flex", flexDirection: "column", gap: "10px",
              position: "relative", overflow: "hidden",
            }}
          >
            <span style={{
              position: "absolute", top: "-10px", right: "14px",
              fontSize: "72px", fontWeight: 900,
              color: "rgba(255,255,255,0.04)", lineHeight: 1, userSelect: "none",
            }}>
              {number}
            </span>
            <span style={{
              fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Étape {number}
            </span>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", margin: 0 }}>{title}</h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>{description}</p>
            {cta && href && (
              <button onClick={() => router.push(href)} style={{
                marginTop: "4px", padding: "10px 16px", borderRadius: "8px",
                border: "none", background: "white", color: "black",
                fontWeight: 700, fontSize: "13px", cursor: "pointer", alignSelf: "flex-start",
              }}>
                {cta}
              </button>
            )}
            <div style={{ marginTop: "4px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Visual />
            </div>
          </div>
        ))}
      </div>

      {/* Étape 05 — pleine largeur */}
      {STEPS.slice(4).map(({ number, title, description, href, cta, Visual }) => (
        <div
          key={number}
          style={{
            marginTop: "14px",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px", padding: "24px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px",
            position: "relative", overflow: "hidden",
          }}
        >
          <span style={{
            position: "absolute", top: "-10px", right: "14px",
            fontSize: "72px", fontWeight: 900,
            color: "rgba(255,255,255,0.04)", lineHeight: 1, userSelect: "none",
          }}>
            {number}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
            <span style={{
              fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Étape {number}
            </span>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", margin: 0 }}>{title}</h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>{description}</p>
            {cta && href && (
              <button onClick={() => router.push(href)} style={{
                marginTop: "4px", padding: "10px 16px", borderRadius: "8px",
                border: "none", background: "white", color: "black",
                fontWeight: 700, fontSize: "13px", cursor: "pointer", alignSelf: "flex-start",
              }}>
                {cta}
              </button>
            )}
          </div>
          <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Visual />
          </div>
        </div>
      ))}
    <SamShine />
    </main>
  );
}