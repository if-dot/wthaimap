import type { Metadata } from "next";
import { meta } from "@/lib/seo";
import Link from "next/link";
export const metadata: Metadata = meta("/about/", { title: "About BudMap", description: "An independent guide to cannabis shops for travellers, starting with Phuket. Scores from reviews, not from advertising." });
export default function Page() {
  return (
    <main className="wrap page prose">
      <span className="eyebrow">About</span>
      <h1>About BudMap</h1>
      <p className="lead">A guide for travellers who want to know which shop actually has good flower at a fair price, and which one has great sofas and dry weed.</p>
      <p>Thailand has more cannabis shops per tourist than anywhere on earth, and every one of them has five stars. The ranking sites that exist are either paid listicles, a shop's own blog, or copies of Google Maps with a “verified” badge for sale. We wanted the thing we could not find: a map that reads the reviews for you, in your language and four others, and tells you why a place is good or not.</p>
      <p>BudMap starts with Phuket in October 2026 and will add Samui, Phangan and Bangkok as we read their reviews. Nothing here is for sale: no featured spots, no affiliate links, no sponsored lists. <Link href="/how-we-score/">The method is public.</Link> If you run a shop and a fact is wrong, <Link href="/for-shops/">tell us</Link>.</p>
      <h2>Who writes this</h2>
      <p>BudMap is written and maintained by a small editorial team based in Phuket. We are not affiliated with any dispensary, chain, clinic or payment provider, and we do not accept listing fees, affiliate commissions or sponsored content. The texts on area, price and legal pages are our own; the scores come from a published method applied to public reviews, and every number on a shop page links to the sentences it was built from. We re-read reviews on a fixed schedule and date every snapshot, so a score you see is tied to a date you can see.</p>
      <h2>Corrections</h2>
      <p>If a fact is wrong (hours, address, a closed shop, a misread price), <Link href="/for-shops/">send a correction</Link> and we fix it in the next snapshot. We do not change scores by request, only the facts the scores are built from.</p>
      <p>Cannabis in Thailand is sold for medical use to adults 20+ on a Thai prescription. This site informs; it does not sell, deliver or prescribe. Smoking in public is fined, and taking cannabis to any airport is a crime. If that is not your trip, this is not your site.</p>
    </main>
  );
}
