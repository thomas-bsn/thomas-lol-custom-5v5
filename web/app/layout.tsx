import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBootReset from "./ClientBootReset";
import HelpTournamentButton from "./HelpTournamentButton";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <ClientBootReset />
        <HelpTournamentButton />
        {/* Background vidéo */}
        <div className="video-bg">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src="/bg.mp4" type="video/mp4" />
          </video>
          <div className="video-overlay" />
        </div>

        {/* Contenu */}
        <div className="app-content">
          {/* Titre global */}
          <header className="app-header">
            <h1 className="app-title">Team Picker</h1>
            <p className="app-subtitle">Création d’équipes rapides</p>
          </header>

          {/* Pages */}
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}