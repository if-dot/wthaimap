import type { Metadata } from "next";
import Link from "next/link";
import { SNAPSHOT, ranked } from "@/lib/data";
import { RankedRow } from "@/components/RankedRow";
import Faq from "@/components/Faq";
import { FAQ_PHUKET } from "@/lib/faq";

export const metadata: Metadata = {
  title: "First time buying weed in Thailand: how it works in Phuket (2026)",
  description: "How buying cannabis actually works in Phuket in 2026: the prescription at the counter, what a gram costs, how much to take, where you can and cannot smoke, and the mistakes that get tourists arrested.",
};

export default function Page() {
  const top = ranked("beginner").slice(0, 8);
  return (
    <main className="wrap page">
      <span className="eyebrow">Phuket · guide · updated {SNAPSHOT}</span>
      <h1>First time buying weed in Thailand</h1>
      <p className="lead">Written for someone standing on Bangla Road wondering what the rules are and which door to pick. Based on what reviewers and Reddit users report from Phuket shops this year, and on the current rules. Not legal advice.</p>
      <section className="sec prose">
        <h2>Is it legal for me?</h2>
        <p>Cannabis flower is sold in Thailand to adults 20+ for medical use, on a prescription from a Thai practitioner. In practice, in Phuket in 2026, this works like this: you walk into a licensed shop, show ID, and in many shops a practitioner at the counter (or by video) writes the prescription in a few minutes, typically for free or ฿100–500, and asks about sleep, stress or pain. Reviewers consistently report that most shops in Patong, Kata and Karon do not ask for anything else; on the smaller islands and in quieter areas not every shop has a practitioner, so the shop that can issue one on the spot is the easier shop. Foreign prescriptions and cards from home do not count. Shops are inspected; the ones that score high on Trust here tend to be the ones doing it properly.</p>
        <h2>What it costs</h2>
        <p>Published Phuket menus in October 2026 run from about ฿100–200 per gram for Thai outdoor and greenhouse flower, ฿250–450 for standard indoor, and ฿600–1,000 for anything sold as exotic, Cali or top shelf. Bangla Road and the beach strip in Patong are the most expensive addresses; Rawai, Kata and Phuket Town publish the lowest numbers. Reviewers say the same thing over and over: the ฿700 jar is often no better than the ฿300 one, and “Cali packs” are frequently local flower in imported packaging. See <Link href="/phuket/prices/">prices</Link> for every published number we have.</p>
        <h2>How to pick a good one</h2>
        <p>Ask to smell the jar. Fresh flower smells strong and feels slightly sticky; dry, crumbly, brown or scentless flower is old, and that is the single most common complaint in Phuket reviews. Ask what is Thai-grown and what is not, and when the jar was opened. Pre-rolls are the lazy option and the most likely to be made from trim. If a shop rushes you, pushes the most expensive jar, or adds a card fee at the till, that is a trust signal too. Our <Link href="/phuket/best/quality/">Best flower</Link> list counts only comments about the product, not about the sofas.</p>
        <h2>How much to take</h2>
        <p>If you have not smoked in years, or ever: 0.3–0.5 g in a joint is plenty, not a whole gram, and Thai indoor is often 20%+ THC. The most upvoted “bad first experience” threads on Reddit are people who finished a full-gram joint. With edibles, wait two hours before deciding they did nothing; gummies in Thailand are inconsistently dosed. Do not mix with the buckets.</p>
        <h2>Where you can smoke</h2>
        <p>Not on the street, the beach or in a bar that has not said yes: smoking in public can be treated as a public nuisance with a fine up to ฿25,000. Shops with a lounge or a smoking area are the easiest answer, and our <Link href="/phuket/best/atmosphere/">Best vibe</Link> list is built around them. Many hotels tolerate a balcony and some advertise themselves as 420-friendly; ask at check-in rather than find out from the night manager.</p>
        <h2>What gets tourists arrested</h2>
        <p>Taking cannabis to the airport. Not just international flights: domestic flights have spot checks too, and hundreds of British, Indian and other travellers have been arrested at home with Thai cannabis in their luggage. Finish it or leave it. Buying from a beach seller or a tuk-tuk contact rather than a licensed shop, and buying mushrooms, which are a Category 5 narcotic with real prison time and are nothing like the weed situation.</p>
        <h2>Which door</h2>
        <p>Below are the shops that score highest for first-timers: reviews that mention a first time, staff who explained and advised, no pushiness and no overcharge complaints. Or open the <Link href="/phuket/map/?take=beginner">map</Link> and let it sort by distance.</p>
      </section>
      <div className="rows" style={{ marginTop: 10 }}>{top.map((s, i) => <RankedRow key={s.id} s={s} i={i} take="beginner" />)}</div>
      <p style={{ marginTop: 10 }}><Link href="/phuket/best/beginner/">Full first-timer ranking →</Link></p>
      <Faq items={[FAQ_PHUKET[0], FAQ_PHUKET[3], FAQ_PHUKET[4], FAQ_PHUKET[5], { q: "How much weed should I buy the first time?", a: "One gram is plenty for a first evening; a 0.3–0.5 g joint is a sensible first dose with Thai indoor flower at 20%+ THC. Many shops sell 0.5 g or single pre-rolls." }]} />
    </main>
  );
}
