"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AccountCallbackPage() {
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

  return (
    <main style={{ padding: "24px", color: "white" }}>
      Connexion en cours…
    </main>
  );
}