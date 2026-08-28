import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { StatusBadge } from "@/components/ui/status-badge";
import { createDemoScenario } from "@/domain/demo";
import { requireDemoSession } from "@/lib/demo-session";

export default async function CitizenHomePage() {
  const session = await requireDemoSession();

  const scenario = createDemoScenario(session.scenarioId);

  return (
    <section className="py-16 sm:py-24">
      <PageContainer className="max-w-4xl">
        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-10">
          <p className="eyebrow">Your demo home</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Welcome, {scenario.citizen.name}</h1>
          <p className="mt-5 text-body-lg">This is a small proof that the synthetic demo session is active. The full citizen home will be built in a later step.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-teal-200 bg-teal-50 p-5"><p className="text-sm font-semibold text-[var(--brand-dark)]">Selected demo scenario</p><p className="mt-2 text-xl font-bold text-slate-950">{scenario.label}</p><p className="mt-2 text-sm leading-6 text-slate-700">Synthetic citizen: {session.citizenId}</p></article>
            <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><p className="text-sm font-semibold text-sky-800">Example claim status</p><div className="mt-3"><StatusBadge severity="info">Under verification</StatusBadge></div><p className="mt-3 text-sm leading-6 text-slate-700">Your example claim is being checked. No action is required in this demo.</p></article>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/claim/status" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]">View example claim status</Link><Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50">Explore public home</Link></div>
          <p className="mt-8 border-t border-[var(--border)] pt-5 text-xs font-medium leading-5 text-[var(--brand-dark)]">Prototype&nbsp; · &nbsp;Synthetic data&nbsp; · &nbsp;Not an official EPFO service</p>
        </div>
      </PageContainer>
    </section>
  );
}
