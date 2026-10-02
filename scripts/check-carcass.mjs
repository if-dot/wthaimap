// Carcass check (index policy rule 6, from PsyAccess/CannAccess): an indexable page must carry >=150 words that appear on no
// other page (8-word shingles), and no more than 55% of its text may sit on any single other page. Measured on rendered HTML of
// <main>. Writes data/carcass_measured.json {path: {words, unique, maxShare, pair}} and reports violations; exits 1 when launched.
import fs from "fs"; import path from "path";
const LAUNCHED = process.env.NEXT_PUBLIC_LAUNCHED === "1";
const MIN_UNIQUE = 150, MAX_SHARE = 55, MIN_WORDS = 250;
const out = ".next/server/app";
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(out).filter((f) => f.endsWith(".html") && !/_(not-found|global-error)\.html$/.test(f));
const pages = [];
for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/); if (!m) continue;
  let t = m[1].replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").toLowerCase();
  const words = t.split(/[^\p{L}\p{N}'’]+/u).filter((w) => w.length > 1);
  const sh = new Set(); for (let i = 0; i + 8 <= words.length; i++) sh.add(words.slice(i, i + 8).join(" "));
  const rel = "/" + path.relative(out, f).replace(/\.html$/, "").replace(/(^|\/)index$/, "");
  pages.push({ p: rel === "/" ? "/" : rel + "/", noindex, words: words.length, sh, structured: /application\/ld\+json/.test(html) });
}
// shingle -> count of pages
const cnt = new Map(); for (const p of pages) for (const s of p.sh) cnt.set(s, (cnt.get(s) || 0) + 1);
const res = {}; let bad = 0; const lines = [];
for (const p of pages) {
  let uniqueSh = 0; for (const s of p.sh) if (cnt.get(s) === 1) uniqueSh++;
  // unique words ≈ unique shingles + 7 (each unique shingle contributes its words; approximation consistent with CannAccess check)
  const unique = p.sh.size ? Math.round((uniqueSh / p.sh.size) * p.words) : p.words;
  // pairwise max share: fraction of this page's shingles found on one specific other page
  let maxShare = 0, pair = null;
  if (p.sh.size) {
    const shared = new Map();
    for (const q of pages) { if (q === p) continue; let c = 0; for (const s of p.sh) if (q.sh.has(s)) c++; if (c) shared.set(q.p, c); }
    for (const [q, c] of shared) { const sh = Math.round((c / p.sh.size) * 100); if (sh > maxShare) { maxShare = sh; pair = q; } }
  }
  res[p.p] = { words: p.words, unique, maxShare, pair, noindex: p.noindex };
  if (!p.noindex || LAUNCHED === false) {
    // judge every page as if it were indexable when not launched (pre-launch everything is noindex); when launched, only indexable pages
    const judge = LAUNCHED ? !p.noindex : true;
    if (judge && (unique < MIN_UNIQUE || maxShare > MAX_SHARE || (p.words < MIN_WORDS && !p.structured))) { lines.push(`${p.p}  words=${p.words} unique≈${unique} maxShare=${maxShare}% (${pair})`); if (LAUNCHED) bad++; }
  }
}
fs.mkdirSync("data", { recursive: true }); fs.writeFileSync("data/carcass_measured.json", JSON.stringify(res, null, 0));
const idx = pages.filter((p) => !p.noindex).length;
console.log(`check-carcass: ${pages.length} pages, ${idx} indexable; ${lines.length} below policy${LAUNCHED ? "" : " (judged as if indexable; informational before launch)"}`);
for (const l of lines.slice(0, 40)) console.log("  ", l);
if (lines.length > 40) console.log(`   … ${lines.length - 40} more`);
if (bad) process.exit(1);
