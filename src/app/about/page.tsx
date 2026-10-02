import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "About BudMap", description: "An independent guide to cannabis shops for travellers, starting with Phuket. Scores from reviews, not from advertising." };
export default function Page() {
  return (
    <main className="wrap page prose">
      <span className="eyebrow">About</span>
      <h1>About BudMap</h1>
      <p className="lead">A guide for travellers who want to know which shop actually has good flower at a fair price, and which one has great sofas and dry weed.</p>
      <p>Thailand has more cannabis shops per tourist than anywhere on earth, and every one of them has five stars. The ranking sites that exist are either paid listicles, a shop's own blog, or copies of Google Maps with a “verified” badge for sale. We wanted the thing we could not find: a map that reads the reviews for you, in your language and four others, and tells you why a place is good or not.</p>
      <p>BudMap starts with Phuket in October 2026 and will add Samui, Phangan and Bangkok as we read their reviews. Nothing here is for sale: no featured spots, no affiliate links, no sponsored lists. <Link href="/how-we-score/">The method is public.</Link> If you run a shop and a fact is wrong, <Link href="/for-shops/">tell us</Link>.</p>
      <p>Cannabis in Thailand is sold for medical use to adults 20+ on a Thai prescription. This site informs; it does not sell, deliver or prescribe. Smoking in public is fined, and taking cannabis to any airport is a crime. If that is not your trip, this is not your site.</p>
    </main>
  );
}
