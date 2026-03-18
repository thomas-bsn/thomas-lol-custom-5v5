"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const items = [
  { href: "/picker", label: "Picker", icon: "⚔️" },
  { href: "/tier", label: "Tier List", icon: "🏆" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; avatar: string } | null>(null);

  useEffect(() => {
    const username = localStorage.getItem("discord_username");
    const avatar = localStorage.getItem("discord_avatar");
    if (username) setUser({ username, avatar: avatar ?? "" });
  }, []);

  function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("discord_username");
    localStorage.removeItem("discord_avatar");
    setUser(null);
    router.push("/");
  }

  return (
    <aside style={{
      width: "200px", flexShrink: 0, padding: "20px 12px",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)",
      position: "sticky", top: 0, height: "100vh",
      display: "flex", flexDirection: "column", gap: "24px",
    }}>

      {/* Brand */}
      <div style={{ padding: "4px 8px" }}>
        <div style={{ color: "white", fontWeight: 800, fontSize: "15px" }}>THOMA$</div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginTop: "2px" }}>LoL Tournament</div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link key={it.href} href={it.href} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 12px", borderRadius: "9px", textDecoration: "none",
              background: active ? "rgba(124,92,255,0.15)" : "transparent",
              border: active ? "1px solid rgba(124,92,255,0.3)" : "1px solid transparent",
              color: active ? "white" : "rgba(255,255,255,0.45)",
              fontSize: "13px", fontWeight: active ? 600 : 400, transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "14px" }}>{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </nav>

      {/* Bas de sidebar — compte */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
        {user ? (
          // Connecté
          <div>
            <Link href="/account" style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 10px", borderRadius: "9px", textDecoration: "none",
              background: pathname === "/account" ? "rgba(124,92,255,0.15)" : "transparent",
              border: pathname === "/account" ? "1px solid rgba(124,92,255,0.3)" : "1px solid transparent",
              marginBottom: "6px",
            }}>
              <img
                src={user.avatar}
                style={{ width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0 }}
              />
              <span style={{ color: "white", fontSize: "12px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.username}
              </span>
            </Link>
            <button onClick={logout} style={{
              width: "100%", padding: "7px", borderRadius: "8px",
              border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)",
              color: "rgba(255,80,80,0.7)", fontSize: "12px", cursor: "pointer",
            }}>
              Déconnexion
            </button>
          </div>
        ) : (
          // Non connecté
          <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/discord/login`} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "9px 12px", borderRadius: "9px", textDecoration: "none",
            background: "rgba(88,101,242,0.15)",
            border: "1px solid rgba(88,101,242,0.3)",
            color: "white", fontSize: "13px", fontWeight: 600,
          }}>
            <span>🎮</span>
            Se connecter
          </a>
        )}
      </div>

    </aside>
  );
}