import scored from "../../data/phuket/scored.json";

export type Evidence = { lang: string | null; date: string | null; stars: number | null; text: string };
export type Shop = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  address: string | null;
  web: string | null;
  phone: string | null;
  hours: string[];
  status: string | null;
  rating: number | null;
  count: number;
  n: number;
  langs: string[];
  weeden: boolean;
  scores: {
    overall: number | null;
    quality: number | null;
    price: number | null;
    atmosphere: number | null;
    beginner: number | null;
    trust: number | null;
    conf: number;
  };
  cnt: Record<string, number>;
  neg_stars: number;
  ev: Record<string, Evidence[]>;
  feat: Record<string, boolean>;
  feat_ev: Record<string, string[]>;
  price_med: number | null;
  price_min: number | null;
  price_src: { u: string | null; d: string | null; v: number | null; s: string | null }[];
  reddit: { n: number; pos: number; neg: number; ex: { date: string | null; score: number; text: string; url: string }[] };
  mcgis?: { license_no: string | null; status: string; expiry: string | null; name: string; dist_m: number; match: "strong" | "probable"; checked: string } | null;
  slug: string;
};

export type TakeKey = "overall" | "quality" | "price" | "atmosphere" | "beginner" | "trust";

export const TAKES: { key: TakeKey; label: string; short: string; blurb: string; pageTitle: string }[] = [
  { key: "overall", label: "Best overall", short: "Overall", blurb: "What a careful friend would recommend", pageTitle: "Best dispensaries in Phuket" },
  { key: "quality", label: "Best flower", short: "Flower", blurb: "Reviews that praise the product itself", pageTitle: "Best flower in Phuket" },
  { key: "price", label: "Cheapest", short: "Price", blurb: "Published menu prices and value mentions", pageTitle: "Cheapest weed in Phuket" },
  { key: "atmosphere", label: "Best vibe", short: "Vibe", blurb: "Lounge, games, late hours", pageTitle: "Best cannabis lounges in Phuket" },
  { key: "beginner", label: "First time", short: "First time", blurb: "Staff who explain, advise and go slow", pageTitle: "Best dispensaries in Phuket for first-timers" },
  { key: "trust", label: "Trust", short: "Trust", blurb: "No scam talk, plausible ratings", pageTitle: "Most trusted dispensaries in Phuket" },
];

export const FEATS: { key: string; label: string }[] = [
  { key: "open_24h", label: "Open 24h" },
  { key: "lounge_smoking_area", label: "Lounge" },
  { key: "games_ps5_netflix", label: "Games / Netflix" },
  { key: "delivery", label: "Delivery" },
  { key: "doctor_prescription", label: "Doctor on site" },
  { key: "english_staff", label: "English staff" },
  { key: "russian_staff", label: "Russian staff" },
  { key: "edibles", label: "Edibles" },
];

export const AREAS: { key: string; slug: string; label: string; blurb: string; center: [number, number] }[] = [
  { key: "Patong", slug: "patong", label: "Patong", blurb: "Bangla Road and the beach strip. The densest cluster on the island and the one with the most tourist traffic, highest prices and most spot-checks.", center: [7.8925, 98.2985] },
  { key: "Kata", slug: "kata", label: "Kata", blurb: "Kata and Kata Noi. Calmer than Patong, with several shops that get praised for staff and product rather than for the party.", center: [7.8208, 98.2975] },
  { key: "Karon", slug: "karon", label: "Karon", blurb: "The long beach between Patong and Kata. Shops are spread along the main road and around Karon Circle.", center: [7.8468, 98.2944] },
  { key: "Kamala", slug: "kamala", label: "Kamala", blurb: "Smaller, quieter beach town north of Patong. Fewer shops, more locals and families.", center: [7.9526, 98.2831] },
  { key: "Bang Tao", slug: "bang-tao", label: "Bang Tao", blurb: "Boat Avenue and Laguna. Upmarket resorts, a cluster of newer shops around Boat Avenue.", center: [7.9933, 98.296] },
  { key: "Rawai", slug: "rawai", label: "Rawai", blurb: "Rawai and Nai Harn in the south. Long-stay crowd, Russian-speaking community, some of the lowest published prices on the island.", center: [7.776, 98.329] },
  { key: "Old Town", slug: "old-town", label: "Phuket Old Town", blurb: "Phuket Town and the Sino-Portuguese old quarter. Mixed local and tourist trade, several shops with their own websites.", center: [7.884, 98.388] },
  { key: "Other", slug: "elsewhere", label: "Elsewhere on Phuket", blurb: "Chalong, Kathu, Thalang and the roads in between.", center: [7.88, 98.35] },
];

export const SNAPSHOT = "2 October 2026";
export const SNAPSHOT_ISO = "2026-10-02";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildShops(): Shop[] {
  const raw = scored as unknown as Omit<Shop, "slug">[];
  const seen = new Map<string, number>();
  return raw.map((s) => {
    let base = slugify(s.name) || "shop";
    if (seen.has(base)) {
      const n = (seen.get(base) || 1) + 1;
      seen.set(base, n);
      base = `${base}-${slugify(s.area)}-${n}`;
    } else seen.set(base, 1);
    return { ...s, slug: base } as Shop;
  });
}

