import type { Metadata } from "next";
import Link from "next/link";
import { meta, breadcrumbs, Ld } from "@/lib/seo";
import { SHOPS, SNAPSHOT, isOpenStatus } from "@/lib/data";
import Quiz, { QuizShop } from "@/components/Quiz";

export const metadata: Metadata = meta("/phuket/what-to-buy/", {
  title: "What to buy and how much: a two-minute guide for your first gram in Phuket",
  description: "Four questions, then a dose, a product to ask for and three Phuket shops that fit, chosen from review scores. For people who have never smoked, haven't in years, or just want to try without overpaying.",
});

export default function Page() {
  const shops: QuizShop[] = SHOPS.filter((s) => isOpenStatus(s) && s.n >= 8).map((s) => ({
    slug: s.slug, name: s.name, area: s.area, overall: s.scores.overall, quality: s.scores.quality, price: s.scores.price, atmosphere: s.scores.atmosphere, beginner: s.scores.beginner, trust: s.scores.trust, n: s.n, price_med: s.price_med,
    lounge: !!(s.feat?.lounge_smoking_area || s.feat?.games_ps5_netflix || s.feat?.rooftop), doctor: !!s.feat?.doctor_prescription, late: !!s.feat?.open_24h,
  }));
  return (
    <main className="wrap page">
      <Ld data={breadcrumbs([{ name: "BudMap", path: "/" }, { name: "Phuket", path: "/phuket/" }, { name: "What to buy", path: "/phuket/what-to-buy/" }])} />
      <span className="eyebrow">Phuket · first gram · updated {SNAPSHOT}</span>
      <h1>What to buy, how much, and where: two minutes</h1>
      <p className="lead">Every shop in Phuket will sell you something. The questions are which jar, how much of it, and whether the door you picked is one reviewers trust. Answer four things and you get a dose that will not ruin your evening, a product to ask for by name, and three shops near you chosen from {shops.length} reviewed ones. The rules behind the answers are written out below the quiz, so you can disagree with them.</p>
      <Quiz shops={shops} />
      <section className="sec prose">
        <h2>The rules the quiz uses</h2>
        <p>Dose comes from experience, not from what you want: never or once means 0.2–0.3 g, years ago means 0.3–0.5 g, regular means your usual minus a third for the first jar, because Thai indoor is routinely 20%+ THC and potency numbers on menus are the shop's word. Product comes from what you want the evening to be: relaxing on a balcony points to an indica-leaning Thai jar in the ฿250–450 band; a night out points to a sativa or hybrid and a shop with a lounge, because smoking on Bangla Road itself can cost you ฿25,000; sleep points to a heavy indica or a 5 mg gummy two hours before bed; curiosity points to the cheapest honest jar, Thai outdoor or greenhouse at ฿100–200, from a shop reviewers call fair. Shops come from the score that matches your priority (flower, price, vibe or staff who explain), weighted by the Trust score and the overall score so a cheap shop with scam mentions does not win on price alone; a first-timer always gets the first-timer score regardless of priority, and shops with a practitioner on site get a small bonus because the prescription is then a five-minute formality at the counter.</p>
        <h2>What the quiz cannot tell you</h2>
        <p>Whether tonight's jar is fresh: that you check with your nose at the counter. Whether the practitioner is actually there at 11 pm: ask at the door, or pick a shop whose page shows the hours. And whether you like it: start small, wait, decide.</p>
        <p><Link href="/phuket/first-time/" className="btn">The full first-time guide</Link> <Link href="/phuket/best/beginner/" className="btn">All shops ranked for first-timers</Link> <Link href="/phuket/map/" className="btn primary">Map near me</Link></p>
      </section>
    </main>
  );
}
