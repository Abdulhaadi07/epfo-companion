import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ClaimOverview } from "@/components/home/claim-overview";
import { ClaimQuestion } from "@/components/home/claim-question";
import { CitizenSummary } from "@/components/home/citizen-summary";
import { getCitizenHomeView } from "@/application/citizen-home";
import { localizeCitizenHomeView } from "@/i18n/localize-views";
import { getTranslator } from "@/i18n/server";
import { requireSession } from "@/lib/demo-session";

export default async function CitizenHomePage() {
  const session = await requireSession();
  const view = await getCitizenHomeView(session.userId);
  if (!view) notFound();

  const { t } = await getTranslator();
  const localized = localizeCitizenHomeView(t, view);

  return (
    <section className="py-6 sm:py-8">
      <PageContainer className="max-w-3xl">
        <header className="mb-6">
          <p className="text-sm font-medium text-[var(--muted)]">
            {localized.greeting.hiLabel} {localized.greeting.displayName}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {localized.taskHeadline}
          </h1>
        </header>

        {localized.activeClaim ? (
          <ClaimOverview
            title={localized.activeClaim.title}
            presentation={localized.activeClaim.presentation}
            reasonSummaries={localized.activeClaim.reasonSummaries}
            timelinePreview={localized.activeClaim.timelinePreview}
            labels={localized.claimOverviewLabels}
          />
        ) : (
          <article className="rounded-2xl border border-[var(--border)] border-l-4 border-l-emerald-500 bg-white p-5 shadow-sm sm:p-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3" role="status">
              <p className="font-semibold text-emerald-950">{localized.noClaim.readyToBegin}</p>
              <p className="mt-1 text-sm leading-6 text-emerald-900">
                {localized.noClaim.readyToBeginMessage}
              </p>
            </div>
            <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">{localized.noClaim.startWithdrawalTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-800">
              {localized.noClaim.startWithdrawalDescription}
            </p>
            <Link
              href="/claim/start"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] sm:w-auto"
            >
              {localized.noClaim.startPfClaim}
            </Link>
          </article>
        )}

        <CitizenSummary
          accountSummary={localized.accountSummary}
          employmentSummary={localized.employmentSummary}
          readiness={localized.readiness}
          labels={localized.citizenSummaryLabels}
        />
        <ClaimQuestion helpPrompt={localized.helpPrompt} />

        <div className="mt-8 border-t border-[var(--border)] pt-5">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline"
          >
            {localized.explorePublicExperience}
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
