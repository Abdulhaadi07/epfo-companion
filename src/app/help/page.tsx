import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionIntro } from "@/components/home/section-intro";

const issues = [
  ["claim-stuck", "My claim is stuck", "Understand what the current status means", "Start with claim status"],
  ["claim-rejected", "My claim was rejected", "See possible reasons and the next step", "Review help for rejected claims"],
  ["details-wrong", "My details are wrong", "Find out which information may need attention", "Review details help"],
  ["something-else", "Something else", "Tell us what you are trying to do", "See general guidance"],
] as const;

export default function HelpPage() {
  return (
    <>
      <section className="border-b border-[var(--border)] bg-white py-16 sm:py-24">
        <PageContainer className="max-w-4xl">
          <SectionIntro eyebrow="Help with your next step" title="Something not right?" description="Choose the situation that sounds closest to yours. These are prototype guidance paths, not connections to a live government service." />
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {issues.map(([id, title, description, label]) => <Link key={id} href={`#${id}`} className="group rounded-2xl border border-[var(--border)] bg-slate-50 p-5 hover:border-teal-300 hover:bg-white hover:shadow-sm"><span className="block font-semibold text-slate-950">{title}</span><span className="mt-2 block text-sm leading-6 text-[var(--muted)]">{description}</span><span className="mt-5 block text-sm font-semibold text-[var(--brand-dark)]">{label} <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span></span></Link>)}
          </div>
        </PageContainer>
      </section>

      <section aria-labelledby="guidance-heading" className="py-16 sm:py-20">
        <PageContainer className="max-w-4xl">
          <h2 id="guidance-heading" className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Prototype guidance</h2>
          <div className="mt-7 grid gap-4">
            <article id="claim-stuck" className="scroll-mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6"><h3 className="font-semibold text-slate-950">My claim is stuck</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Start by checking the status and look for three things: what is happening, whether you need to act, and what happens next.</p><Link href="/claim/status" className="mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline">Go to claim status</Link></article>
            <article id="claim-rejected" className="scroll-mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6"><h3 className="font-semibold text-slate-950">My claim was rejected</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">A future resolution flow will explain the reason and guide you through the allowed fix. That flow is not implemented yet.</p><p className="mt-4 text-sm font-semibold text-[var(--brand-dark)]">For now, review the common questions on the home page.</p></article>
            <article id="details-wrong" className="scroll-mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6"><h3 className="font-semibold text-slate-950">My details are wrong</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">No personal information is collected here. The future experience will explain which details need attention before a task can continue.</p><Link href="/" className="mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline">Read common questions</Link></article>
            <article id="something-else" className="scroll-mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6"><h3 className="font-semibold text-slate-950">Something else</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Start with your goal rather than a form name. The home page can point you to the available prototype paths.</p><Link href="/" className="mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline">Back to goals</Link></article>
          </div>
          <p className="mt-8 text-xs font-medium leading-5 text-[var(--brand-dark)]">Prototype&nbsp; · &nbsp;Synthetic data&nbsp; · &nbsp;Not an official EPFO service</p>
        </PageContainer>
      </section>
    </>
  );
}
