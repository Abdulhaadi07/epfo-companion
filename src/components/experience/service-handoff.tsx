import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

type ServiceHandoffLabels = {
  notImplemented: string;
  explorePfJourney: string;
  backToHome: string;
  prototypeDisclosure: string;
};

type ServiceHandoffProps = {
  eyebrow: string;
  title: string;
  description: string;
  nextStep: string;
  nextStepHeading?: string;
  variant?: "warning" | "info";
  labels: ServiceHandoffLabels;
};

export function ServiceHandoff({ eyebrow, title, description, nextStep, nextStepHeading, variant = "warning", labels }: ServiceHandoffProps) {
  const calloutClasses = variant === "info"
    ? "border-teal-200 bg-teal-50"
    : "border-amber-200 bg-amber-50";
  const calloutTitleClasses = variant === "info"
    ? "text-teal-950"
    : "text-slate-950";
  const calloutBodyClasses = variant === "info"
    ? "text-teal-900"
    : "text-slate-700";
  const heading = nextStepHeading ?? labels.notImplemented;

  return (
    <section className="py-16 sm:py-24">
      <PageContainer className="max-w-3xl">
        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-10">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
          <p className="mt-5 text-body-lg">{description}</p>
          <div className={`mt-8 rounded-2xl border p-5 ${calloutClasses}`}>
            <p className={`font-semibold ${calloutTitleClasses}`}>{heading}</p>
            <p className={`mt-2 text-sm leading-6 ${calloutBodyClasses}`}>{nextStep}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/claim/start" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]">{labels.explorePfJourney}</Link>
            <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50">{labels.backToHome}</Link>
          </div>
          <p className="mt-8 border-t border-[var(--border)] pt-5 text-xs font-medium leading-5 text-[var(--brand-dark)]">{labels.prototypeDisclosure}</p>
        </div>
      </PageContainer>
    </section>
  );
}
