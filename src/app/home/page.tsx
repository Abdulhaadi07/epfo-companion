import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { ClaimOverview } from "@/components/home/claim-overview";
import { ClaimQuestion } from "@/components/home/claim-question";
import { CitizenSummary } from "@/components/home/citizen-summary";
import { createDemoScenario } from "@/domain/demo";
import { getClaimPresentation } from "@/lib/claim-presentation";
import { requireDemoSession } from "@/lib/demo-session";

function formatCurrencyInPaise(amountInPaise: number) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", maximumFractionDigits: 2, style: "currency" }).format(amountInPaise / 100);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00Z`));
}

export default async function CitizenHomePage() {
  const session = await requireDemoSession();
  const scenario = createDemoScenario(session.scenarioId);
  const presentation = getClaimPresentation(scenario.claim.status);

  return (
    <section className="py-12 sm:py-16">
      <PageContainer className="max-w-5xl">
        <div className="mb-9 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Your demo home</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Welcome back, {scenario.citizen.name}</h1><p className="mt-4 text-body-lg">Here is the latest view of your PF task.</p></div><p className="text-xs font-medium text-[var(--brand-dark)]">Synthetic account · Demo only</p></div>

        <ClaimOverview presentation={presentation} />
        <CitizenSummary balance={formatCurrencyInPaise(scenario.pfAccount.balanceInPaise)} employer={scenario.employment.employerName} employmentDates={`${formatDate(scenario.employment.startDate)} – ${formatDate(scenario.employment.endDate)}`} readiness={presentation.readinessSummary} />
        <ClaimQuestion />

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-[var(--muted)]">This account uses synthetic data. It is not an official EPFO service.</p><Link href="/" className="inline-flex min-h-11 items-center font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline">Explore public experience</Link></div>
      </PageContainer>
    </section>
  );
}
