import Link from "next/link";
import { signOutSession } from "@/lib/demo-session";
import type { Locale } from "@/i18n/locales";
import type { ShellLabels } from "@/i18n/shell-labels";
import { PageContainer } from "./page-container";
import { MobileNavigation } from "./mobile-navigation";
import { LanguageSelector } from "./language-selector";

type SiteHeaderProps = {
  isAuthenticated: boolean;
  displayName?: string;
  currentLocale: Locale;
  labels: ShellLabels;
};

export function SiteHeader({ isAuthenticated, displayName, currentLocale, labels }: SiteHeaderProps) {
  const accountLabel = displayName ?? labels.myAccount;

  return (
    <header className="relative border-b border-[var(--border)] bg-white">
      <PageContainer>
        <div className="flex min-h-18 items-center justify-between gap-6 py-3">
          <Link href={isAuthenticated ? "/home" : "/"} className="shrink-0 no-underline">
            <span className="block text-base font-bold tracking-tight text-slate-950">{labels.brandName}</span>
            <span className="block text-xs text-[var(--muted)]">{labels.brandTagline}</span>
          </Link>

          <nav aria-label={labels.navPrimary} className="hidden items-center gap-1 lg:flex">
            {labels.navigation.map((item) => <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950">{item.label}</Link>)}
            <LanguageSelector currentLocale={currentLocale} languageLabel={labels.language} className="ml-1" />
            {isAuthenticated ? (
              <div className="relative ml-2">
                <details>
                  <summary className="group flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors marker:hidden [&::-webkit-details-marker]:hidden hover:border-teal-300 hover:text-teal-900 hover:from-white hover:to-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                    <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] text-sm font-bold text-white">{accountLabel.charAt(0).toUpperCase()}</span>
                    <span className="hidden truncate max-w-[9rem] text-left sm:block">{accountLabel}</span>
                    <span aria-hidden="true" className="text-base text-slate-500 transition-transform group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="absolute right-0 z-30 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5">
                    <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-100">
                      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] text-sm font-bold text-white">{accountLabel.charAt(0).toUpperCase()}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{accountLabel}</p>
                        <p className="truncate text-xs text-[var(--muted)]">{labels.myAccount}</p>
                      </div>
                    </div>
                    <ul className="mt-1 py-1">
                      <li>
                        <Link href="/home" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                          <span aria-hidden="true" className="text-lg text-slate-500">🏠</span>
                          <span>{labels.homeLabel ?? "Home"}</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/claim/status" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                          <span aria-hidden="true" className="text-lg text-slate-500">📋</span>
                          <span>{labels.navigation.find((n) => n.href === "/claim/status")?.label ?? labels.myClaimsLabel ?? "My claims"}</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/help" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                          <span aria-hidden="true" className="text-lg text-slate-500">💬</span>
                          <span>{labels.navigation.find((n) => n.href === "/help")?.label ?? "Help"}</span>
                        </Link>
                      </li>
                    </ul>
                    <div className="border-t border-slate-100 pt-2 mt-1">
                      <form action={signOutSession}>
                        <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">
                          <span aria-hidden="true" className="text-lg text-rose-500">↩</span>
                          <span>{labels.signOut}</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </details>
              </div>
            ) : <Link href="/login" className="ml-2 rounded-lg border border-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-dark)] transition-colors hover:bg-teal-50">{labels.signIn}</Link>}
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSelector currentLocale={currentLocale} languageLabel={labels.language} />
            <MobileNavigation
              isAuthenticated={isAuthenticated}
              navigation={labels.navigation}
              signOutAction={signOutSession}
              displayName={accountLabel}
              signInLabel={labels.signIn}
              signOutLabel={labels.signOut}
              openMenuLabel={labels.openMenu}
              closeMenuLabel={labels.closeMenu}
              navLabel={labels.navMobile}
            />
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