export const SHOPS: Shop[] = buildShops();
export const SHOP_BY_SLUG = new Map(SHOPS.map((s) => [s.slug, s]));

export const THIN = 5; // under this many review texts a shop is "thin data"
export function isThin(s: Shop) {
  return s.n < THIN;
}
export function isOpenStatus(s: Shop) {
  return !s.status || s.status === "OPERATIONAL";
}
/** Own words: unique words across quotes, Reddit excerpts and price sources — the text no other page has. */
export function ownWords(s: Shop) {
  const set = new Set<string>();
  const add = (t: string | null | undefined) => (t || "").toLowerCase().split(/[^\p{L}\p{N}']+/u).forEach((w) => { if (w.length > 2) set.add(w); });
  Object.values(s.ev || {}).forEach((arr) => arr.forEach((e) => add(e.text)));
  (s.reddit?.ex || []).forEach((e) => add(e.text));
  (s.price_src || []).forEach((p) => add(p.s));
  add(s.address);
  return set.size;
}
export const MIN_OWN_WORDS = 150;
/** Index policy (lesson from PsyAccess/CannaEvidence): a card is indexed only with enough text of its own; others are noindex,follow and live inside lists. */
export function indexable(s: Shop) {
  return !isThin(s) && isOpenStatus(s) && s.n >= 8 && ownWords(s) >= MIN_OWN_WORDS;
}

export function scoreColor(v: number | null, thin = false) {
  if (thin) return "var(--thin)";
  if (v == null) return "var(--thin)";
  return v >= 75 ? "var(--s4)" : v >= 60 ? "var(--s3)" : v >= 45 ? "var(--s2)" : "var(--s1)";
}

export function areaBySlug(slug: string) {
  return AREAS.find((a) => a.slug === slug);
}

export function ranked(take: TakeKey, shops: Shop[] = SHOPS, includeThin = false) {
  return shops
    .filter((s) => (includeThin || !isThin(s)) && isOpenStatus(s))
    .filter((s) => s.scores[take] != null)
    .sort((a, b) => (b.scores[take] as number) - (a.scores[take] as number) || b.n - a.n);
}

export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371,
    dl = ((b.lat - a.lat) * Math.PI) / 180,
    dn = ((b.lng - a.lng) * Math.PI) / 180,
    x = Math.sin(dl / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
export function fmtKm(d: number) {
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
}

export const LANG: Record<string, string> = { en: "EN", ru: "RU", de: "DE", fr: "FR", iw: "HE", he: "HE", th: "TH" };

/** Plain-language explanation of each take for one shop. Used on the map card and on the shop page. */
export function whyLines(s: Shop) {
  const c = s.cnt || {};
  const n = s.n;
  const feats = FEATS.filter((f) => s.feat?.[f.key]).map((f) => f.label);
  const lines: { k: TakeKey; text: string }[] = [];
  lines.push({
    k: "quality",
    text: `${c.quality_pos || 0} of ${n} reviews praise the product itself; ${c.quality_neg || 0} complain about it (dry, weak, mold).`,
  });
  lines.push({
    k: "price",
    text:
      `${c.price_pos || 0} call it cheap or fair, ${c.price_neg || 0} call it expensive.` +
      (s.price_med
        ? ` Published menu median ฿${Math.round(s.price_med)}/g${s.price_min && s.price_min < s.price_med ? ` (from ฿${Math.round(s.price_min)})` : ""}.`
        : " No published prices found."),
  });
  lines.push({
    k: "atmosphere",
    text: `${c.atmosphere || 0} reviews talk about the atmosphere${feats.length ? `; mentioned: ${feats.join(", ")}` : ""}.`,
  });
  lines.push({
    k: "beginner",
    text: `${c.beginner || 0} first-timer mentions; ${c.staff_pos || 0} praise staff for explaining or advising${c.staff_neg ? `; ${c.staff_neg} call staff rude or pushy` : ""}.`,
  });
  return lines;
}

export type Flag = { kind: "good" | "warn" | "bad"; text: string };
export function trustFlags(s: Shop): Flag[] {
  const c = s.cnt || {};
  const f: Flag[] = [];
  if (c.trust_neg) f.push({ kind: "bad", text: `${c.trust_neg} scam / overcharge mention${c.trust_neg > 1 ? "s" : ""} in reviews` });
  if (s.neg_stars) f.push({ kind: "warn", text: `${s.neg_stars} review${s.neg_stars > 1 ? "s" : ""} rated 3★ or lower in our sample` });
  if (s.rating === 5 && s.count >= 800) f.push({ kind: "warn", text: `5.0 at ${s.count.toLocaleString("en-US")} Google reviews is unusually perfect; we weight it down` });
  if (s.status && s.status !== "OPERATIONAL") f.push({ kind: "bad", text: s.status.replace(/_/g, " ").toLowerCase() });
  if (s.mcgis?.status === "active") f.push({ kind: "good", text: `Licence ${s.mcgis.match === "strong" ? "found" : "probably found"} in the public MC-GIS registry (${s.mcgis.license_no || "no number"}${s.mcgis.expiry ? `, valid to ${s.mcgis.expiry}` : ""})` });
  else if (s.mcgis?.status) f.push({ kind: "bad", text: `MC-GIS registry lists this licence as ${s.mcgis.status}` });
  else f.push({ kind: "warn", text: "No licence record matched within 300 m in the MC-GIS registry (names there are often the legal name; not proof of anything)" });
  if (s.reddit?.n)
    f.push({
      kind: s.reddit.neg > s.reddit.pos ? "warn" : "good",
      text: `Reddit: ${s.reddit.n} mention${s.reddit.n > 1 ? "s" : ""}, ${s.reddit.pos} positive, ${s.reddit.neg} negative`,
    });
  if (!f.length) f.push({ kind: "good", text: "No trust flags in our sample" });
  return f;
}

export function shortName(name: string) {
  return name.split(/[|(–—-]/)[0].trim();
}

export function stats() {
  const texts = SHOPS.reduce((a, s) => a + s.n, 0);
  const indexed = SHOPS.filter(indexable).length;
  const priced = SHOPS.filter((s) => s.price_med).length;
  const reddit = SHOPS.reduce((a, s) => a + (s.reddit?.n || 0), 0);
  return { shops: SHOPS.length, texts, indexed, priced, reddit };
}

/* ---------- v0.2: sub-areas, lounges, strains ---------- */

export const SUBAREAS: { slug: string; parent: string; label: string; blurb: string; box: [number, number, number, number] }[] = [
  { slug: "bangla-road", parent: "Patong", label: "Bangla Road & Beach Road", blurb: "The walking street and the beachfront block between Soi Bangla and Thaweewong Road. Highest footfall, highest prices, most late-night lounges, and the area inspectors visit first.", box: [7.887, 7.898, 98.291, 98.2985] },
  { slug: "rat-u-thit", parent: "Patong", label: "Rat-U-Thit & Jungceylon", blurb: "The second road back from the beach, around Jungceylon mall and the Banzaan market. Still central, a notch calmer and cheaper than the beach strip.", box: [7.883, 7.9, 98.2985, 98.304] },
  { slug: "nanai", parent: "Patong", label: "Nanai Road & the hills", blurb: "The third road and the slopes behind Patong: long-stay guesthouses, local trade, lower prices, fewer tourists.", box: [7.878, 7.908, 98.304, 98.315] },
];

export function inBox(s: { lat: number; lng: number }, b: [number, number, number, number]) {
  return s.lat >= b[0] && s.lat <= b[1] && s.lng >= b[2] && s.lng <= b[3];
}
export function subareaShops(slug: string) {
  const sa = SUBAREAS.find((x) => x.slug === slug);
  if (!sa) return [];
  return SHOPS.filter((s) => s.area === sa.parent && inBox(s, sa.box));
}

export function loungeShops() {
  return SHOPS.filter((s) => s.feat?.lounge_smoking_area || s.feat?.games_ps5_netflix || s.feat?.rooftop);
}

export type StrainEntry = { strain: string; slug: string; shop: Shop; price: number; date: string | null; url: string | null };
const STRIP = /^(buy|choose weight|stuff phuket|more about|filter|shop)\s+/i;
export function cleanStrain(raw: string | null) {
  if (!raw) return null;
  let s = raw.replace(STRIP, "").replace(/\s+/g, " ").trim();
  if (/^(range_low|range_high|from|market_low|market_high)$/i.test(s)) return null;
  if (/review mention|site:|thailandnomads|reddit|per gram|starting/i.test(s)) return null;
  if (s.length < 3 || s.length > 40 || s.split(" ").length > 4) return null;
  s = s.replace(/\b(s|m|l)$/i, "").trim();
  return s.replace(/\w\S*/g, (w) => (w.length > 2 && w === w.toUpperCase() ? w[0] + w.slice(1).toLowerCase() : w));
}
export function strainEntries(): StrainEntry[] {
  const out: StrainEntry[] = [];
  for (const s of SHOPS) {
    for (const p of s.price_src || []) {
      const name = cleanStrain(p.s);
      if (!name || !p.v) continue;
      out.push({ strain: name, slug: slugify(name), shop: s, price: p.v, date: p.d, url: p.u });
    }
  }
  return out;
}
export function strainIndex() {
  const m = new Map<string, StrainEntry[]>();
  for (const e of strainEntries()) {
    const k = e.slug;
    if (!m.has(k)) m.set(k, []);
    const arr = m.get(k)!;
    if (!arr.find((x) => x.shop.id === e.shop.id)) arr.push(e);
  }
  return [...m.entries()].map(([slug, entries]) => ({ slug, name: entries[0].strain, entries: entries.sort((a, b) => a.price - b.price) })).sort((a, b) => b.entries.length - a.entries.length || a.name.localeCompare(b.name));
}
