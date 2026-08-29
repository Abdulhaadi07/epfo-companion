import type { LocalizedReadinessView } from "@/i18n/localize-views";
import type { CitizenSummaryLabels } from "@/i18n/localize-views";

type CitizenSummaryProps = {
  accountSummary: { balanceDisplay: string };
  employmentSummary: { employerName: string; periodDisplay: string };
  readiness: LocalizedReadinessView;
  labels: CitizenSummaryLabels;
};

const statusIndicators = {
  READY: { symbol: "✓", className: "bg-emerald-100 text-emerald-800" },
  UNDER_VERIFICATION: { symbol: "…", className: "bg-sky-100 text-sky-800" },
  ACTION_REQUIRED: { symbol: "!", className: "bg-amber-100 text-amber-900" },
  REJECTED: { symbol: "✕", className: "bg-rose-100 text-rose-800" },
} as const;

export function CitizenSummary({ accountSummary, employmentSummary, readiness, labels }: CitizenSummaryProps) {
  return (
    <section aria-labelledby="account-details-heading" className="mt-8">
      <h2 id="account-details-heading" className="text-lg font-semibold text-slate-950">
        {labels.accountTitle}
      </h2>
      <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-[var(--muted)]">{labels.balanceLabel}</dt>
            <dd className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              {accountSummary.balanceDisplay}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[var(--muted)]">{labels.employmentLabel}</dt>
            <dd className="mt-1 font-semibold text-slate-950">{employmentSummary.employerName}</dd>
            <dd className="mt-1 text-sm text-[var(--muted)]">{employmentSummary.periodDisplay}</dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-950">{labels.readinessTitle}</h3>
            <p className="text-sm text-[var(--muted)]">{readiness.overallLabel}</p>
          </div>
          <ul className="mt-4 space-y-3" aria-label={labels.readinessChecksLabel}>
            {readiness.dimensions.map((dimension) => {
              const indicator = statusIndicators[dimension.status];

              return (
                <li key={dimension.key} className="flex items-start gap-3 text-sm leading-6 text-slate-800">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${indicator.className}`}
                  >
                    {indicator.symbol}
                  </span>
                  <span>
                    <span className="font-medium text-slate-950">{dimension.displayLabel}</span>
                    {dimension.status === "UNDER_VERIFICATION" ? (
                      <span className="block text-[var(--muted)]">{labels.usuallyTakesFewDays}</span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
