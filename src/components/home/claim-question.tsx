import Link from "next/link";

export function ClaimQuestion() {
  return <aside className="mt-8 flex flex-col gap-4 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><h2 className="font-semibold text-slate-950">Have a question about this claim?</h2><p className="mt-1 text-sm leading-6 text-slate-700">Start with a situation and find guidance for your next step.</p></div><Link href="/help#claim-stuck" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-[var(--brand)] px-4 text-sm font-semibold text-[var(--brand-dark)] hover:bg-white">Ask about my claim</Link></aside>;
}
