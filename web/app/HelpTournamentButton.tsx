"use client";

import { useRouter } from "next/navigation";

export default function HelpTournamentButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/tuto")}
      className="fixed bottom-6 right-6 z-50 rounded-xl border bg-black/70 backdrop-blur px-4 py-3 text-sm hover:bg-black"
    >
      Comment rejoindre un tournoi LoL ?
    </button>
  );
}