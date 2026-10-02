import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/Faq";
import { FAQ_PHUKET } from "@/lib/faq";
import { AREAS, SHOPS, SNAPSHOT, ranked } from "@/lib/data";

export const metadata: Metadata = {
  title: `Weed prices in Phuket (${SNAPSHOT.split(" ").slice(1).join(" ")})`,
  description: "What a gram costs in Phuket right now: published menu prices by shop and area, what reviewers call fair or a rip-off, and how to read budget, mid and top-shelf tiers.",
};

export default function Page() {
  const priced = SHOPS.filter((s) => s.price_med).sort((a, b) => (a.price_med as number) - (b.price_med as number));
  const all = priced.flatMap((s) => (s.price_src || []).map((p) => p.v).filter((v): v is number => !!v && v >= 20 && v <= 3000));
  const sorted = [...all].sort((a, b) => a - b);
  const med = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
  const q1 = sorted.length ? sorted[Math.floor(sorted.length * 0.25)] : null; const q3 = sorted.length ? sorted[Math.floor(sorted.length * 0.75)] : null;
  const pp = SHOPS.reduce((a, s) => a + (s.cnt?.price_pos || 0), 0); const pn = SHOPS.reduce((a, s) => a + (s.cnt?.price_neg || 0), 0);
  const byArea = AREAS.map((a) => { const sh = SHOPS.filter((s) => s.area === a.key); return { a, n: sh.length, pp: sh.reduce((x, s) => x + (s.cnt?.price_pos || 0), 0), pn: sh.reduce((x, s) => x + (s.cnt?.price_neg || 0), 0), priced: sh.filter((s) => s.price_med).length, min: Math.min(...sh.filter((s) => s.price_med).map((s) => s.price_med as number)) }; });
  const cheapest = ranked("price").slice(0, 10);
  return (
    <main className="wrap page">
      <span className="eyebrow">Phuket · prices · {SNAPSHOT}</span>
      <h1>Weed prices in Phuket</h1>
      <p className="lead">Most shops do not publish prices, so most “price guides” are guesses. This page shows only what we could read off a real menu or price list, with a date and a source, plus what {pp + pn} reviewers said about value.</p>
      <div className="stat-row" style={{ margin: "8px 0 18px" }}>
        <span><b>{priced.length}</b>of {SHOPS.length} shops publish prices</span>
        <span><b>{all.length}</b>price points collected</span>
        {med && <span><b>฿{med}</b>median published ฿/g</span>}
        {q1 && q3 && <span><b>฿{q1}–{q3}</b>middle half of prices</span>}
        <span><b>{pp} : {pn}</b>reviews “fair” : “expensive”</span>
      </div>
      <section className="sec prose">
        <h2>How to read a Phuket menu</h2>
        <p>Flower is sold by the gram, usually with cheaper per-gram rates at 3.5 g and 10 g. Shops tier their jars, and the tier names vary (budget / mid / top shelf, Tier 1–3, Thai / indoor / exotic). From published menus and reviewer reports, the island in autumn 2026 looks like this: budget Thai outdoor and greenhouse from about ฿100–200/g; standard indoor ฿250–450/g; “exotic”, “Cali” or top-shelf ฿600–1,000/g. Patong's beach strip and Bangla Road sit at the top of each band; Rawai, Kata and Phuket Town publish the lowest numbers.</p>
        <p>Two things reviewers repeat: price does not reflect quality (“paying 700 is insane, no better than the 300 weed”), and “Cali packs” are often repackaged Thai flower. A ฿300 jar that is fresh and sticky beats a ฿800 jar that is dry. Ask to smell before you pay, and check the card fee: several complaints are about a 5% fee quietly becoming 10%.</p>
      </section>
      <section className="sec">
        <h2>Shops with published prices, lowest first</h2>
        <div className="tblwrap"><table className="tbl"><thead><tr><th>Shop</th><th>Area</th><th>Median ฿/g</th><th>From</th><th>Points</th><th>Source · date</th></tr></thead><tbody>
          {priced.map((s) => <tr key={s.id}><td><Link href={`/phuket/shop/${s.slug}/`}>{s.name}</Link></td><td>{s.area}</td><td className="tnum">฿{Math.round(s.price_med as number)}</td><td className="tnum">{s.price_min ? `฿${Math.round(s.price_min)}` : "–"}</td><td className="tnum">{(s.price_src || []).filter((p) => p.v).length}</td><td>{s.price_src?.[0]?.u ? <a href={s.price_src[0].u} target="_blank" rel="noopener">{s.price_src[0].u.replace(/^https?:\/\//, "").split("/")[0]}</a> : "menu"}{s.price_src?.[0]?.d ? ` · ${s.price_src[0].d}` : ""}</td></tr>)}
        </tbody></table></div>
        <p className="note" style={{ marginTop: 10 }}>Medians mix strains and tiers within one shop, so compare shops by their “from” price and by tier when you are there. We add prices only with a source we can show; menu photos from readers with a date are welcome via <Link href="/for-shops/">corrections</Link>.</p>
      </section>
      <section className="sec">
        <h2>Cheapest by reviewer consensus</h2>
        <p className="lead" style={{ fontSize: 15 }}>The Cheapest ranking blends published prices (60%) with how often reviewers call a shop cheap or fair versus expensive.</p>
        <div className="rows" style={{ marginTop: 8 }}>{cheapest.map((s, i) => <Link key={s.id} href={`/phuket/shop/${s.slug}/`} className="row"><div className="score" style={{ color: "var(--s4)" }}>{s.scores.price}<small>price</small></div><div><div className="nm">{i + 1}. {s.name}</div><div className="sub">{s.area} · {s.cnt?.price_pos || 0} “fair/cheap” · {s.cnt?.price_neg || 0} “expensive”{s.price_med ? ` · published ฿${Math.round(s.price_med)}/g` : ""}</div></div><div className="right">{s.n} texts</div></Link>)}</div>
        <p style={{ marginTop: 10 }}><Link href="/phuket/best/price/">Full Cheapest ranking →</Link></p>
      </section>
      <section className="sec">
        <h2>By area</h2>
        <div className="tblwrap"><table className="tbl"><thead><tr><th>Area</th><th>Shops</th><th>Publish prices</th><th>Lowest published ฿/g</th><th>“Fair” : “expensive” in reviews</th></tr></thead><tbody>
          {byArea.map((r) => <tr key={r.a.slug}><td><Link href={`/phuket/areas/${r.a.slug}/`}>{r.a.label}</Link></td><td className="tnum">{r.n}</td><td className="tnum">{r.priced}</td><td className="tnum">{isFinite(r.min) ? `฿${Math.round(r.min)}` : "–"}</td><td className="tnum">{r.pp} : {r.pn}</td></tr>)}
        </tbody></table></div>
      </section>
      <Faq items={[FAQ_PHUKET[1], FAQ_PHUKET[6], { q: "Why do most Phuket shops not publish prices?", a: "Advertising cannabis flower is formally restricted in Thailand, so most shops keep prices for the counter. Shops that do publish a menu are, in our data, among the cheaper ones; we show only prices with a source and a date." }]} />
    </main>
  );
}
