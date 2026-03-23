"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const steps = [
  {
    num: "01",
    title: "Lancer le logiciel",
    desc: <>Télécharge et lance <strong>LoLProximityChat.WPF.exe</strong>. Aucune installation — double-clic et c'est parti.</>,
    img: "/proxchat/1.png",
    imgWide: null,
  },
  {
    num: "02",
    title: "Configurer Discord",
    desc: <>Clique sur <strong>Audio</strong> en haut à droite, entre ton <strong>pseudo Discord</strong> exact (ex: gslastplayer) et sauvegarde. Une seule fois.</>,
    img: "/proxchat/2.png",
    imgWide: null,
  },
  {
    num: "03",
    title: "Rejoindre un vocal Discord",
    desc: <>Tous les joueurs rejoignent le <strong>même channel vocal Discord</strong> avant la game. Le logiciel détecte automatiquement.</>,
    img: "/proxchat/3.png",
    imgWide: null,
  },
  {
    num: "04",
    title: "Calibrer la minimap",
    desc: <>Clique sur <strong>Calibration</strong>, règle le rectangle rouge PARFAITEMENT sur ta minimap en jeu. Une seule fois par résolution d'écran.</>,
    img: "/proxchat/4.png",
    imgWide: "/proxchat/4-wide.png",
  },
  {
    num: "05",
    title: "Jouer",
    desc: <>Lance la custom game. Les volumes Discord s'ajustent automatiquement selon la <strong>distance sur la map</strong> en temps réel.</>,
    img: null,
    imgWide: null,
  },
];

