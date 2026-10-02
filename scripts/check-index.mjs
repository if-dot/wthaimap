// Postbuild guard (lessons from CannaEvidence/PsyAccess): every URL in the sitemap must be a real built page,
// carry a canonical equal to itself, and not be noindex when launched; noindex pages must not be in the sitemap.
import fs from "fs"; import path from "path";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://wthaimap.vercel.app";
const LAUNCHED = process.env.NEXT_PUBLIC_LAUNCHED === "1";
const out = ".next/server/app";
if (!fs.existsSync(out)) { console.log("check-index: no .next/server/app, skipping"); process.exit(0); }
const smFile = ["sitemap.xml.body", "sitemap.xml"].map(f => path.join(out, f)).find(f => fs.existsSync(f));
if (!smFile) { console.log("check-index: sitemap body not found under", out, fs.readdirSync(out).filter(f => f.startsWith("sitemap")).join(",")); if (LAUNCHED) process.exit(1); process.exit(0); }
const sm = fs.readFileSync(smFile, "utf8");
const urls = [...sm.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
let bad = 0, idx = 0, noidx = 0, seen = new Set();
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const pages = walk(out).filter(f => f.endsWith(".html"));
for (const f of pages) {
  const html = fs.readFileSync(f, "utf8");
  const rel = "/" + path.relative(out, f).replace(/\.html$/, "").replace(/(^|\/)index$/, "") ; const url = SITE + (rel === "/" ? "/" : rel.replace(/\/?$/, "/"));
  const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  const noindex = /<meta name="robots" content="noindex/.test(html);
  if (/\/_(not-found|global-error)\/?$/.test(url)) continue;
  seen.add(url);
  if (!canon) { console.log("NO CANONICAL", url); bad++; } else if (canon !== url) { console.log("CANONICAL MISMATCH", url, "->", canon); bad++; }
  if (noindex) noidx++; else idx++;
  if (LAUNCHED && noindex && urls.includes(url)) { console.log("NOINDEX IN SITEMAP", url); bad++; }
  if (!noindex && LAUNCHED && !urls.includes(url) && !/\/(for-shops|map)\/$/.test(url)) console.log("note: indexable but not in sitemap", url);
}
if (!LAUNCHED) console.log("not launched: all pages noindex by design; sitemap/noindex consistency is checked only with NEXT_PUBLIC_LAUNCHED=1");
for (const u of urls) if (!seen.has(u)) { console.log("SITEMAP URL NOT BUILT", u); bad++; }
console.log(`pages ${pages.length}, sitemap ${urls.length}, index ${idx}, noindex ${noidx}, launched=${LAUNCHED}, problems ${bad}`);
if (bad && LAUNCHED) process.exit(1);
if (bad) console.log("not launched: problems reported but build allowed; fix before setting NEXT_PUBLIC_LAUNCHED=1");
