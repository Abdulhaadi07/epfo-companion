import Link from "next/link";
import type { ShellLabels } from "@/i18n/shell-labels";
import { PageContainer } from "./page-container";

type SiteFooterProps = {
  labels: Pick<ShellLabels, "brandName" | "footerDescription" | "prototypeDisclosure" | "navFooter"> & {
    helpLabel: string;
    aboutLabel: string;
  };
};

export function SiteFooter({ labels }: SiteFooterProps) {
  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <PageContainer className="flex flex-col gap-6 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-semibold text-slate-950">{labels.brandName}</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{labels.footerDescription}</p>
        </div>
        <div className="flex flex-col gap-3 text-sm sm:items-end">
          <nav aria-label={labels.navFooter} className="flex flex-wrap gap-x-4 gap-y-2 text-slate-600">
            <Link href="/help" className="underline-offset-4 hover:text-slate-950 hover:underline">{labels.helpLabel}</Link>
            <Link href="/#about-heading" className="underline-offset-4 hover:text-slate-950 hover:underline">{labels.aboutLabel}</Link>
          </nav>
          <p className="font-medium text-[var(--brand-dark)]">{labels.prototypeDisclosure}</p>
        </div>
      </PageContainer>
    </footer>
  );
}
