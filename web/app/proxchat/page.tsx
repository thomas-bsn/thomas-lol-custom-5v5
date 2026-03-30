"use client";

import { useRouter } from "next/navigation";

export default function ProximityTutoPage() {
  const router = useRouter();

  return (
    <main style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      fontFamily: "'Segoe UI', sans-serif",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .back-btn {
          position: absolute;
          top: 20px;
          left: 24px;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.07);
          background: transparent;
          color: rgba(255,255,255,0.25);
          font-size: 12px;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .back-btn:hover { color: rgba(255,255,255,0.5); border-color: rgba(255,255,255,0.15); }
        .emoji {
          font-size: 72px;
          animation: float 4s ease-in-out infinite;
          display: block;
          margin-bottom: 28px;
          filter: grayscale(20%);
        }
        .status-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(255, 100, 100, 0.7);
          margin-right: 8px;
          animation: blink 2.5s ease-in-out infinite;
          vertical-align: middle;
        }
      `}</style>

      <button className="back-btn" onClick={() => router.back()}>← Retour</button>

      <span className="emoji">🛋️</span>

      <div style={{ animation: "fadeUp 0.5s ease both" }}>
        <h1 style={{
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          fontWeight: 800,
          color: "white",
          margin: "0 0 12px",
          letterSpacing: "-0.03em",
        }}>
          Dev en pause
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: "0.95rem",
          maxWidth: "380px",
          lineHeight: 1.6,
          margin: "0 auto 28px",
        }}>
          J'ai la flemme. Le projet est en vie, juste… en hibernation.<br />
          Je reprendrai quand j'aurai envie.
        </p>

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "8px 16px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          fontSize: "12px",
          color: "rgba(255,255,255,0.25)",
          marginBottom: "36px",
        }}>
          <span className="status-dot" />
          En développement actif · quelque part dans l'avenir
        </div>

        <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "11.5px" }}>
          Questions ? Discord :{" "}
          <strong style={{ color: "rgba(255,255,255,0.35)" }}>@gslastplayer</strong>
        </p>
      </div>
    </main>
  );
}