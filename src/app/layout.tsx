import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDemoSession } from "@/lib/demo-session";
import "./globals.css";

export const metadata: Metadata = {
  title: "EPFO Companion",
  description: "An independent prototype for clearer EPFO-related journeys.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getDemoSession();

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteHeader isAuthenticated={Boolean(session)} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
