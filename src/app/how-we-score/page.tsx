import type { Metadata } from "next";
import { meta } from "@/lib/seo";
import Link from "next/link";
import { SNAPSHOT, stats } from "@/lib/data";

export const metadata: Metadata = meta("/how-we-score/", { title: "How we score", description: "How BudMap turns reviews in five languages, Reddit threads and published menus into six scores per shop, and what the scores cannot tell you." });

export default function Page() {
  const s = stats();
  return (
    <main className="wrap page prose">
      <span className="eyebrow">Method · snapshot {SNAPSHOT}</span>
      <h1>How we score</h1>
      <p className="lead">Google gives almost every Phuket dispensary 4.9 or 5.0. The average is useless; the text is not. We read the text.</p>
      <h2>What goes in</h2>
      <ul>
        <li><b>Reviews.</b> {s.texts.toLocaleString("en-US")} review texts across {s.shops} shops, pulled separately in English, Russian, German, French and Hebrew, because Google serves different reviews in each language. Google returns its “most relevant” reviews, not all of them, so a shop's sample is typically 5–25 texts. We show the count on every card.</li>
        <li><b>Reddit.</b> r/CannabisThailand and r/phuket, matched to shop names: {s.reddit} mentions. These are independent of the shop's own Google page and are weighted into Trust.</li>
        <li><b>Published prices.</b> Online menus and price lists with a date and a source: {s.priced} shops. We do not estimate prices for shops that publish none.</li>
        <li><b>Listing facts.</b> Coordinates, hours, categories, website, open/closed status, Google rating and review count as observed on the snapshot date.</li>
      </ul>
      <h2>Classification</h2>
      <p>Each review is tagged by theme with a multilingual vocabulary: praise of the product (fresh, smells great, sticky, strong, top shelf, качество, frisch, qualité, איכות…), complaints about the product (dry, weak, harsh, mouldy, сухая, schwach, sec…), price praise and complaints, atmosphere, staff praise and complaints, first-time mentions, trust complaints (scam, overcharge, wrong change, fake) and prescription mentions. Comments about friendly staff do not count as comments about flower. For each tag we keep the quotes, and we show them.</p>
      <h2>The six scores (0–100)</h2>
      <ul>
        <li><b>Best flower.</b> Share of reviews that praise the product, minus 1.5× the share that complain, scaled around 50.</li>
        <li><b>Cheapest.</b> Published median price per gram, mapped so that ฿150 ≈ 95 and ฿800 ≈ 20, weighted 60%; the remaining 40% is the balance of cheap-or-fair against expensive in reviews. Shops with no published prices are scored on reviews alone.</li>
        <li><b>Best vibe.</b> 15 points each for a lounge or smoking area, games or Netflix, a rooftop and 24-hour opening, plus up to 60 for the share of reviews that talk about the atmosphere.</li>
        <li><b>First time.</b> First-time mentions (double weight) plus staff praise, minus double weight for rude-staff and trust complaints, scaled around 50; +8 if reviewers explicitly call the shop beginner-friendly.</li>
        <li><b>Trust.</b> Starts at 70. −15 per scam/overcharge mention, −8 per review of 3★ or lower in our sample, −10 for a perfect 5.0 at 800+ reviews, −10 for a rating under 4.6, −40 if listed as closed; +3 per positive and −6 per negative Reddit mention (capped).</li>
        <li><b>Best overall.</b> 35% flower, 20% trust, 15% each price, vibe and first time. Then shrunk toward 50 by confidence = texts/12, so a shop with three glowing reviews cannot top the island.</li>
      </ul>
      <h2>Thin data</h2>
      <p>Shops with fewer than five review texts are drawn hollow on the map, ranked only when you ask for them, and their pages are kept out of search indexes. When we read more reviews, they move up.</p>
      <h2>What the scores cannot tell you</h2>
      <p>Whether today's jar is fresh. Whether the THC on the label is real; nobody in Phuket publishes lab results and we flag that. Whether a review was bought: we penalise implausible perfection and look for independent mentions, but we cannot prove intent. Treat a score as a well-read friend's opinion with the sources attached, and treat the quotes as the real product.</p>
      <h2>Independence</h2>
      <p>No shop pays to be listed, ranked or featured. Shops can <Link href="/for-shops/">correct facts</Link> (hours, address, prices with a photo of the menu); they cannot change a score. We will say so on the page if that ever changes.</p>
    </main>
  );
}
