"use client";

import { useEffect } from "react";
import { clearState } from "@/lib/appState";

export default function ClientBootReset() {
  useEffect(() => {
    // reset total à chaque refresh / ouverture du site
    clearState();
  }, []);

  return null;
}