export default function ProximityTutoPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [subImg, setSubImg] = useState(0);

  function goToStep(i: number) {
    setActiveStep(i);
    setSubImg(0);
  }

  const step = steps[activeStep];

  return (
    <main style={{ padding: "0 32px 60px", width: "100%", maxWidth: "100%", overflow: "hidden", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box" }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .dl-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 28px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          background: rgba(255,60,60,0.08);
          background-size: 200% auto;
          border: 1px solid rgba(255,60,60,0.25);
          cursor: not-allowed;
          opacity: 0.7;
        }
        .dl-btn:hover {
          animation: none;
          box-shadow: none;
          transform: none;
        }
        .step-card {
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.15s, background 0.2s;
        }
        .step-card:hover { border-color: rgba(124,92,255,0.25); transform: translateX(3px); }
        .step-card.active { border-color: rgba(124,92,255,0.45); background: rgba(124,92,255,0.06); }
        .arrow-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          background: rgba(0,0,0,0.55);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          line-height: 1;
          backdrop-filter: blur(4px);
          transition: background 0.2s, border-color 0.2s;
          z-index: 2;
          user-select: none;
        }
        .arrow-btn:hover { background: rgba(124,92,255,0.4); border-color: rgba(124,92,255,0.5); }

        /* Layout responsive */
        .steps-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 16px;
          max-width: 900px;
          width: 100%;
        }
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
          margin-top: 16px;
        }
        @media (max-width: 800px) {
          .steps-grid {
            grid-template-columns: 1fr;
          }
          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 500px) {
          main { padding: 0 16px 40px !important; }
          .dl-btn { padding: 12px 18px !important; font-size: 13px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingTop: "8px", animation: "fadeUp 0.4s ease both" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a78bfa", background: "rgba(124,92,255,0.12)", border: "1px solid rgba(124,92,255,0.2)", padding: "3px 10px", borderRadius: "20px" }}>BÊTA</span>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Windows • Gratuit</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.3rem, 3vw, 1.9rem)", fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.02em" }}>
            LoL Proximity Voice Chat
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", marginTop: "5px" }}>
            Entendez Mehdi hurler en lane parce qu’il loupe un sbire canon.
          </p>
        </div>
        <button onClick={() => router.back()} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: "12px", cursor: "pointer", marginTop: "8px", flexShrink: 0, marginLeft: "16px" }}>
          ← Retour
        </button>
      </div>

      {/* Download */}
      <div style={{ marginBottom: "36px", animation: "fadeUp 0.4s ease 0.08s both" }}>
        <div className="dl-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Téléchargement bientôt disponible
          <span style={{ fontSize: "12px", fontWeight: 400, color: "rgba(255,80,80,0.5)", borderLeft: "1px solid rgba(255,80,80,0.2)", paddingLeft: "12px" }}>
            En développement
          </span>
        </div>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)", marginTop: "9px", marginLeft: "2px" }}>
          Config sauvegardée dans{" "}
          <code style={{ color: "rgba(167,139,250,0.6)", fontFamily: "monospace", fontSize: "11px" }}>%AppData%\LoLProximityChat\</code>
          {" "}— setup une seule fois, puis lance et joue.
        </p>
      </div>

      {/* Steps + Preview */}
      <div className="steps-grid" style={{ animation: "fadeUp 0.4s ease 0.15s both" }}>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          {steps.map((s, i) => (
            <div key={s.num} className={`step-card${activeStep === i ? " active" : ""}`} onClick={() => goToStep(i)}>
              <div style={{ padding: "13px 16px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <span style={{
                  fontFamily: "monospace", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
                  color: activeStep === i ? "#a78bfa" : "rgba(255,255,255,0.15)",
                  minWidth: "22px", marginTop: "2px", transition: "color 0.2s",
                }}>{s.num}</span>
                <div>
                  <div style={{ color: activeStep === i ? "white" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: "13px", marginBottom: "3px", transition: "color 0.2s" }}>
                    {s.title}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11.5px", lineHeight: "1.55" }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.35)", minHeight: "300px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "sticky", top: "20px" }}>

          {step.imgWide ? (
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              <img
                key={`${activeStep}-${subImg}`}
                src={subImg === 0 ? step.img! : step.imgWide}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "contain", animation: "fadeUp 0.25s ease both" }}
              />
              {/* Label */}
              <div style={{ position: "absolute", top: "10px", right: "12px", fontSize: "10px", color: "rgba(255,255,255,0.5)", background: "rgba(0,0,0,0.6)", padding: "3px 8px", borderRadius: "6px", backdropFilter: "blur(4px)" }}>
                {subImg === 0 ? "Vue logiciel" : "Vue jeu"}
              </div>
              {/* Flèche gauche */}
              {subImg === 1 && (
                <div className="arrow-btn" style={{ left: "10px" }} onClick={() => setSubImg(0)}>‹</div>
              )}
              {/* Flèche droite */}
              {subImg === 0 && (
                <div className="arrow-btn" style={{ right: "10px" }} onClick={() => setSubImg(1)}>›</div>
              )}
              {/* Dots */}
              <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px" }}>
                {[0, 1].map(idx => (
                  <div
                    key={idx}
                    onClick={() => setSubImg(idx)}
                    style={{ width: "7px", height: "7px", borderRadius: "50%", cursor: "pointer", background: subImg === idx ? "white" : "rgba(255,255,255,0.25)", transition: "background 0.2s", border: subImg === idx ? "none" : "1px solid rgba(255,255,255,0.3)" }}
                  />
                ))}
              </div>
            </div>

          ) : step.img ? (
            <img
              key={activeStep}
              src={step.img}
              alt={step.title}
              style={{ width: "100%", height: "100%", objectFit: "contain", animation: "fadeUp 0.25s ease both" }}
            />
          ) : (
            <div key={activeStep} style={{ textAlign: "center", animation: "fadeUp 0.25s ease both" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px", opacity: 0.2 }}>📸</div>
              <div style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px" }}>Screenshot à venir</div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom cards */}
      <div className="bottom-grid" style={{ animation: "fadeUp 0.4s ease 0.22s both" }}>

        <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(124,92,255,0.1)", borderRadius: "14px", padding: "18px 20px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "#7c5cff", textTransform: "uppercase", marginBottom: "12px" }}>⚙ Comment ça marche</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {[
              "Screenshot local de la minimap pour détecter ta position",
              "Serveur calcule les distances entre tous les joueurs",
              "Volumes Discord ajustés via l'API RPC locale Discord",
              "Invisible pour les autres — uniquement sur ton PC",
              "100% légal — ne modifie pas le jeu (comme Blitz / Porofessor)",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
                <span style={{ color: "#7c5cff", fontSize: "9px", marginTop: "5px", flexShrink: 0 }}>▸</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,185,50,0.08)", borderRadius: "14px", padding: "18px 20px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "#FFB932", textTransform: "uppercase", marginBottom: "12px" }}>⚠ Dépannage</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {[
              <>Game non détectée → LoL doit être <strong style={{ color: "rgba(255,255,255,0.6)" }}>en cours de partie</strong></>,
              <>Volumes figés → tous dans le <strong style={{ color: "rgba(255,255,255,0.6)" }}>même vocal Discord</strong></>,
              <>Discord muet → ferme et relance Discord puis le logiciel</>,
              <>Minimap KO → recalibre via le bouton <strong style={{ color: "rgba(255,255,255,0.6)" }}>Calibration</strong></>,
              <>Joueur absent → il doit avoir le logiciel lancé et configuré</>,
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
                <span style={{ color: "#FFB932", fontSize: "9px", marginTop: "5px", flexShrink: 0 }}>▸</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px" }}>🎮</span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "11.5px" }}>
              Bug ? Discord : <strong style={{ color: "rgba(255,255,255,0.55)" }}>@gslastplayer</strong>
            </span>
          </div>
        </div>

      </div>
    </main>
  );
}