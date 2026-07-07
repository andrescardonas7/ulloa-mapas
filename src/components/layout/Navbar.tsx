"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { mainNavItems } from "@/lib/navigation";

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold text-brand-dark"
        >
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-xl bg-brand-red text-sm font-bold text-white shadow-sm"
          >
            UM
          </span>
          <span>Ulloa en Mapas</span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-brand-border px-3 py-2 text-sm font-medium text-brand-muted transition-colors hover:bg-brand-red-soft hover:text-brand-red-text md:hidden"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Cerrar" : "Menú"}
        </button>

        <nav
          id="main-navigation"
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-full flex-col gap-1 border-b border-brand-border bg-surface px-4 py-3 shadow-sm md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          {mainNavItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-red-soft text-brand-red-text"
                    : "text-brand-muted hover:bg-brand-red-soft hover:text-brand-red-text"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
