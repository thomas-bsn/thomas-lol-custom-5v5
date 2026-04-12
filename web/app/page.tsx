"use client";

import { useRouter } from "next/navigation";

// ─── SVG Illustrations ────────────────────────────────────────────────────────

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

      {/* Liste joueurs */}
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
            <rect x="118" y={y} width="38" height="9" rx="3"
              fill={`${p.color}22`} stroke={`${p.color}66`} strokeWidth="0.6" />
            <text x="137" y={y + 6.5} fill={p.color} fontSize="5.5" fontWeight="700" textAnchor="middle">
              {p.tier.charAt(0) + p.tier.slice(1).toLowerCase()}
            </text>
            {isSel
              ? <text x="163" y={y + 6} fill="#50DC8C" fontSize="7">✓</text>
              : <text x="163" y={y + 7} fill="rgba(255,255,255,0.2)" fontSize="10">+</text>}
          </g>
        );
      })}

      {/* Panel sélection */}
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
      <rect x="258" y="88" width="26" height="14" rx="5" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
      <text x="271" y="97" fill="rgba(255,255,255,0.25)" fontSize="6" textAnchor="middle">Reset</text>
    </svg>
  );
}

function VisualTeams() {
  const blue = ["Aymen", "Xavier", "Pehdi"];
  const red  = ["Mehdi", "Sam", "Samy"];

  return (
    <svg viewBox="0 0 300 130" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
      <rect width="300" height="130" fill="#0a0a0a" />

      <text x="14" y="20" fill="white" fontSize="8" fontWeight="700">Mode de jeu</text>
      <text x="14" y="30" fill="rgba(255,255,255,0.3)" fontSize="5.5">Choisis comment former les équipes</text>

      {/* Mode buttons */}
      <rect x="14" y="35" width="52" height="13" rx="5" fill="rgba(124,92,255,0.15)" stroke="rgba(124,92,255,0.5)" strokeWidth="0.7" />
      <text x="40" y="43.5" fill="white" fontSize="5.5" fontWeight="700" textAnchor="middle">🎰 Roulette</text>
      <rect x="70" y="35" width="42" height="13" rx="5" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7" />
      <text x="91" y="43.5" fill="rgba(255,255,255,0.4)" fontSize="5.5" textAnchor="middle">⚔️ Draft</text>

      {/* Diff MMR badge */}
      <rect x="183" y="35" width="103" height="13" rx="5" fill="rgba(80,220,140,0.07)" stroke="rgba(80,220,140,0.2)" strokeWidth="0.6" />
      <text x="234" y="43.5" fill="#50DC8C" fontSize="5.5" fontWeight="700" textAnchor="middle">Différence MMR : 42 ✓</text>

      {/* Team Blue */}
      <rect x="14" y="55" width="130" height="68" rx="8" fill="rgba(80,180,255,0.05)" stroke="rgba(80,180,255,0.25)" strokeWidth="0.7" />
      <rect x="14" y="55" width="130" height="16" rx="8" fill="rgba(80,180,255,0.12)" />
      <text x="22" y="65.5" fill="#50B4FF" fontSize="6.5" fontWeight="700">TEAM BLUE</text>
      <text x="116" y="65.5" fill="rgba(80,180,255,0.6)" fontSize="5.5" textAnchor="end">12 450 MMR</text>
      {blue.map((n, i) => (
        <g key={n}>
          <rect x="22" y={76 + i * 14} width="114" height="11" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <text x="28" y={76 + i * 14 + 7.5} fill="white" fontSize="6" fontWeight="600">{n}</text>
        </g>
      ))}

      {/* Team Red */}
      <rect x="156" y="55" width="130" height="68" rx="8" fill="rgba(255,80,80,0.05)" stroke="rgba(255,80,80,0.25)" strokeWidth="0.7" />
      <rect x="156" y="55" width="130" height="16" rx="8" fill="rgba(255,80,80,0.1)" />
      <text x="164" y="65.5" fill="#FF5050" fontSize="6.5" fontWeight="700">TEAM RED</text>
      <text x="258" y="65.5" fill="rgba(255,80,80,0.6)" fontSize="5.5" textAnchor="end">12 408 MMR</text>
      {red.map((n, i) => (
        <g key={n}>
          <rect x="164" y={76 + i * 14} width="114" height="11" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <text x="170" y={76 + i * 14 + 7.5} fill="white" fontSize="6" fontWeight="600">{n}</text>
        </g>
      ))}
    </svg>
  );
}

