import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ClaimPresentation } from "@/lib/claim-presentation";

type ClaimOverviewProps = { presentation: ClaimPresentation };

export function ClaimOverview({ presentation }: ClaimOverviewProps) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-md sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="eyebrow">Active claim</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">PF withdrawal claim</h2></div>
        <StatusBadge severity={presentation.severity}>{presentation.label}</StatusBadge>
      </div>
      <div className="mt-8 grid gap-6 border-y border-[var(--border)] py-6 md:grid-cols-3">
        <div><p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">What is happening?</p><p className="mt-2 text-sm leading-6 text-slate-800">{presentation.situation}</p></div>
        <div><p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Do I need to act?</p><p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{presentation.actionMessage}</p></div>
        <div><p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">What happens next?</p><p className="mt-2 text-sm leading-6 text-slate-800">{presentation.nextStep}</p></div>
      </div>
      <Link href={presentation.actionHref} className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] sm:w-auto">{presentation.actionLabel}</Link>
    </article>
  );
}
