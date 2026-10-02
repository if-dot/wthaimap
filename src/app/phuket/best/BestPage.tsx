import Link from "next/link";
import { SNAPSHOT, TAKES, TakeKey, ranked, stats } from "@/lib/data";
import { RankedRow } from "@/components/RankedRow";
import Faq from "@/components/Faq";
import { FAQ_PHUKET } from "@/lib/faq";

const INTRO: Record<TakeKey, string> = {
  overall: "A blend: 35% what reviewers say about the flower, 20% trust signals, and 15% each for price, vibe and how first-timers are treated. Scores shrink toward 50 when a shop has fewer than 12 review texts, so a thin sample cannot top the list on luck.",
  quality: "Only comments about the product count here: fresh, smells great, sticky, strong, top shelf on one side; dry, weak, harsh, mouldy on the other. Comments about staff, décor or PS5 do not move this score.",
  price: "Published menu prices (where a shop publishes any) carry 60% of the weight; the rest is the balance of ‘cheap / fair’ against ‘expensive / rip-off’ in reviews. Only 17 of 189 shops publish prices, so for most the score rests on what reviewers say.",
  atmosphere: "Lounge or smoking area, games consoles or Netflix, rooftop, 24-hour opening, plus how often reviews talk about the place rather than the product. High here does not mean good flower; check the Flower bar on the card.",
  beginner: "Reviews that mention a first time, staff who explained or advised, patience, and no pushiness. We subtract rude-staff and overcharge mentions. If you have never bought before, start from this list and read the ‘first time’ guide.",
  trust: "Starts at 70. We subtract for each scam, overcharge or wrong-change mention, for 3-star-and-below reviews in our sample, for a perfect 5.0 at 800+ reviews (statistically implausible without incentives) and for closed status; we add for independent positive mentions on Reddit and subtract for negative ones.",
};

export default function BestPage({ take }: { take: TakeKey }) {
  const T = TAKES.find((t) => t.key === take)!;
  const rows = ranked(take);
  const s = stats();
  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${T.pageTitle} (${SNAPSHOT})`,
    numberOfItems: Math.min(25, rows.length),
    itemListElement: rows.slice(0, 25).map((sh, i) => ({ "@type": "ListItem", position: i + 1, name: sh.name, url: `/phuket/shop/${sh.slug}/` })),
  };
  return (
    <main className="wrap page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <span className="eyebrow">Phuket · ranked by reviews · {SNAPSHOT}</span>
      <h1>{T.pageTitle}</h1>
      <p className="lead">{T.blurb}. {rows.length} shops with at least five review texts; {s.shops - rows.length} more are on the map marked as thin data.</p>
      <div className="chips" style={{ margin: "10px 0 18px" }}>
        {TAKES.map((t) => <Link key={t.key} className="chip" aria-current={t.key === take ? "page" : undefined} href={`/phuket/best/${t.key === "overall" ? "" : t.key + "/"}`}>{t.label}</Link>)}
        <Link className="chip" href={`/phuket/map/?take=${take}`}>Show on map →</Link>
      </div>
      <p className="note">{INTRO[take]} <Link href="/how-we-score/">Full method.</Link></p>
      <div className="rows" style={{ marginTop: 14 }}>
        {rows.map((sh, i) => <RankedRow key={sh.id} s={sh} i={i} take={take} />)}
      </div>
      {take === "overall" && <Faq items={FAQ_PHUKET} />}
    </main>
  );
}
