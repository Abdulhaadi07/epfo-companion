"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavigationItem = { label: string; href: string };
type MobileNavigationProps = {
  isAuthenticated: boolean;
  navigation: readonly NavigationItem[];
  signOutAction: () => Promise<void>;
  displayName: string;
  signInLabel: string;
  signOutLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  navLabel: string;
};

export function MobileNavigation({
  isAuthenticated,
  navigation,
  signOutAction,
  displayName,
  signInLabel,
  signOutLabel,
  openMenuLabel,
  closeMenuLabel,
  navLabel,
}: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return <>
    <button ref={buttonRef} type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--border)] text-slate-800 lg:hidden" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}><span className="sr-only">{open ? closeMenuLabel : openMenuLabel}</span><span aria-hidden="true" className="text-xl leading-none">{open ? "×" : "☰"}</span></button>
    {open && <nav id="mobile-navigation" aria-label={navLabel} className="absolute left-0 right-0 top-full border-b border-[var(--border)] bg-white px-4 py-3 shadow-md lg:hidden"><div className="mx-auto grid max-w-6xl gap-1">{navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-100">{item.label}</Link>)}{isAuthenticated ? <form action={signOutAction} className="mt-2"><button type="submit" className="w-full rounded-lg bg-slate-100 px-3 py-3 text-left text-base font-semibold text-slate-800">{displayName} · {signOutLabel}</button></form> : <Link href="/login" onClick={() => setOpen(false)} className="mt-2 rounded-lg bg-[var(--brand)] px-3 py-3 text-center text-base font-semibold text-white hover:bg-[var(--brand-dark)]">{signInLabel}</Link>}</div></nav>}
  </>;
}
