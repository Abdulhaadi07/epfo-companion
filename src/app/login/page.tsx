import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { enterDemoSession } from "@/lib/demo-session";
import { redirectIfDemoSession } from "@/lib/demo-session";

export default async function LoginPage() {
  await redirectIfDemoSession();

  return (
    <section className="py-16 sm:py-24">
      <PageContainer className="max-w-xl">
        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-10">
          <p className="eyebrow">Demo access</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Try EPFO Companion</h1>
          <p className="mt-5 text-body-lg">Enter the prototype with one click to explore a synthetic citizen account and an example claim status.</p>

          <form action={enterDemoSession} className="mt-8 space-y-5">
            <div><label htmlFor="demo-id" className="block text-sm font-semibold text-slate-950">Demo ID</label><input id="demo-id" name="demo-id" type="text" defaultValue="DEMO-CITIZEN-001" autoComplete="username" readOnly className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-slate-50 px-4 text-base text-slate-950" /></div>
            <div><label htmlFor="demo-password" className="block text-sm font-semibold text-slate-950">Demo password</label><input id="demo-password" name="demo-password" type="password" defaultValue="Demo@1234" autoComplete="current-password" readOnly className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-slate-50 px-4 text-base text-slate-950" /><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Pre-filled mock details; no typing is required.</p></div>
            <button type="submit" className="inline-flex min-h-13 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-base font-semibold text-white hover:bg-[var(--brand-dark)]">Continue to demo</button>
          </form>

          <div className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-5">
            <p className="font-semibold text-slate-950">Example details for reviewers</p>
            <dl className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-[auto_1fr] sm:gap-x-4">
              <dt className="font-medium">Demo ID</dt><dd>DEMO-CITIZEN-001</dd>
              <dt className="font-medium">Password</dt><dd>Demo@1234</dd>
            </dl>
            <p className="mt-3 text-xs leading-5 text-slate-600">These are mock details for this prototype only. They are not EPFO credentials and are not used for authentication.</p>
          </div>

          <p className="mt-8 border-t border-[var(--border)] pt-5 text-sm leading-6 text-[var(--muted)]">This is an independent prototype using synthetic data. It is not an official EPFO service and does not connect to government systems.</p>
          <Link href="/" className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline">Back to home</Link>
        </div>
      </PageContainer>
    </section>
  );
}
