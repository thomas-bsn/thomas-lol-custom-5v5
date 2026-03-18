"use client";

import { useRouter } from "next/navigation";

export default function TutoPage() {
  const router = useRouter();

  return (
    <main style={{ padding: "0 48px 40px", width: "100%" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Rejoindre un tournoi LoL</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: "4px" }}>
            Rejoindre le lobby à partir du code généré par le site
          </p>
        </div>
        <button
          onClick={() => router.back()}
          style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", fontSize: "13px", cursor: "pointer" }}
        >
          ← Retour
        </button>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "800px" }}>

        {[
          {
            num: "1",
            title: "Aller dans l'onglet Jouer",
            desc: <>Clique sur <strong style={{ color: "white" }}>Jouer</strong> en haut à gauche du client League of Legends.</>,
            img: "/1.png",
            alt: "Étape 1 - Cliquer sur Jouer",
          },
          {
            num: "2",
            title: "Cliquer sur l'icône trophée",
            desc: <>Dans l'écran des modes de jeu, clique sur le <strong style={{ color: "white" }}>logo du trophée</strong> (tournois).</>,
            img: "/2.png",
            alt: "Étape 2 - Cliquer sur le trophée",
          },
          {
            num: "3",
            title: "Entrer le code et rejoindre",
            desc: <>Colle le <strong style={{ color: "white" }}>code fourni par le site</strong> dans le champ, puis clique sur <strong style={{ color: "white" }}>Join</strong>.</>,
            img: "/3.png",
            alt: "Étape 3 - Entrer le code",
          },
        ].map(({ num, title, desc, img, alt }) => (
          <div key={num} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{
                width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                background: "rgba(124,92,255,0.2)", border: "1px solid rgba(124,92,255,0.4)",
                color: "#a78bfa", fontSize: "13px", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{num}</span>
              <span style={{ color: "white", fontWeight: 600, fontSize: "15px" }}>{title}</span>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: "0 0 14px" }}>{desc}</p>
              <img src={img} alt={alt} style={{ width: "100%", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)" }} />
            </div>
          </div>
        ))}

        {/* Dépannage */}
        <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,185,50,0.15)", borderRadius: "14px", padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <span style={{ color: "white", fontWeight: 600, fontSize: "15px" }}>Dépannage rapide</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              <>Le bouton <strong style={{ color: "white" }}>Join</strong> est grisé : vérifie que le code est complet.</>,
              <>Code invalide : assure-toi d'être sur le bon compte / bon serveur.</>,
              <>Rien ne se passe : relance le client LoL, puis réessaie.</>,
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ color: "#FFB932", fontSize: "12px", marginTop: "2px", flexShrink: 0 }}>•</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}