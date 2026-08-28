import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

type ServiceHandoffProps = {
  eyebrow: string;
  title: string;
  description: string;
  nextStep: string;
};

export function ServiceHandoff({ eyebrow, title, description, nextStep }: ServiceHandoffProps) {
  return (
    <section className="py-16 sm:py-24">
      <PageContainer className="max-w-3xl">
        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-10">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
          <p className="mt-5 text-body-lg">{description}</p>
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-semibold text-slate-950">This part of the prototype is not implemented yet.</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{nextStep}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/claim/start" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]">Explore the PF journey</Link>
            <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50">Back to home</Link>
          </div>
          <p className="mt-8 border-t border-[var(--border)] pt-5 text-xs font-medium leading-5 text-[var(--brand-dark)]">Prototype&nbsp; · &nbsp;Synthetic data&nbsp; · &nbsp;Not an official EPFO service</p>
        </div>
      </PageContainer>
    </section>
  );
}
