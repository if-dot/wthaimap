import type { Metadata } from "next";
import { meta } from "@/lib/seo";
import Link from "next/link";
import CorrectionForm from "@/components/CorrectionForm";
export const metadata: Metadata = meta("/for-shops/", { title: "For shops: fix your listing", description: "Correct hours, address or published prices on BudMap. No paid placement; scores cannot be bought or edited." });
export default function Page() {
  return (
    <main className="wrap page prose">
      <span className="eyebrow">For shops</span>
      <h1>Fix your listing</h1>
      <p className="lead">We list every licensed shop we can find and score it from what reviewers say. You cannot buy a place or change a score. You can fix facts.</p>
      <h2>What we will change</h2>
      <ul>
        <li>Address, hours, phone, website, and whether you are open.</li>
        <li>Published prices: send a photo of your current menu or price board with the date visible, and we add it with the date and keep the history.</li>
        <li>Practitioner on site: tell us the hours a practitioner is available and the fee, and we show it.</li>
        <li>Lab results: send a certificate of analysis for a batch and we link it. Right now nobody in Phuket does; the first shops that do will stand out.</li>
      </ul>
      <h2>What we will not change</h2>
      <p>Scores, quotes, or the order of any list. If a quote is not from a review of your shop, show us and we remove it.</p>
      <h2>Send a correction</h2>
      <p>Fill this in and it goes to us by email with everything we need; we reply within a week and the fix lands in the next snapshot with the date. Nothing here changes a score. <Link href="/how-we-score/">How we score.</Link></p>
      <CorrectionForm />
    </main>
  );
}
