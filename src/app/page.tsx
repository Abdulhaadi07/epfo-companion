import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { GoalCard } from "@/components/home/goal-card";
import { SectionIntro } from "@/components/home/section-intro";
import { StatusBadge } from "@/components/ui/status-badge";
import { LandingHeroInput } from "@/components/home/landing-hero-input";
import { getTranslator } from "@/i18n/server";

export default async function Home() {
  const { t, locale } = await getTranslator();

  const goals = [
    { title: t("landing.goals.withdraw.title"), description: t("landing.goals.withdraw.description"), href: "/claim/start", label: t("landing.goals.withdraw.label"), primary: true },
    { title: t("landing.goals.track.title"), description: t("landing.goals.track.description"), href: "/claim/status", label: t("landing.goals.track.label") },
    { title: t("landing.goals.transfer.title"), description: t("landing.goals.transfer.description"), href: "/services/transfer", label: t("landing.goals.transfer.label") },
    { title: t("landing.goals.help.title"), description: t("landing.goals.help.description"), href: "/help", label: t("landing.goals.help.label") },
  ] as const;

  const tasks: readonly [string, string, string][] = [
    [t("landing.tasks.withdraw.title"), t("landing.tasks.withdraw.description"), "/claim/start"],
    [t("landing.tasks.track.title"), t("landing.tasks.track.description"), "/claim/status"],
    [t("landing.tasks.transfer.title"), t("landing.tasks.transfer.description"), "/services/transfer"],
    [t("landing.tasks.kyc.title"), t("landing.tasks.kyc.description"), "/services/update-kyc"],
    [t("landing.tasks.history.title"), t("landing.tasks.history.description"), "/services/employment-history"],
    [t("landing.tasks.help.title"), t("landing.tasks.help.description"), "/help"],
  ] as const;

  const questions: readonly [string, string][] = [
    [t("landing.faq.q1.question"), t("landing.faq.q1.answer")],
    [t("landing.faq.q2.question"), t("landing.faq.q2.answer")],
    [t("landing.faq.q3.question"), t("landing.faq.q3.answer")],
    [t("landing.faq.q4.question"), t("landing.faq.q4.answer")],
    [t("landing.faq.q5.question"), t("landing.faq.q5.answer")],
    [t("landing.faq.q6.question"), t("landing.faq.q6.answer")],
  ] as const;

  const issues: readonly [string, string, string][] = [
    [t("landing.helpSection.stuck.title"), t("landing.helpSection.stuck.description"), "/claim/status"],
    [t("landing.helpSection.rejected.title"), t("landing.helpSection.rejected.description"), "/help"],
    [t("landing.helpSection.details.title"), t("landing.helpSection.details.description"), "/help"],
    [t("landing.helpSection.other.title"), t("landing.helpSection.other.description"), "/help"],
  ] as const;

  return (
    <>
      <section className="overflow-hidden border-b border-[var(--border)] bg-white">
        <PageContainer className="py-14 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="eyebrow">{t("landing.hero.eyebrow")}</p>
              <h1 className="mt-4 text-display max-w-2xl">{t("landing.hero.title")}</h1>
              <p className="mt-6 text-body-lg max-w-xl">{t("landing.hero.description")}</p>
              <LandingHeroInput
                locale={locale}
                questionLabel={t("landing.hero.questionLabel")}
                questionPlaceholder={t("landing.hero.questionPlaceholder")}
                placeholderAlternate={t("landing.hero.placeholderAlternate")}
                continueLabel={t("landing.hero.continue")}
                voiceButtonLabel={t("landing.hero.voiceButtonLabel")}
                voiceTitle={t("landing.hero.voiceTitle")}
                voiceBody={t("landing.hero.voiceBody")}
                voiceDismissLabel={t("landing.hero.voiceDismiss")}
              />
              <p className="mt-3 text-xs text-[var(--muted)]">{t("landing.hero.questionHint")}</p>
            </div>
            <div className="rounded-3xl bg-[#e8f4f1] p-5 sm:p-7">
              <div className="mb-4 flex items-center justify-between gap-4"><p className="text-sm font-semibold text-[var(--brand-dark)]">{t("landing.goals.sectionTitle")}</p><span aria-hidden="true" className="text-2xl text-teal-700">↗</span></div>
              <div className="grid gap-3 sm:grid-cols-2">{goals.map((goal) => <GoalCard key={goal.title} {...goal} />)}</div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section aria-labelledby="tasks-heading" className="py-16 sm:py-20"><PageContainer>
        <SectionIntro id="tasks-heading" eyebrow={t("landing.tasks.eyebrow")} title={t("landing.tasks.title")} description={t("landing.tasks.description")} />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tasks.map(([title, description, href]) => <Link key={title} href={href} className="group flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"><span><span className="block font-semibold text-slate-950">{title}</span><span className="mt-1 block text-sm leading-5 text-[var(--muted)]">{description}</span></span><span aria-hidden="true" className="shrink-0 text-xl text-[var(--brand)] transition-transform group-hover:translate-x-1">→</span></Link>)}</div>
      </PageContainer></section>

      <section aria-labelledby="notices-heading" className="border-y border-[var(--border)] bg-white py-14 sm:py-16"><PageContainer>
        <SectionIntro id="notices-heading" eyebrow={t("landing.notices.eyebrow")} title={t("landing.notices.title")} description={t("landing.notices.description")} />
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><StatusBadge severity="warning">{t("landing.notices.bank.badgeLabel")}</StatusBadge><h3 className="mt-4 text-lg font-semibold text-slate-950">{t("landing.notices.bank.title")}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t("landing.notices.bank.description")}</p></article>
          <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><StatusBadge severity="info">{t("landing.notices.demo.badgeLabel")}</StatusBadge><h3 className="mt-4 text-lg font-semibold text-slate-950">{t("landing.notices.demo.title")}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t("landing.notices.demo.description")}</p></article>
        </div>
      </PageContainer></section>

      <section aria-labelledby="questions-heading" className="py-16 sm:py-20"><PageContainer className="max-w-4xl">
        <SectionIntro id="questions-heading" eyebrow={t("landing.faq.eyebrow")} title={t("landing.faq.title")} description={t("landing.faq.description")} />
        <div className="mt-8 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white px-5 sm:px-7">{questions.map(([question, answer]) => <details key={question} className="group py-5"><summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-6 text-base font-semibold text-slate-950 marker:hidden [&::-webkit-details-marker]:hidden">{question}<span aria-hidden="true" className="text-xl font-normal text-[var(--brand)] transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-[var(--muted)]">{answer}</p></details>)}</div>
      </PageContainer></section>

      <section aria-labelledby="help-heading" className="bg-[#123b3b] py-16 text-white sm:py-20"><PageContainer>
        <SectionIntro id="help-heading" eyebrow={t("landing.helpSection.eyebrow")} title={t("landing.helpSection.title")} description={t("landing.helpSection.description")} light />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{issues.map(([title, description, href]) => <Link key={title} href={href} className="group rounded-2xl border border-white/20 bg-white/10 p-5 transition hover:bg-white/15"><span className="block font-semibold">{title}</span><span className="mt-2 block text-sm leading-5 text-teal-100">{description}</span><span aria-hidden="true" className="mt-5 block text-xl text-teal-200 transition-transform group-hover:translate-x-1">→</span></Link>)}</div>
      </PageContainer></section>

      <section aria-labelledby="about-heading" className="py-16 sm:py-20"><PageContainer className="max-w-3xl">
        <SectionIntro id="about-heading" eyebrow={t("landing.about.eyebrow")} title={t("landing.about.title")} description={t("landing.about.description")} />
        <p className="mt-6 inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-[var(--brand-dark)]">{t("landing.about.prototypeBadge")}</p>
      </PageContainer></section>
    </>
  );
}
