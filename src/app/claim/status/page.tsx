import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { MyClaimsEmptyState, MyClaimsList } from "@/components/claims/my-claims-list";
import { getMyClaimsView } from "@/application/my-claims";
import { localizeMyClaimsView } from "@/i18n/localize-views";
import { getTranslator } from "@/i18n/server";
import { requireSession } from "@/lib/demo-session";

export default async function ClaimStatusPage() {
  const session = await requireSession();
  const view = await getMyClaimsView(session.userId);
  if (!view) notFound();

  const { t } = await getTranslator();
  const localized = localizeMyClaimsView(t, view);
  const { pageLabels } = localized;

  return (
    <section className="py-6 sm:py-8">
      <PageContainer className="max-w-3xl">
        <header className="mb-6">
          <p className="text-sm font-medium text-[var(--muted)]">
            {localized.greeting.hiLabel} {localized.greeting.displayName}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{pageLabels.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-800">
            {pageLabels.description}
          </p>
        </header>

        {localized.isEmpty ? (
          <MyClaimsEmptyState
            title={pageLabels.emptyTitle}
            description={pageLabels.emptyDescription}
            startPfClaimLabel={pageLabels.startPfClaim}
          />
        ) : (
          <MyClaimsList claims={localized.claims} labels={pageLabels} />
        )}

        <p className="mt-8 border-t border-[var(--border)] pt-5 text-xs font-medium leading-5 text-[var(--brand-dark)]">
          {localized.prototypeDisclosure}
        </p>

        <div className="mt-4">
          <Link
            href="/home"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline"
          >
            {pageLabels.backToHome}
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
