import type { Metadata } from "next";
import { meta } from "@/lib/seo";
import Link from "next/link";
import { AREAS, SHOPS, SNAPSHOT, TAKES, ranked, stats } from "@/lib/data";
import { RankedRow } from "@/components/RankedRow";

export const metadata: Metadata = meta("/phuket/", {
  title: "Phuket cannabis guide: shops, prices, areas",
  description: "Independent guide to Phuket dispensaries: 189 shops scored from reviews in five languages, prices, areas from Patong to Rawai, and how buying works in practice.",
});

export default function Page() {
  const s = stats();
  return (
    <main className="wrap page">
      <span className="eyebrow">Phuket edition · snapshot {SNAPSHOT}</span>
      <h1>Phuket cannabis guide</h1>
      <p className="lead">{s.shops} shops from Patong to Rawai, scored from {s.texts.toLocaleString("en-US")} reviews. Start with the map, a ranking, or your area.</p>
      <div className="cta-row"><Link href="/phuket/map/" className="btn primary">Map near me</Link><Link href="/phuket/first-time/" className="btn">First time? Read this</Link></div>
      <section className="sec"><h2>Rankings</h2><div className="chips" style={{ marginTop: 10 }}>{TAKES.map((t) => <Link key={t.key} className="chip" href={`/phuket/best/${t.key === "overall" ? "" : t.key + "/"}`}>{t.label}</Link>)}</div></section>
      <section className="sec prose">
        <h2>How the island is laid out</h2>
        <p>Phuket has more licensed cannabis shops per visitor than anywhere in Thailand, and they sit exactly where the hotels are. Patong holds about a third of the {s.shops} shops we track, strung along Bangla Road, the beach road and Rat-U-Thit behind them; Kata and Karon share a long beach road with a shop every few hundred metres; Kamala, Bang Tao and the Laguna resorts are quieter and newer; Rawai and Nai Harn in the south serve long-stay residents and publish the island's lowest prices; Phuket Town has the expat and day-tripper shops among the Sino-Portuguese shophouses. Everything else, from Chalong to the airport road, is scattered and mostly serves people who live there.</p>
        <p>The star average will not help you choose: nearly every shop is at 4.9 or 5.0 on Google, and the counters of 1,000 or more reviews at a perfect score are, by any statistics, not natural. So we read the text instead. The {s.texts.toLocaleString("en-US")} review texts behind this guide are sorted by what they actually talk about: the flower, the price, the room, the staff, and the things that make a reviewer feel cheated. Each shop gets six scores and every score opens to the sentences it was built from. Shops with fewer than five texts are shown but marked thin.</p>
        <p>Three patterns hold across the island this season. Patong is the most expensive address and the one with the most price and scam complaints, concentrated on the beach strip. Kata and Rawai are where reviewers talk most about the product itself and least about the sofas, and where menus are published. And the shops that do the prescription properly, with a practitioner on site, are the ones that keep scoring well on trust; reviewers notice.</p>
        <h2>Where to start</h2>
        <p>Never bought here before: <Link href="/phuket/first-time/">the first-time guide</Link>, then <Link href="/phuket/what-to-buy/">four questions</Link> that give you a dose and three doors. Know what you want: a <Link href="/phuket/best/">ranking</Link>, or <Link href="/phuket/prices/">every published price</Link>. Somewhere to sit and smoke: <Link href="/phuket/lounges/">lounges</Link>. Your area: {AREAS.filter((a) => a.key !== "Other").map((a, i) => <span key={a.slug}>{i ? ", " : ""}<Link href={`/phuket/areas/${a.slug}/`}>{a.label}</Link></span>)}.</p>
      </section>
      <section className="sec"><h2>Top five on the island</h2><div className="rows" style={{ marginTop: 8 }}>{ranked("overall", SHOPS).slice(0, 5).map((sh, i) => <RankedRow key={sh.id} s={sh} i={i} take="overall" />)}</div></section>
    </main>
  );
}
