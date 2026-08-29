import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { LocalizedTimelinePreviewItem } from "@/i18n/localize-views";
import type { ClaimOverviewLabels } from "@/i18n/localize-views";
import type { ClaimPresentation } from "@/lib/claim-presentation";

type ClaimOverviewProps = {
  title: string;
  presentation: ClaimPresentation;
  reasonSummaries: readonly string[];
  timelinePreview: readonly LocalizedTimelinePreviewItem[];
  labels: ClaimOverviewLabels;
};

const accentBySeverity: Record<ClaimPresentation["severity"], string> = {
  neutral: "border-l-slate-400",
  success: "border-l-emerald-500",
  info: "border-l-sky-500",
  warning: "border-l-amber-500",
  danger: "border-l-rose-500",
};

function ActionStanceBanner({
  presentation,
  labels,
}: {
  presentation: ClaimPresentation;
  labels: ClaimOverviewLabels;
}) {
  if (presentation.severity === "success" && presentation.actionRequired) {
    return (
      <div
        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
        role="status"
      >
        <p className="font-semibold text-emerald-950">{labels.readyToProceed}</p>
        <p className="mt-1 text-sm leading-6 text-emerald-900">
          {labels.readyToProceedMessage}
        </p>
      </div>
    );
  }

  if (presentation.severity === "danger") {
    return (
      <div
        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
        role="status"
      >
        <p className="font-semibold text-rose-950">{labels.reviewNeeded}</p>
        <p className="mt-1 text-sm leading-6 text-rose-900">
          {labels.reviewNeededMessage}
        </p>
      </div>
    );
  }

  if (presentation.actionRequired) {
    return (
      <div
        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
        role="status"
      >
        <p className="font-semibold text-amber-950">{labels.actionNeeded}</p>
        <p className="mt-1 text-sm leading-6 text-amber-900">
          {labels.actionNeededMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3"
      role="status"
    >
      <p className="font-semibold text-sky-950">{labels.noActionNeeded}</p>
      <p className="mt-1 text-sm leading-6 text-sky-900">
        {presentation.actionMessage}
      </p>
    </div>
  );
}

export function ClaimOverview({ title, presentation, reasonSummaries, timelinePreview, labels }: ClaimOverviewProps) {
  const showReasonCallout = presentation.actionRequired && reasonSummaries.length > 0;
  const primaryCta = presentation.actionRequired;

  return (
    <article
      className={`rounded-2xl border border-[var(--border)] border-l-4 bg-white p-5 shadow-sm sm:p-6 ${accentBySeverity[presentation.severity]}`}
      aria-labelledby="active-claim-heading"
    >
      <ActionStanceBanner presentation={presentation} labels={labels} />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <h2 id="active-claim-heading" className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
          {title}
        </h2>
        <StatusBadge severity={presentation.severity}>{presentation.label}</StatusBadge>
      </div>

      {showReasonCallout ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">{labels.whatNeedsFixing}</p>
          <ul className="mt-2 space-y-2 text-sm font-medium leading-6 text-slate-900">
            {reasonSummaries.map((summary) => (
              <li key={summary}>{summary}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm leading-6 text-slate-800">
            <span className="font-semibold text-slate-950">{labels.whyThisMatters} </span>
            {presentation.situation}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-base leading-7 text-slate-800">{presentation.situation}</p>
      )}

      <div className="mt-6">
        <Link
          href={presentation.actionHref}
          className={
            primaryCta
              ? "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] sm:w-auto"
              : "inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--brand-dark)] hover:bg-slate-50 sm:w-auto"
          }
        >
          {presentation.actionLabel}
        </Link>
      </div>

      <div className="mt-6 space-y-4 border-t border-[var(--border)] pt-5">
        {showReasonCallout ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{labels.yourNextStep}</p>
            <p className="mt-2 text-sm leading-6 text-slate-800">{presentation.nextStep}</p>
          </div>
        ) : (
          <>
            {presentation.actionRequired ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{labels.whatYouCanDo}</p>
                <p className="mt-2 text-sm leading-6 text-slate-800">{presentation.actionMessage}</p>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{labels.whatHappensNext}</p>
              <p className="mt-2 text-sm leading-6 text-slate-800">{presentation.nextStep}</p>
            </div>
          </>
        )}
      </div>

      {timelinePreview.length > 0 ? (
        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{labels.recentUpdates}</p>
          <ol className="mt-3 space-y-3" aria-label={labels.claimTimeline}>
            {timelinePreview.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-1 border-l-2 border-slate-200 pl-3 text-sm leading-6 text-slate-800 sm:flex-row sm:items-center sm:justify-between sm:border-l-0 sm:pl-0"
              >
                <span>{item.label}</span>
                <time className="text-xs text-[var(--muted)]">{item.occurredAtDisplay}</time>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </article>
  );
}
