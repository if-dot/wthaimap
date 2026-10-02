import type { MetadataRoute } from "next";
import { AREAS, SHOPS, SNAPSHOT_ISO, TAKES, indexable } from "@/lib/data";
import { SITE } from "./layout";

export default function sitemap(): MetadataRoute.Sitemap {
  const d = new Date(SNAPSHOT_ISO);
  const fixed = ["/", "/phuket/", "/phuket/map/", "/phuket/best/", "/phuket/areas/", "/phuket/prices/", "/phuket/first-time/", "/how-we-score/", "/about/", "/for-shops/"];
  return [
    ...fixed.map((u) => ({ url: SITE + u, lastModified: d, changeFrequency: "weekly" as const, priority: u === "/" ? 1 : 0.8 })),
    ...TAKES.filter((t) => t.key !== "overall").map((t) => ({ url: `${SITE}/phuket/best/${t.key}/`, lastModified: d, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...AREAS.map((a) => ({ url: `${SITE}/phuket/areas/${a.slug}/`, lastModified: d, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...SHOPS.filter(indexable).map((s) => ({ url: `${SITE}/phuket/shop/${s.slug}/`, lastModified: d, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
