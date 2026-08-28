import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { GoalCard } from "@/components/home/goal-card";
import { SectionIntro } from "@/components/home/section-intro";
import { StatusBadge } from "@/components/ui/status-badge";

const goals = [
  { title: "Get my PF", description: "Find out if you are ready to withdraw your PF.", href: "/claim/start", label: "Start here", primary: true },
  { title: "Track my claim", description: "See what is happening and what comes next.", href: "/claim/status", label: "Check status" },
  { title: "Transfer my PF", description: "Move your PF balance when you change jobs.", href: "/services/transfer", label: "Explore transfer" },
  { title: "Fix a problem", description: "Understand an issue and find your next step.", href: "/help", label: "Get help" },
] as const;

const tasks = [
  ["Withdraw my PF", "Check readiness and start a withdrawal", "/claim/start"],
  ["Track my claim", "Understand the current status", "/claim/status"],
  ["Transfer my PF", "Move savings from an old job", "/services/transfer"],
  ["Update my KYC", "Keep your details ready for a claim", "/services/update-kyc"],
  ["Check employment history", "Review the jobs linked to your PF", "/services/employment-history"],
  ["Fix a problem", "Find help for a claim or account issue", "/help"],
] as const;

const questions = [
  ["What does “under verification” mean?", "Your claim has been received and is being checked. You do not need to do anything right now. We will show you the next step when the status changes."],
  ["Why hasn’t my PF arrived yet?", "A claim can take time while details are checked or payment is being processed. Track your claim to see the latest update and whether you need to act."],
  ["Why was my claim rejected?", "A rejection means something in the claim needs attention. The reason should point you to the specific detail or document to fix before trying again."],
  ["Do I need to do anything while my claim is under verification?", "No. If no action is required, you can wait and check your claim status again later."],
  ["What can I do if my bank details are wrong?", "Choose the option to fix a problem so you can review the bank information and see what needs to be updated in this prototype."],
  ["Can I submit my claim again?", "If a claim is rejected or an issue is resolved, you may be able to submit it again. First check the reason and complete the suggested fix."],
] as const;

const issues = [
  ["My claim is stuck", "Understand what the current status means", "/claim/status"],
  ["My claim was rejected", "See possible reasons and next steps", "/help"],
  ["My details are wrong", "Find out what information needs attention", "/help"],
  ["Something else", "Tell us what you are trying to do", "/help"],
] as const;

export default function Home() {
  return (
    <>
      <section className="overflow-hidden border-b border-[var(--border)] bg-white">
        <PageContainer className="py-14 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="eyebrow">A clearer way to find your next step</p>
              <h1 className="mt-4 text-display max-w-2xl">What do you need to get done?</h1>
              <p className="mt-6 text-body-lg max-w-xl">Find the right service, understand what’s happening, and know what to do next.</p>
              <form action="/claim/start" className="mt-8 max-w-xl rounded-2xl border border-[var(--border)] bg-slate-50 p-2 shadow-sm sm:flex sm:items-center">
                <label htmlFor="home-question" className="sr-only">Describe what you need help with</label>
                <input id="home-question" name="q" type="text" placeholder="Mera PF abhi tak nahi aaya..." className="min-h-12 w-full rounded-xl border-0 bg-transparent px-4 text-base text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                <button type="submit" className="mt-2 min-h-12 w-full rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-dark)] sm:mt-0 sm:w-auto">Continue</button>
              </form>
              <p className="mt-3 text-xs text-[var(--muted)]">Try describing your situation in your own words.</p>
            </div>
            <div className="rounded-3xl bg-[#e8f4f1] p-5 sm:p-7">
              <div className="mb-4 flex items-center justify-between gap-4"><p className="text-sm font-semibold text-[var(--brand-dark)]">Start with a goal</p><span aria-hidden="true" className="text-2xl text-teal-700">↗</span></div>
              <div className="grid gap-3 sm:grid-cols-2">{goals.map((goal) => <GoalCard key={goal.title} {...goal} />)}</div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section aria-labelledby="tasks-heading" className="py-16 sm:py-20"><PageContainer>
        <SectionIntro id="tasks-heading" eyebrow="Services, in plain language" title="Your PF tasks" description="Choose what you are trying to do. You do not need to know the name of a form to get started." />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tasks.map(([title, description, href]) => <Link key={title} href={href} className="group flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"><span><span className="block font-semibold text-slate-950">{title}</span><span className="mt-1 block text-sm leading-5 text-[var(--muted)]">{description}</span></span><span aria-hidden="true" className="shrink-0 text-xl text-[var(--brand)] transition-transform group-hover:translate-x-1">→</span></Link>)}</div>
      </PageContainer></section>

      <section aria-labelledby="notices-heading" className="border-y border-[var(--border)] bg-white py-14 sm:py-16"><PageContainer>
        <SectionIntro id="notices-heading" eyebrow="A quick heads-up" title="Important for you" description="Small updates that may help you plan your next step." />
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><StatusBadge severity="warning">Helpful information</StatusBadge><h3 className="mt-4 text-lg font-semibold text-slate-950">Keep your bank details ready</h3><p className="mt-2 text-sm leading-6 text-slate-700">Before starting a withdrawal, check that the account details you plan to use are current.</p></article>
          <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><StatusBadge severity="info">Service update</StatusBadge><h3 className="mt-4 text-lg font-semibold text-slate-950">Some checks may take longer</h3><p className="mt-2 text-sm leading-6 text-slate-700">This prototype uses synthetic services. Demo status updates are designed to show what different outcomes can mean.</p></article>
        </div>
      </PageContainer></section>

      <section aria-labelledby="questions-heading" className="py-16 sm:py-20"><PageContainer className="max-w-4xl">
        <SectionIntro id="questions-heading" eyebrow="Need a quick answer?" title="Common questions" description="Plain-language answers to questions people often have about PF claims." />
        <div className="mt-8 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white px-5 sm:px-7">{questions.map(([question, answer]) => <details key={question} className="group py-5"><summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-6 text-base font-semibold text-slate-950 marker:hidden [&::-webkit-details-marker]:hidden">{question}<span aria-hidden="true" className="text-xl font-normal text-[var(--brand)] transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-[var(--muted)]">{answer}</p></details>)}</div>
      </PageContainer></section>

      <section aria-labelledby="help-heading" className="bg-[#123b3b] py-16 text-white sm:py-20"><PageContainer>
        <SectionIntro id="help-heading" eyebrow="You do not have to figure it out alone" title="Something not right?" description="Tell us what is closest to your situation and we will point you towards the next step." light />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{issues.map(([title, description, href]) => <Link key={title} href={href} className="group rounded-2xl border border-white/20 bg-white/10 p-5 transition hover:bg-white/15"><span className="block font-semibold">{title}</span><span className="mt-2 block text-sm leading-5 text-teal-100">{description}</span><span aria-hidden="true" className="mt-5 block text-xl text-teal-200 transition-transform group-hover:translate-x-1">→</span></Link>)}</div>
      </PageContainer></section>

      <section aria-labelledby="about-heading" className="py-16 sm:py-20"><PageContainer className="max-w-3xl">
        <SectionIntro id="about-heading" eyebrow="About EPFO Companion" title="Public services should feel understandable." description="EPFO Companion is an independent citizen-first prototype exploring simpler public-service journeys. It helps people discover a service, understand what is happening, and see what to do next." />
        <p className="mt-6 inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-[var(--brand-dark)]">Prototype&nbsp; · &nbsp;Synthetic data&nbsp; · &nbsp;Not an official EPFO service</p>
      </PageContainer></section>
    </>
  );
}
