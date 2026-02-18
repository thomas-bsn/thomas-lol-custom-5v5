"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/picker", label: "Picker" },
  { href: "/tier", label: "Tier" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">Team Picker</div>
      <nav className="nav">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link key={it.href} href={it.href} className={`link ${active ? "active" : ""}`}>
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
