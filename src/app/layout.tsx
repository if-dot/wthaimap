import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-display", display: "swap" });
const body = IBM_Plex_Sans({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://budmap.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "BudMap — where the good weed actually is", template: "%s · BudMap" },
  description: "An independent guide to cannabis dispensaries for travellers. Scores built from what reviewers in five languages actually say about the flower, the prices, the vibe and the staff. Phuket first.",
  openGraph: { siteName: "BudMap", type: "website" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body style={{ fontFamily: "var(--font-body), var(--body)" }}>
        <style>{`:root{--display:var(--font-display),"Helvetica Neue",Arial,sans-serif;--body:var(--font-body),"Segoe UI",Roboto,system-ui,sans-serif}`}</style>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
