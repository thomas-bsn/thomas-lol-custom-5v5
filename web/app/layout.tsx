import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ClientBootReset from "./ClientBootReset";
import HelpTournamentButton from "./HelpTournamentButton";
import VideoBackground from "./VideoBackground";
import CinemaButton from "./CinemaButton";
import Sidebar from "./Sidebar";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "THOMA$ - LoL Tournament",
  description: "A simple app to manage League of Legends tournaments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={geist.variable} style={{ margin: 0, background: "#000", fontFamily: "var(--font-geist), sans-serif" }}>
        <ClientBootReset />
        <HelpTournamentButton />
        <CinemaButton />

        {/* Background vidéo */}
        <div className="video-bg">
          <VideoBackground />
          <div className="video-overlay" />
        </div>

        {/* Shell */}
        <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex" }}>
          <Sidebar />

          <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>

            {/* Header compact */}
            <header style={{
              padding: "20px 48px 0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "28px",
            }}>
              <div>
                <span style={{ color: "white", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.01em" }}>THOMA$</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", marginLeft: "8px" }}>LoL Tournament</span>
              </div>
            </header>

            <div style={{ padding: "0" }}>
              {children}
            </div>

          </div>
        </div>
      </body>
    </html>
  );
}