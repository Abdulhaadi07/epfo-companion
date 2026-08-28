"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PageContainer } from "./page-container";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Track Claim", href: "/track-claim" },
  { label: "Help", href: "/help" },
  { label: "About", href: "/about" },
] as const;

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const closeMobileNav = () => setMobileOpen(false);

  return (
    <header className="border-b border-[var(--border)] bg-white">
      <PageContainer>
        <div className="flex min-h-18 items-center justify-between gap-6 py-3">
          <Link href="/" className="shrink-0 no-underline" onClick={closeMobileNav}>
            <span className="block text-base font-bold tracking-tight text-slate-950">EPFO Companion</span>
            <span className="block text-xs text-[var(--muted)]">Understand. Act. Move forward.</span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950">
                {item.label}
              </Link>
            ))}
            <Link href="/sign-in" className="ml-2 rounded-lg border border-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-dark)] transition-colors hover:bg-teal-50">
              Sign in
            </Link>
          </nav>

          <button ref={menuButtonRef} type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--border)] text-slate-800 lg:hidden" aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen((open) => !open)}>
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className="text-xl leading-none">{mobileOpen ? "×" : "☰"}</span>
          </button>
        </div>

        {mobileOpen && (
          <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-[var(--border)] py-3 lg:hidden">
            <div className="grid gap-1">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} onClick={closeMobileNav} className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-100">{item.label}</Link>
              ))}
              <Link href="/sign-in" onClick={closeMobileNav} className="mt-2 rounded-lg bg-[var(--brand)] px-3 py-3 text-center text-base font-semibold text-white hover:bg-[var(--brand-dark)]">Sign in</Link>
            </div>
          </nav>
        )}
      </PageContainer>
    </header>
  );
}
