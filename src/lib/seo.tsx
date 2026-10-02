import type { Metadata } from "next";

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://wthaimap.vercel.app";
export const LAUNCHED = process.env.NEXT_PUBLIC_LAUNCHED === "1";

/** Page metadata with canonical and launch-gated robots. `index=false` forces noindex even after launch. */
export function meta(path: string, m: { title: string; description: string; index?: boolean }): Metadata {
  const index = LAUNCHED && m.index !== false;
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `${SITE}${path}` },
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title: m.title, description: m.description, url: `${SITE}${path}`, siteName: "BudMap", type: "website", images: [{ url: `${SITE}/og.png`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: m.title, description: m.description, images: [`${SITE}/og.png`] },
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE}${it.path}` })),
  };
}

export function Ld({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
