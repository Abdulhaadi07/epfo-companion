import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { LocalizedMyClaimsListItemView } from "@/i18n/localize-views";
import type { MyClaimsPageLabels } from "@/i18n/localize-views";

type MyClaimsListProps = {
  claims: readonly LocalizedMyClaimsListItemView[];
  labels: MyClaimsPageLabels;
};

const accentBySeverity: Record<LocalizedMyClaimsListItemView["presentation"]["severity"], string> = {
  neutral: "border-l-slate-400",
  success: "border-l-emerald-500",
  info: "border-l-sky-500",
  warning: "border-l-amber-500",
  danger: "border-l-rose-500",
};

function ClaimListItem({ claim, labels }: { claim: LocalizedMyClaimsListItemView; labels: MyClaimsPageLabels }) {
  const showReasonCallout = claim.actionRequired && claim.reasonSummaries.length > 0;
  const ctaHref = claim.actionRequired ? claim.primaryAction.href : claim.viewHref;
  const ctaLabel = claim.primaryAction.label;

  return (
    <article
      className={`rounded-2xl border border-[var(--border)] border-l-4 bg-white p-5 shadow-sm sm:p-6 ${accentBySeverity[claim.presentation.severity]}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">{claim.title}</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">{labels.updatedPrefix} {claim.updatedDisplay}</p>
        </div>
        <StatusBadge severity={claim.presentation.severity}>{claim.presentation.label}</StatusBadge>
      </div>

      {showReasonCallout ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">{labels.whatNeedsFixing}</p>
          <ul className="mt-2 space-y-2 text-sm font-medium leading-6 text-slate-900">
            {claim.reasonSummaries.map((summary) => (
              <li key={summary}>{summary}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-800">{claim.presentation.situation}</p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={ctaHref}
          className={
            claim.actionRequired
              ? "inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
              : "inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--brand-dark)] hover:bg-slate-50"
          }
        >
          {ctaLabel}
        </Link>
        {!claim.isSettled && !claim.actionRequired ? (
          <Link
            href={claim.viewHref}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline"
          >
            {labels.viewDetails}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function MyClaimsList({ claims, labels }: MyClaimsListProps) {
  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <ClaimListItem key={claim.id} claim={claim} labels={labels} />
      ))}
    </div>
  );
}

type MyClaimsEmptyStateProps = {
  title: string;
  description: string;
  startPfClaimLabel: string;
};

export function MyClaimsEmptyState({ title, description, startPfClaimLabel }: MyClaimsEmptyStateProps) {
  return (
    <article className="rounded-2xl border border-[var(--border)] border-l-4 border-l-slate-400 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-800">
        {description}
      </p>
      <Link
        href="/claim/start"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
      >
        {startPfClaimLabel}
      </Link>
    </article>
  );
}
