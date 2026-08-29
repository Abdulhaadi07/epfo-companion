import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { loginAction, loginSampleAccountAction } from "@/lib/auth-actions";
import { redirectIfSession } from "@/lib/demo-session";
import { DEFAULT_SAMPLE_ACCOUNT, SAMPLE_ACCOUNT_PASSWORD, SAMPLE_ACCOUNTS } from "@/lib/sample-accounts";
import { getTranslator } from "@/i18n/server";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectIfSession();
  const { error } = await searchParams;
  const showAuthError = error === "auth";
  const { t } = await getTranslator();

  return (
    <section className="py-16 sm:py-24">
      <PageContainer className="max-w-xl">
        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-10">
          <p className="eyebrow">{t("auth.signInEyebrow")}</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{t("auth.welcomeBack")}</h1>
          <p className="mt-5 text-body-lg">{t("auth.signInDescription")}</p>

          {showAuthError ? (
            <p role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
              {t("auth.authError")}
            </p>
          ) : null}

          <form action={loginAction} className="mt-8 space-y-5">
            <div>
              <label htmlFor="uan" className="block text-sm font-semibold text-slate-950">{t("auth.uanLabel")}</label>
              <input
                id="uan"
                name="uan"
                type="text"
                inputMode="numeric"
                defaultValue={DEFAULT_SAMPLE_ACCOUNT.uan}
                autoComplete="username"
                required
                className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-base text-slate-950"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-slate-950">{t("auth.passwordLabel")}</label>
              <input
                id="login-password"
                name="password"
                type="password"
                defaultValue={SAMPLE_ACCOUNT_PASSWORD}
                autoComplete="current-password"
                required
                className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-base text-slate-950"
              />
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{t("auth.sampleCredentialsNote")}</p>
            </div>
            <button type="submit" className="inline-flex min-h-13 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-base font-semibold text-white hover:bg-[var(--brand-dark)]">
              {t("auth.signInButton")}
            </button>
          </form>

          <form action={loginSampleAccountAction} className="mt-4">
            <button type="submit" className="inline-flex min-h-13 w-full items-center justify-center rounded-xl border border-[var(--brand)] bg-white px-5 text-base font-semibold text-[var(--brand-dark)] hover:bg-teal-50">
              {t("auth.trySampleAccount")}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-5">
            <p className="font-semibold text-slate-950">{t("auth.sampleAccountsTitle")}</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
              {SAMPLE_ACCOUNTS.map((account) => (
                <li key={account.uan}>
                  <p className="font-medium text-slate-950">{account.displayName}</p>
                  <p>{account.description}</p>
                  <p className="text-xs text-slate-600">UAN: {account.uan}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-5 text-slate-600">
              {t("auth.sampleAccountsPasswordPrefix")} {SAMPLE_ACCOUNT_PASSWORD}. {t("auth.sampleAccountsSyntheticNote")}
            </p>
          </div>

          <p className="mt-8 border-t border-[var(--border)] pt-5 text-sm leading-6 text-[var(--muted)]">{t("auth.prototypeNote")}</p>
          <Link href="/" className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline">{t("common.backToHome")}</Link>
        </div>
      </PageContainer>
    </section>
  );
}