function VisualSides() {
  return (
    <svg viewBox="0 0 300 130" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
      <rect width="300" height="130" fill="#0a0a0a" />

      <text x="14" y="20" fill="white" fontSize="8" fontWeight="700">Pile ou face</text>
      <text x="14" y="30" fill="rgba(255,255,255,0.3)" fontSize="5.5">L'équipe gagnante choisit son side</text>

      {/* Step 1 */}
      <text x="14" y="44" fill="rgba(255,255,255,0.3)" fontSize="5" fontWeight="700">1 · QUELLE ÉQUIPE LANCE ?</text>
      <rect x="14" y="48" width="66" height="14" rx="5" fill="rgba(80,180,255,0.1)" stroke="rgba(80,180,255,0.5)" strokeWidth="0.8" />
      <text x="47" y="57" fill="#50B4FF" fontSize="6.5" fontWeight="700" textAnchor="middle">Team Blue</text>
      <rect x="84" y="48" width="66" height="14" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
      <text x="117" y="57" fill="rgba(255,255,255,0.4)" fontSize="6.5" textAnchor="middle">Team Red</text>

      {/* Step 2 */}
      <text x="14" y="73" fill="rgba(255,255,255,0.3)" fontSize="5" fontWeight="700">2 · PILE OU FACE ?</text>
      <rect x="14" y="77" width="52" height="14" rx="5" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
      <text x="40" y="86" fill="white" fontSize="6.5" fontWeight="700" textAnchor="middle">Pile</text>
      <rect x="70" y="77" width="52" height="14" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
      <text x="96" y="86" fill="rgba(255,255,255,0.4)" fontSize="6.5" textAnchor="middle">Face</text>

      {/* Coin */}
      <circle cx="218" cy="68" r="32" fill="rgba(80,220,140,0.08)" stroke="rgba(80,220,140,0.5)" strokeWidth="1.2" />
      <text x="218" y="73" fill="#50DC8C" fontSize="11" fontWeight="900" textAnchor="middle">PILE</text>

      {/* Result */}
      <rect x="14" y="100" width="272" height="22" rx="6" fill="rgba(80,220,140,0.07)" stroke="rgba(80,220,140,0.2)" strokeWidth="0.7" />
      <text x="150" y="111" fill="#50DC8C" fontSize="6" fontWeight="700" textAnchor="middle">✓ Team Blue a gagné — choisissez votre side !</text>
      {/* Side choice buttons */}
      <rect x="20" y="105" width="48" height="12" rx="4" fill="rgba(80,180,255,0.1)" stroke="rgba(80,180,255,0.4)" strokeWidth="0.6" />
      <text x="44" y="113" fill="#50B4FF" fontSize="5.5" fontWeight="700" textAnchor="middle">Blue side</text>
      <rect x="72" y="105" width="48" height="12" rx="4" fill="rgba(255,80,80,0.1)" stroke="rgba(255,80,80,0.4)" strokeWidth="0.6" />
      <text x="96" y="113" fill="#FF5050" fontSize="5.5" fontWeight="700" textAnchor="middle">Red side</text>
    </svg>
  );
}

