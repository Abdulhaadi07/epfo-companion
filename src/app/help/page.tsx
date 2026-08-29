import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionIntro } from "@/components/home/section-intro";
import type { TranslationKey } from "@/i18n/keys";
import { getTranslator } from "@/i18n/server";

const issueIds = ["claim-stuck", "claim-rejected", "details-wrong", "something-else"] as const;

const issueKeys: Record<
  (typeof issueIds)[number],
  {
    title: TranslationKey;
    description: TranslationKey;
    action: TranslationKey;
    body: TranslationKey;
    link?: TranslationKey;
    note?: TranslationKey;
    href?: string;
  }
> = {
  "claim-stuck": {
    title: "help.issueStuckTitle",
    description: "help.issueStuckDescription",
    action: "help.issueStuckAction",
    body: "help.issueStuckBody",
    link: "help.goToClaimStatus",
    href: "/claim/status",
  },
  "claim-rejected": {
    title: "help.issueRejectedTitle",
    description: "help.issueRejectedDescription",
    action: "help.issueRejectedAction",
    body: "help.issueRejectedBody",
    note: "help.issueRejectedNote",
  },
  "details-wrong": {
    title: "help.issueDetailsTitle",
    description: "help.issueDetailsDescription",
    action: "help.issueDetailsAction",
    body: "help.issueDetailsBody",
    link: "help.readCommonQuestions",
    href: "/",
  },
  "something-else": {
    title: "help.issueOtherTitle",
    description: "help.issueOtherDescription",
    action: "help.issueOtherAction",
    body: "help.issueOtherBody",
    link: "help.backToGoals",
    href: "/",
  },
} ;

export default async function HelpPage() {
  const { t } = await getTranslator();

  return (
    <>
      <section className="border-b border-[var(--border)] bg-white py-16 sm:py-24">
        <PageContainer className="max-w-4xl">
          <SectionIntro eyebrow={t("help.eyebrow")} title={t("help.title")} description={t("help.description")} />
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {issueIds.map((id) => {
              const issue = issueKeys[id];
              return (
                <Link key={id} href={`#${id}`} className="group rounded-2xl border border-[var(--border)] bg-slate-50 p-5 hover:border-teal-300 hover:bg-white hover:shadow-sm">
                  <span className="block font-semibold text-slate-950">{t(issue.title)}</span>
                  <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">{t(issue.description)}</span>
                  <span className="mt-5 block text-sm font-semibold text-[var(--brand-dark)]">
                    {t(issue.action)} <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </PageContainer>
      </section>

      <section aria-labelledby="guidance-heading" className="py-16 sm:py-20">
        <PageContainer className="max-w-4xl">
          <h2 id="guidance-heading" className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{t("help.guidanceTitle")}</h2>
          <div className="mt-7 grid gap-4">
            <article id="claim-stuck" className="scroll-mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-semibold text-slate-950">{t("help.issueStuckTitle")}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t("help.issueStuckBody")}</p>
              <Link href="/claim/status" className="mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline">{t("help.goToClaimStatus")}</Link>
            </article>
            <article id="claim-rejected" className="scroll-mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-semibold text-slate-950">{t("help.issueRejectedTitle")}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t("help.issueRejectedBody")}</p>
              <p className="mt-4 text-sm font-semibold text-[var(--brand-dark)]">{t("help.issueRejectedNote")}</p>
            </article>
            <article id="details-wrong" className="scroll-mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-semibold text-slate-950">{t("help.issueDetailsTitle")}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t("help.issueDetailsBody")}</p>
              <Link href="/" className="mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline">{t("help.readCommonQuestions")}</Link>
            </article>
            <article id="something-else" className="scroll-mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-semibold text-slate-950">{t("help.issueOtherTitle")}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t("help.issueOtherBody")}</p>
              <Link href="/" className="mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline">{t("help.backToGoals")}</Link>
            </article>
          </div>
          <p className="mt-8 text-xs font-medium leading-5 text-[var(--brand-dark)]">{t("common.prototypeDisclosure")}</p>
        </PageContainer>
      </section>
    </>
  );
}
