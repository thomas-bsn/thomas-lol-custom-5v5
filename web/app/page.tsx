"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";

export default function HomePage() {
  const router = useRouter();
  const { state, hydrated } = useAppState();

  useEffect(() => {
    if (!hydrated) return;

    const hasPlayers = Boolean(state?.players && state.players.length === 10);
    const gameStatus = state?.game?.status;

    if (gameStatus === "wip" || gameStatus === "running") {
      router.replace("/game");
      return;
    }

    if (hasPlayers) {
      router.replace("/mode");
      return;
    }

    router.replace("/setup");
  }, [hydrated, state, router]);

  return <main className="p-6">Chargement…</main>;
}