function VisualResult() {
  return (
    <svg viewBox="0 0 300 130" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
      <rect width="300" height="130" fill="#0a0a0a" />

      {/* sidebar */}
      <rect width="72" height="130" fill="#111" />
      <text x="10" y="22" fill="white" fontSize="8" fontWeight="800">THOMA$</text>
      <text x="10" y="31" fill="rgba(255,255,255,0.3)" fontSize="6">LoL Tournament</text>
      {[
        { y: 44, label: "🏠 Accueil" },
        { y: 57, label: "⚔️ Picker" },
        { y: 70, label: "🏆 Classement" },
        { y: 83, label: "🎙️ Prox Chat" },
      ].map((item) => (
        <text key={item.y} x="10" y={item.y} fill="rgba(255,255,255,0.35)" fontSize="6.5">{item.label}</text>
      ))}
      <rect x="6" y="96" width="60" height="18" rx="5" fill="rgba(255,185,50,0.12)" stroke="rgba(255,185,50,0.4)" strokeWidth="0.8" />
      <text x="12" y="108" fill="#FFB932" fontSize="6.5" fontWeight="700">⏳ 1 en attente</text>
      <text x="56" y="108" fill="rgba(255,185,50,0.5)" fontSize="5">▼</text>
      <path d="M 69 105 Q 90 105 90 60" stroke="rgba(255,185,50,0.35)" strokeWidth="1" fill="none" strokeDasharray="3 2" />
      <polygon points="88,56 90,60 92,56" fill="rgba(255,185,50,0.35)" />

      {/* modal */}
      <rect x="92" y="16" width="140" height="100" rx="10" fill="#141414" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <text x="104" y="32" fill="white" fontSize="7.5" fontWeight="700">Game #3</text>
      <text x="104" y="41" fill="rgba(255,255,255,0.3)" fontSize="5.5">12/04 · 21h30</text>
      <rect x="104" y="48" width="54" height="44" rx="5" fill="rgba(80,180,255,0.06)" stroke="rgba(80,180,255,0.25)" strokeWidth="0.7" />
      <rect x="104" y="48" width="54" height="13" rx="5" fill="rgba(80,180,255,0.12)" />
      <text x="110" y="57.5" fill="#50B4FF" fontSize="6" fontWeight="700">Blue</text>
      {["Aymen", "Mehdi", "Fares", "Xavier", "Sam"].map((n, i) => (
        <text key={n} x="110" y={69 + i * 7} fill="rgba(255,255,255,0.55)" fontSize="5.5">{n}</text>
      ))}
      <rect x="164" y="48" width="54" height="44" rx="5" fill="rgba(255,80,80,0.06)" stroke="rgba(255,80,80,0.25)" strokeWidth="0.7" />
      <rect x="164" y="48" width="54" height="13" rx="5" fill="rgba(255,80,80,0.1)" />
      <text x="170" y="57.5" fill="#FF5050" fontSize="6" fontWeight="700">Red</text>
      {["Pehdi", "Samy", "Qao", "Thomas", "Kylian"].map((n, i) => (
        <text key={n} x="170" y={69 + i * 7} fill="rgba(255,255,255,0.55)" fontSize="5.5">{n}</text>
      ))}
      <rect x="104" y="98" width="54" height="12" rx="4" fill="rgba(80,180,255,0.15)" stroke="rgba(80,180,255,0.4)" strokeWidth="0.7" />
      <text x="131" y="106.5" fill="#50B4FF" fontSize="6" fontWeight="700" textAnchor="middle">Blue a gagné</text>
      <rect x="164" y="98" width="54" height="12" rx="4" fill="rgba(255,80,80,0.12)" stroke="rgba(255,80,80,0.4)" strokeWidth="0.7" />
      <text x="191" y="106.5" fill="#FF5050" fontSize="6" fontWeight="700" textAnchor="middle">Red a gagné</text>
    </svg>
  );
}

// ─── Steps config ─────────────────────────────────────────────────────────────

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
    description: "Choisis la méthode de formation des équipes (auto, draft, manuel…). Des indicateurs d'équilibre te guident en temps réel pour avoir des équipes les plus fair possible.",
    href: null,
    cta: null,
    primary: false,
    Visual: VisualTeams,
  },
  {
    number: "03",
    title: "Sides",
    description: "Un coin flip attribue les côtés (Blue / Red) à chaque équipe. C'est parti.",
    href: null,
    cta: null,
    primary: false,
    Visual: VisualSides,
  },
  {
    number: "04",
    title: "Résultat",
    description: "Une fois la game terminée, reviens sur le site. Un badge apparaît dans la sidebar avec les games en attente — clique dessus, puis choisis l'équipe gagnante.",
    href: null,
    cta: null,
    primary: false,
    Visual: VisualResult,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();

  return (
    <main style={{ padding: "0 24px 60px", width: "100%", maxWidth: "860px" }}>

      {/* Hero */}
      <div style={{ marginBottom: "48px" }}>
        <h1 style={{
          fontSize: "2rem", fontWeight: 800, color: "white",
          margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>
          Bienvenue sur l'outil 👋
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", margin: 0, lineHeight: 1.6 }}>
          Organise tes custom games LoL en 4 étapes. Voilà comment ça marche.
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
        {STEPS.map(({ number, title, description, href, cta, primary, Visual }) => (
          <div
            key={number}
            style={{
              background: primary ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.3)",
              border: `1px solid ${primary ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: "14px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              position: "relative",
              overflow: "hidden",
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
              fontSize: "11px", fontWeight: 700,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Étape {number}
            </span>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", margin: 0 }}>
              {title}
            </h2>

            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
              {description}
            </p>

            {cta && href && (
              <button
                onClick={() => router.push(href)}
                style={{
                  marginTop: "4px", padding: "10px 16px", borderRadius: "8px",
                  border: "none", background: "white", color: "black",
                  fontWeight: 700, fontSize: "13px", cursor: "pointer", alignSelf: "flex-start",
                }}
              >
                {cta}
              </button>
            )}

            <div style={{ marginTop: "4px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Visual />
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}