import type { Metadata } from "next";
import { meta } from "@/lib/seo";
import Link from "next/link";
import { FEATS, SNAPSHOT, loungeShops, ranked } from "@/lib/data";
import { RankedRow } from "@/components/RankedRow";
import Faq from "@/components/Faq";

export const metadata: Metadata = meta("/phuket/lounges/", {
  title: `Cannabis lounges and weed cafés in Phuket (${SNAPSHOT.split(" ").slice(1).join(" ")})`,
  description: "Phuket shops where you can actually sit and smoke: lounges, smoking areas, games consoles, rooftops and 24-hour places, ranked by what reviewers say, with the flower score next to the vibe score.",
});

export default function Page() {
  const all = loungeShops();
  const rows = ranked("atmosphere", all);
  const byArea = new Map<string, number>(); all.forEach((s) => byArea.set(s.area, (byArea.get(s.area) || 0) + 1));
  const games = all.filter((s) => s.feat?.games_ps5_netflix).length; const late = all.filter((s) => s.feat?.open_24h).length;
  return (
    <main className="wrap page">
      <span className="eyebrow">Phuket · lounges &amp; cafés · {SNAPSHOT}</span>
      <h1>Cannabis lounges and weed cafés in Phuket</h1>
      <p className="lead">Smoking on the street or the beach can cost you a fine, so the question is where you can sit down. These {all.length} shops are mentioned by reviewers for a lounge, a smoking area, games or a rooftop. Ranked by vibe; the Flower score on each page tells you whether the weed matches the sofas.</p>
      <div className="stat-row" style={{ margin: "8px 0 16px" }}>
        <span><b>{all.length}</b>shops with somewhere to smoke</span>
        <span><b>{games}</b>mention PS5, Xbox or Netflix</span>
        <span><b>{late}</b>open 24 hours</span>
        {[...byArea.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([a, n]) => <span key={a}><b>{n}</b>in {a}</span>)}
      </div>
      <div className="chips" style={{ marginBottom: 14 }}><Link className="chip" href="/phuket/map/?take=atmosphere">Show on map →</Link><Link className="chip" href="/phuket/best/atmosphere/">Best vibe ranking (all shops)</Link></div>
      <div className="rows">{rows.map((s, i) => <RankedRow key={s.id} s={s} i={i} take="atmosphere" />)}</div>
      <section className="sec prose">
        <h2>What a Phuket lounge actually is</h2>
        <p>Three formats come up in reviews. The sofa-and-console lounge, usually upstairs or at the back, with a PlayStation, Netflix and free bongs; reviewers love these and the Google ratings show it, but the same reviews rarely say a word about the flower. The café-bar, with coffee, music and a terrace, often open past midnight on Bangla Road and Kata beach road. And the rooftop, rarer and mostly in Patong. In all three you buy inside and smoke on the premises; nobody checks a prescription twice.</p>
        <p>Features come from review text, names and opening hours, so “not listed” means nobody mentioned it, not that it does not exist. Run a lounge we missed? <Link href="/for-shops/">Tell us</Link>.</p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Feature tags we use: {FEATS.map((f) => f.label).join(" · ")}.</p>
      </section>
      <Faq items={[
        { q: "Can I smoke inside a dispensary in Phuket?", a: "In shops with a lounge or smoking area, yes; that is what the lounge is for. Smoking in public places, on the beach or on the street can be fined up to ฿25,000 as a public nuisance." },
        { q: "Which Phuket weed shops are open 24 hours?", a: `${late} shops in our data are reported open 24 hours, most of them in Patong and Kata. Filter the map by “Open 24h” for the current list.` },
        { q: "Do lounges charge to sit?", a: "Reviewers do not report cover charges; the expectation is that you buy flower, pre-rolls or drinks there. Some lounges lend bongs and papers for free." },
      ]} />
    </main>
  );
}
