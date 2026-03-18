"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const username = params.get("username");
    const avatarUrl = params.get("avatarUrl");

    if (token) {
      localStorage.setItem("jwt", token);
      localStorage.setItem("discord_username", username ?? "");
      localStorage.setItem("discord_avatar", avatarUrl ?? "");
    }

    router.replace("/account");
  }, []);

  return <div style={{ padding: "24px", color: "white" }}>Connexion en cours…</div>;
}

export default function AccountCallbackPage() {
  return (
    <Suspense fallback={<div style={{ padding: "24px", color: "white" }}>Chargement…</div>}>
      <CallbackHandler />
    </Suspense>
  );
}