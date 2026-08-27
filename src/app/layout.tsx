import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EPFO Companion",
  description: "An independent prototype for clearer EPFO-related journeys.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
