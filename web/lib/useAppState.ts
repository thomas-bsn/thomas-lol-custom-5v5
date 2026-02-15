"use client";

import { useEffect, useState } from "react";
import type { AppState } from "./appState";
import { loadState, saveState } from "./appState";

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  function update(next: AppState | null) {
    setState(next);
    if (next) saveState(next);
  }

  return { state, update, hydrated };
}