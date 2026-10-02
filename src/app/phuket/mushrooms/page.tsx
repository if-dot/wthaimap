import type { Metadata } from "next";
import { meta } from "@/lib/seo";
import Link from "next/link";
import Faq from "@/components/Faq";

export const metadata: Metadata = meta("/phuket/mushrooms/", {
  title: "Magic mushrooms in Phuket and Thailand: the law and the risks (2026)",
  description: "Psilocybin mushrooms are a Category 5 narcotic in Thailand with real prison terms. What 'mushroom shakes' on the islands are, what the police have done in 2025–2026, and how to stay safe. No listings; this is not a place to buy.",
});

export default function Page() {
  return (
    <main className="wrap page prose">
      <span className="eyebrow">Thailand · law &amp; safety</span>
      <h1>Magic mushrooms in Thailand</h1>
      <p className="lead">Cannabis in Thailand is a regulated legal product. Psilocybin mushrooms are not, and the gap between the two is prison. This page exists because people search for both together; it lists nothing and sells nothing.</p>
      <h2>The law</h2>
      <p>Psilocybin and psilocin are Category 5 narcotics under Thailand's Narcotics Code. The 2022 reform that decriminalised cannabis did not touch mushrooms. Thai FDA penalties as published: use, up to 1 year in prison and/or a ฿20,000 fine; production, import, export, sale or possession without a licence, up to 5 years and ฿500,000; sale for commercial purposes, 1 to 15 years and ฿100,000–1,500,000. A 2024 ministry notification opened a path for medical research into psilocybin, but as of 2026 there is no legal product and no clinic that can give it to a tourist.</p>
      <h2>What “mushroom shakes” are</h2>
      <p>Bars and guesthouses on Koh Phangan, Koh Tao, Koh Lanta and in Pai have sold “happy shakes” for decades, and the trade still exists. It is illegal for the seller and for the buyer. In May 2025 the owners of a cannabis shop on Koh Samui were arrested for selling mushrooms alongside weed; in January 2026 police raided 25 venues on Koh Phangan after a Full Moon party and charged 35 people; in December 2024 a 25-year-old British tourist died in Chiang Mai after mushrooms bought on Tha Phae Road. Reviewers on Koh Tao describe shakes that were “a rip off” with no effect, and others that put people in hospital. Dose is unknown by design.</p>
      <h2>If you are going to anyway</h2>
      <p>This is harm reduction, not permission. Never on a boat, a scooter or near water; never mixed with alcohol or the buckets; never alone, and never at a party where you cannot leave. Tell a sober friend what you took. Thai hospitals treat first and ask later; if someone is in trouble, go. And do not carry anything to any airport, domestic or international.</p>
      <h2>What BudMap does and does not do</h2>
      <p>We map and score licensed cannabis shops from what reviewers say. We do not list, rank or locate anyone selling mushrooms, and we remove any review quote that reads as a pointer to one. If you came here for cannabis, the <Link href="/phuket/first-time/">first-time guide</Link> and the <Link href="/phuket/map/">map</Link> are the right pages.</p>
      <Faq items={[
        { q: "Are magic mushrooms legal in Thailand?", a: "No. Psilocybin mushrooms are a Category 5 narcotic. Use carries up to a year in prison; selling carries 1 to 15 years. The 2022 cannabis reform did not change this." },
        { q: "Can I buy a mushroom shake on Koh Phangan or Koh Tao?", a: "Some bars sell them illegally. Buyers and sellers are both committing an offence, police raids on the islands continue, and doses are unknown. BudMap does not list sellers." },
        { q: "Is cannabis treated the same as mushrooms in Thailand?", a: "No. Cannabis flower is a regulated legal product sold to adults 20+ on a Thai prescription. Mushrooms are a narcotic with prison penalties. A shop that sells both is breaking the law and risking its licence." },
      ]} />
    </main>
  );
}
