import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getAuthenticatedUser } from "@/application/authenticated-user";
import { getSession } from "@/lib/demo-session";
import { getTranslator } from "@/i18n/server";
import { getShellLabels } from "@/i18n/shell-labels";
import "./globals.css";

export const metadata: Metadata = {
  title: "EPFO Companion",
  description: "An independent prototype for clearer EPFO-related journeys.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  const authenticatedUser = session ? await getAuthenticatedUser(session.userId) : null;
  const { locale, t } = await getTranslator();
  const shellLabels = getShellLabels(t, Boolean(session));

  return (
    <html lang={locale}>
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteHeader
            isAuthenticated={Boolean(session)}
            displayName={authenticatedUser?.displayName}
            currentLocale={locale}
            labels={shellLabels}
          />
          <main className="flex-1">{children}</main>
          <SiteFooter
            labels={{
              brandName: shellLabels.brandName,
              footerDescription: shellLabels.footerDescription,
              prototypeDisclosure: shellLabels.prototypeDisclosure,
              navFooter: shellLabels.navFooter,
              helpLabel: t("nav.help"),
              aboutLabel: t("nav.about"),
            }}
          />
        </div>
      </body>
    </html>
  );
}
