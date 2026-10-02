import type { MetadataRoute } from "next";
import { SITE } from "./layout";
export default function robots(): MetadataRoute.Robots {
  const launched = process.env.NEXT_PUBLIC_LAUNCHED === "1";
  return launched
    ? { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
