import type { Metadata } from "next";
import Link from "next/link";
import { SNAPSHOT, strainIndex } from "@/lib/data";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  title: `Weed strains on Phuket menus with prices (${SNAPSHOT.split(" ").slice(1).join(" ")})`,
  description: "Every strain we found on a published Phuket dispensary menu, with the price per gram, the shop and the date. Tropicana Cherry, Super Boof, Runtz and what the names actually mean in Thailand.",
};

export default function Page() {
  const idx = strainIndex();
  const multi = idx.filter((x) => x.entries.length > 1);
  const shops = new Set(idx.flatMap((x) => x.entries.map((e) => e.shop.id)));
  return (
    <main className="wrap page">
      <span className="eyebrow">Phuket · strains · {SNAPSHOT}</span>
      <h1>Strains on Phuket menus</h1>
      <p className="lead">{idx.length} named strains from {shops.size} shops that publish a menu, with the price per gram and the source. Most shops do not publish anything, so this is the visible slice, not the whole island.</p>
      <section className="sec prose">
        <h2>Read the names with a pinch of salt</h2>
        <p>Thai shops name jars after whatever genetics they were sold, or after whatever sells. Reviewers and Reddit users repeatedly report “Cali packs” that are local flower in imported bags, and the same strain name at three times the price two doors down. A name tells you the flavour family at best; freshness, smell and how it was dried tell you whether it is any good. Nobody on Phuket publishes lab results yet.</p>
      </section>
      {multi.length > 0 && <section className="sec"><h2>Sold in more than one shop</h2><div className="grid3" style={{ marginTop: 10 }}>{multi.map((x) => <div className="card" key={x.slug}><h3><Link href={`/phuket/strains/${x.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>{x.name}</Link></h3><div style={{ fontSize: 13.5, marginTop: 6 }}>{x.entries.map((e) => <div key={e.shop.id}>฿{e.price}/g · <Link href={`/phuket/shop/${e.shop.slug}/`}>{e.shop.name}</Link> · {e.shop.area}</div>)}</div></div>)}</div></section>}
      <section className="sec"><h2>All strains found, cheapest first</h2>
        <div className="tblwrap"><table className="tbl"><thead><tr><th>Strain</th><th>฿/g</th><th>Shop</th><th>Area</th><th>Source · date</th></tr></thead><tbody>
          {idx.flatMap((x) => x.entries.map((e) => ({ x, e }))).sort((a, b) => a.e.price - b.e.price).map(({ x, e }) => <tr key={x.slug + e.shop.id}><td>{x.name}</td><td className="tnum">฿{e.price}</td><td><Link href={`/phuket/shop/${e.shop.slug}/`}>{e.shop.name}</Link></td><td>{e.shop.area}</td><td>{e.url ? <a href={e.url} target="_blank" rel="noopener">{e.url.replace(/^https?:\/\//, "").split("/")[0]}</a> : "menu"}{e.date ? ` · ${e.date}` : ""}</td></tr>)}
        </tbody></table></div>
        <p className="note" style={{ marginTop: 10 }}>Prices are as published on the shop's own menu on the date shown; per-gram unless the menu says otherwise. Send us a dated photo of a menu and we add it.</p>
      </section>
      <Faq items={[
        { q: "What strains are popular in Phuket?", a: "Published menus lean on fruit-and-dessert names: Tropicana Cherry, Super Boof, Runtz and Biscotti crosses, Girl Scout Cookies, Amnesia Haze and Diesel types for sativa fans. Thai landrace is rare in tourist shops; ask for Thai-grown if you want to try it." },
        { q: "Is the THC percentage on Phuket menus accurate?", a: "Treat it as marketing. No Phuket shop we found publishes a lab certificate for a batch, and reviewers report the same name at wildly different quality. Judge by smell, stickiness and how the flower looks, not the number." },
        { q: "Are 'Cali packs' in Thailand really imported?", a: "Importing flower into Thailand is illegal, so a sealed US-brand bag at a Phuket counter is either smuggled or, far more often according to reviewers and Reddit, local flower in a printed bag. Pay for what is in the jar, not the bag." },
      ]} />
    </main>
  );
}
