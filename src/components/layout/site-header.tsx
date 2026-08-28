import Link from "next/link";
import { signOutDemoSession } from "@/lib/demo-session";
import { PageContainer } from "./page-container";
import { MobileNavigation } from "./mobile-navigation";
import { getNavigation } from "./navigation";

type SiteHeaderProps = { isAuthenticated: boolean };

export function SiteHeader({ isAuthenticated }: SiteHeaderProps) {
  const navigation = getNavigation(isAuthenticated);

  return (
    <header className="relative border-b border-[var(--border)] bg-white">
      <PageContainer>
        <div className="flex min-h-18 items-center justify-between gap-6 py-3">
          <Link href={isAuthenticated ? "/home" : "/"} className="shrink-0 no-underline">
            <span className="block text-base font-bold tracking-tight text-slate-950">EPFO Companion</span>
            <span className="block text-xs text-[var(--muted)]">Understand. Act. Move forward.</span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950">{item.label}</Link>)}
            {isAuthenticated ? (
              <details className="relative ml-2">
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg border border-[var(--brand)] px-4 text-sm font-semibold text-[var(--brand-dark)] marker:hidden [&::-webkit-details-marker]:hidden">Demo Citizen <span aria-hidden="true">⌄</span></summary>
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-[var(--border)] bg-white p-2 shadow-lg"><form action={signOutDemoSession}><button type="submit" className="min-h-11 w-full rounded-lg px-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">Sign out</button></form></div>
              </details>
            ) : <Link href="/login" className="ml-2 rounded-lg border border-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-dark)] transition-colors hover:bg-teal-50">Sign in</Link>}
          </nav>

          <MobileNavigation isAuthenticated={isAuthenticated} navigation={navigation} signOutAction={signOutDemoSession} />
        </div>
      </PageContainer>
    </header>
  );
}
