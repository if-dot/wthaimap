import type { Metadata } from "next";
import Link from "next/link";
import { meta, breadcrumbs, Ld } from "@/lib/seo";
import { SNAPSHOT } from "@/lib/data";
import Faq from "@/components/Faq";

export const metadata: Metadata = meta("/thailand/is-weed-legal/", {
  title: "Is weed legal in Thailand in 2026? What tourists can and cannot do",
  description: "Short answer: cannabis flower is sold legally to adults 20+ for medical use on a Thai prescription, and many shops issue one at the counter. What is legal, what gets you fined, what gets you arrested, and what changed in 2025–2026. Updated " + SNAPSHOT + ".",
});

export default function Page() {
  return (
    <main className="wrap page prose">
      <Ld data={breadcrumbs([{ name: "BudMap", path: "/" }, { name: "Thailand", path: "/thailand/is-weed-legal/" }, { name: "Is weed legal in 2026?", path: "/thailand/is-weed-legal/" }])} />
      <span className="eyebrow">Thailand · law for travellers · updated {SNAPSHOT}</span>
      <h1>Is weed legal in Thailand in 2026?</h1>
      <p className="lead"><b>Yes, with conditions.</b> Cannabis flower is a legal, regulated product in Thailand, sold by licensed shops to adults aged 20 and over for medical use on a Thai prescription (form PT33, up to a 30-day supply). It is not a narcotic and buying it is not a crime. What is illegal: smoking in public, selling without a licence, and taking any cannabis across a border or through an airport. Below is how that works in practice, as of {SNAPSHOT}.</p>

      <h2>What changed, in order</h2>
      <p>June 2022: Thailand removed cannabis from its narcotics list and thousands of shops opened. June 2025: the Ministry of Public Health reclassified flower as a “controlled herb”: sale only on a prescription from a Thai practitioner, no advertising of flower, no online sales, no vending or delivery. 2026: licence renewals require a medical-facility status and a practitioner present; a Cannabis Control Act approved by cabinet in September 2026 is in parliament and would keep the medical-only frame with stricter penalties. Cannabis was not put back on the narcotics list at any point.</p>

      <h2>What this means for a tourist, in practice</h2>
      <p>You walk into a licensed shop with your passport. In most Phuket shops in 2026 a practitioner at the counter or on a video link asks a few questions about sleep, stress or pain and issues the prescription on the spot, free or for ฿100–500. Reviewers on Google and Reddit report that many shops skip even that in busy areas; the shops that do it properly are the ones that will still be open next year, which is why BudMap's Trust score rewards them. Foreign prescriptions, medical cards from home and online “Thai weed cards” sold by third parties do not replace a Thai prescription.</p>
      <p>You may possess what you were prescribed. You may not smoke it in public: the street, the beach, a bar that has not said yes. Public smoking is treated as a nuisance under the Public Health Act with fines up to ฿25,000 and in principle up to three months' detention. Shops with a lounge, and hotels that allow balconies, are where people actually smoke.</p>

      <h2>What gets tourists arrested</h2>
      <p>Carrying cannabis to an airport, including for a domestic flight to Samui or Chiang Mai, where spot checks happen; carrying it across any border; and mailing it. Hundreds of British and Indian travellers have been arrested at home airports with Thai flower since 2024, and Thai customs now bills ฿30,000 per seized kilogram on top of the criminal case. Buying from a beach seller or a tuk-tuk contact rather than a licensed shop. And confusing the cannabis rules with mushrooms: psilocybin remains a Category 5 narcotic with real prison terms (<Link href="/phuket/mushrooms/">details</Link>).</p>

      <h2>Edibles, vapes, delivery</h2>
      <p>Edibles are legal only as approved products; gummies are sold widely and inspectors in Phuket have targeted sweets specifically. THC vapes are not permitted. Delivery is banned under the 2025 rules; shops that still deliver via LINE or Telegram do so outside the law, and BudMap does not list delivery services.</p>

      <h2>Will it change again?</h2>
      <p>The government that tightened the rules is the same party that legalised cannabis in 2022, and it has said repeatedly that the goal is a medical market, not a ban. The shops most likely to close are the ones that cannot meet the medical-facility requirements when their licences expire through 2026–2028. For a visitor the practical rule has been stable for a year: buy from a licensed shop, get the prescription at the counter, smoke on the premises or at your hotel, leave it behind when you fly.</p>

      <p style={{ marginTop: 18 }}><Link href="/phuket/first-time/" className="btn">How buying works: the first-time guide</Link> <Link href="/phuket/map/" className="btn primary">Find a shop near me in Phuket</Link></p>

      <Faq items={[
        { q: "Can tourists legally buy weed in Thailand?", a: "Yes. Adults 20+ can buy flower from a licensed shop on a Thai prescription, which many shops issue at the counter in minutes. Foreign prescriptions do not count." },
        { q: "Is weed decriminalised or legal in Thailand?", a: "Legal and regulated as a controlled herb for medical use, not a narcotic. Recreational sale without a prescription is not permitted, which in practice is enforced unevenly." },
        { q: "What is the fine for smoking weed in public in Thailand?", a: "Up to ฿25,000 and in principle up to three months' detention under the Public Health Act. Lounges inside shops and hotel balconies that allow it are the realistic options." },
        { q: "Can I bring weed home from Thailand or take it on a domestic flight?", a: "No. Both are criminal offences with regular arrests, including at Phuket and Samui airports and at airports in the UK, India and elsewhere on arrival." },
        { q: "Did Thailand ban weed again in 2025 or 2026?", a: "No. In June 2025 flower became prescription-only and advertising was banned; in 2026 shops must meet medical-facility rules to renew licences. Cannabis was not returned to the narcotics list." },
      ]} />
    </main>
  );
}
