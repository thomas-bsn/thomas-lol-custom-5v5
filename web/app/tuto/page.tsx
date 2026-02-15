"use client";

import { useRouter } from "next/navigation";

export default function TutoPage() {
  const router = useRouter();

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Rejoindre un tournoi LoL</h1>
        <button className="rounded-lg border px-4 py-2" onClick={() => router.back()}>
          Retour
        </button>
      </div>

      <p className="text-sm opacity-80 mt-2">
        Objectif: rejoindre le lobby du tournoi à partir du code généré par le site.
      </p>

      <div className="mt-8 space-y-10">
        <section className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">1) Aller dans l’onglet Jouer</h2>
          <p className="text-sm opacity-80 mt-2">
            Clique sur <strong>Jouer</strong> en haut à gauche du client League of Legends.
          </p>
          <img
            src="/1.png"
            alt="Étape 1 - Cliquer sur Jouer"
            className="mt-4 w-full rounded-lg border"
          />
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">2) Cliquer sur l’icône trophée</h2>
          <p className="text-sm opacity-80 mt-2">
            Dans l’écran des modes de jeu, clique sur le <strong>logo du trophée</strong>
            (tournois).
          </p>
          <img
            src="/2.png"
            alt="Étape 2 - Cliquer sur le trophée"
            className="mt-4 w-full rounded-lg border"
          />
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">3) Entrer le code et rejoindre</h2>
          <p className="text-sm opacity-80 mt-2">
            Colle le <strong>code fourni par le site</strong> dans le champ, puis clique sur{" "}
            <strong>Join</strong>.
          </p>
          <img
            src="/3.png"
            alt="Étape 3 - Entrer le code"
            className="mt-4 w-full rounded-lg border"
          />
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Dépannage rapide</h2>
          <ul className="mt-2 text-sm opacity-80 list-disc pl-5 space-y-1">
            <li>Le bouton <strong>Join</strong> est grisé: vérifie que le code est complet.</li>
            <li>Code invalide: assure-toi d’être sur le bon compte / bon serveur.</li>
            <li>Rien ne se passe: relance le client LoL, puis réessaie.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}