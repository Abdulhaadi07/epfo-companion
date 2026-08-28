import Link from "next/link";
import { PageContainer } from "./page-container";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <PageContainer className="flex flex-col gap-6 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-semibold text-slate-950">EPFO Companion</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">A citizen-first experience layer for understanding and navigating complex EPFO journeys.</p>
        </div>
        <div className="flex flex-col gap-3 text-sm sm:items-end">
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-4 gap-y-2 text-slate-600">
            <Link href="/help" className="underline-offset-4 hover:text-slate-950 hover:underline">Help</Link>
            <Link href="/about" className="underline-offset-4 hover:text-slate-950 hover:underline">About</Link>
          </nav>
          <p className="font-medium text-[var(--brand-dark)]">Prototype&nbsp; · &nbsp;Synthetic data&nbsp; · &nbsp;Not an official EPFO service</p>
        </div>
      </PageContainer>
    </footer>
  );
}
