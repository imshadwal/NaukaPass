"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boat, QrCode, SignOut } from "@phosphor-icons/react";
import { signOut } from "@/lib/actions/auth";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Boat },
  { href: "/scan", label: "Scan", icon: QrCode },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="nav-float no-print" aria-label="Main">
      <span className="hidden sm:inline pill-host mx-1">TLS Hotels</span>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`btn-ghost !py-2 !px-3 ${active ? "bg-accent text-white hover:bg-accent-hover" : "text-ink-muted"}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={18} weight={active ? "fill" : "regular"} />
            <span className="button-sm">{label}</span>
          </Link>
        );
      })}
      <form action={signOut}>
        <button type="submit" className="btn-ghost !py-2 !px-3 text-ink-muted">
          <SignOut size={18} />
          <span className="button-sm hidden sm:inline">Sign out</span>
        </button>
      </form>
    </nav>
  );
}
