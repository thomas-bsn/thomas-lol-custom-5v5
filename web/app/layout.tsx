import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBootReset from "./ClientBootReset";
import HelpTournamentButton from "./HelpTournamentButton";
import Sidebar from "./Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "THOMAS - LOL TOURNAMENT",
  description: "A simple app to manage League of Legends tournaments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ClientBootReset />
        <HelpTournamentButton />

        {/* Background vidéo */}
        <div className="video-bg">
          <video autoPlay loop muted playsInline preload="auto">
            <source src="/bg.mp4" type="video/mp4" />
          </video>
          <div className="video-overlay" />
        </div>

        {/* Shell = sidebar + contenu */}
        <div className="shell">
          <Sidebar />

          <div className="content">
            <div className="content-inner">
              <header className="app-header">
                <h1 className="app-title">THOMA$ - LoL Tournamement</h1>
                <p className="app-subtitle">yuuuuuuh</p>
              </header>

              <main>{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
