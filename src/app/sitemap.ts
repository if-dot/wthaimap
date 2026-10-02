import type { MetadataRoute } from "next";
import { AREAS, SHOPS, SNAPSHOT_ISO, SUBAREAS, TAKES, indexable } from "@/lib/data";
import { SITE } from "./layout";
import fs from "node:fs";

export default function sitemap(): MetadataRoute.Sitemap {
  const d = new Date(SNAPSHOT_ISO);
  const fixed = ["/", "/phuket/", "/phuket/map/", "/phuket/best/", "/phuket/areas/", "/phuket/prices/", "/phuket/first-time/", "/phuket/what-to-buy/", "/phuket/lounges/", "/phuket/strains/", "/phuket/mushrooms/", "/thailand/is-weed-legal/", "/how-we-score/", "/about/", "/for-shops/"];
  const list = [
    ...fixed.map((u) => ({ url: SITE + u, lastModified: d, changeFrequency: "weekly" as const, priority: u === "/" ? 1 : 0.8 })),
    ...TAKES.filter((t) => t.key !== "overall").map((t) => ({ url: `${SITE}/phuket/best/${t.key}/`, lastModified: d, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...SUBAREAS.map((s) => ({ url: `${SITE}/phuket/areas/patong/${s.slug}/`, lastModified: d, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...AREAS.map((a) => ({ url: `${SITE}/phuket/areas/${a.slug}/`, lastModified: d, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...SHOPS.filter(indexable).map((s) => ({ url: `${SITE}/phuket/shop/${s.slug}/`, lastModified: d, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
  try { fs.mkdirSync(".next", { recursive: true }); fs.writeFileSync(".next/sitemap-urls.json", JSON.stringify(list.map((x) => x.url))); } catch {}
  return list;
}
