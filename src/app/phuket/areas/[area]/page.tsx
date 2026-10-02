import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AREAS, SHOPS, SNAPSHOT, TAKES, areaBySlug, isThin, ranked } from "@/lib/data";
import { RankedRow } from "@/components/RankedRow";
import Faq from "@/components/Faq";
import { SUBAREAS } from "@/lib/data";

export function generateStaticParams() { return AREAS.map((a) => ({ area: a.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
  const { area } = await params; const A = areaBySlug(area); if (!A) return {};
  const n = SHOPS.filter((s) => s.area === A.key).length;
  return { title: `Best dispensaries in ${A.label} (${SNAPSHOT.split(" ").slice(1).join(" ")})`, description: `${n} cannabis shops in ${A.label}, Phuket, ranked from reviews: best flower, cheapest, best vibe, first-timer friendly. With the quotes behind each score.` };
}

export default async function Page({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params; const A = areaBySlug(area); if (!A) notFound();
  const all = SHOPS.filter((s) => s.area === A.key);
  const rows = ranked("overall", all);
  const thin = all.filter(isThin).length;
  const c = { qp: 0, qn: 0, pp: 0, pn: 0, texts: 0 };
  all.forEach((s) => { c.qp += s.cnt?.quality_pos || 0; c.qn += s.cnt?.quality_neg || 0; c.pp += s.cnt?.price_pos || 0; c.pn += s.cnt?.price_neg || 0; c.texts += s.n; });
  const priced = all.filter((s) => s.price_med).sort((a, b) => (a.price_med as number) - (b.price_med as number));
  const byTake = TAKES.filter((t) => t.key !== "overall").map((t) => ({ t, top: ranked(t.key, all).slice(0, 3) }));
  return (
    <main className="wrap page">
      <span className="eyebrow">Phuket · {A.label} · {SNAPSHOT}</span>
      <h1>Dispensaries in {A.label}</h1>
      <p className="lead">{A.blurb}</p>
      <div className="stat-row" style={{ margin: "8px 0 16px" }}>
        <span><b>{all.length}</b>shops mapped</span>
        <span><b>{c.texts}</b>review texts</span>
        <span><b>{c.qp}</b>praise the flower · {c.qn} complain</span>
        <span><b>{c.pp}</b>call prices fair · {c.pn} expensive</span>
        <span><b>{priced.length}</b>publish prices{priced.length ? ` (from ฿${Math.round(priced[0].price_med as number)}/g)` : ""}</span>
      </div>
      <div className="chips" style={{ marginBottom: 16 }}><Link className="chip" href={`/phuket/map/?area=${encodeURIComponent(A.key)}`}>Show {A.label} on the map →</Link>{AREAS.filter((x) => x.slug !== A.slug).map((x) => <Link key={x.slug} className="chip" href={`/phuket/areas/${x.slug}/`}>{x.label}</Link>)}</div>
      <section className="sec"><h2>Ranked: best overall in {A.label}</h2><div className="rows" style={{ marginTop: 10 }}>{rows.map((sh, i) => <RankedRow key={sh.id} s={sh} i={i} take="overall" />)}</div>{thin > 0 && <p className="note" style={{ marginTop: 10 }}>{thin} more shops in {A.label} have fewer than five review texts and are shown on the map as thin data.</p>}</section>
      <section className="sec"><h2>By what matters to you</h2><div className="grid2" style={{ marginTop: 10 }}>{byTake.map(({ t, top }) => <div className="card" key={t.key}><h3><Link href={`/phuket/best/${t.key}/`} style={{ textDecoration: "none", color: "inherit" }}>{t.label}</Link></h3><div className="rows" style={{ marginTop: 8 }}>{top.map((sh, i) => <RankedRow key={sh.id} s={sh} i={i} take={t.key} />)}</div></div>)}</div></section>
      {A.key === "Patong" && <section className="sec"><h2>Inside Patong</h2><div className="chips" style={{ marginTop: 8 }}>{SUBAREAS.map((x) => <Link key={x.slug} className="chip" href={`/phuket/areas/patong/${x.slug}/`}>{x.label}</Link>)}</div></section>}
      {priced.length > 0 && <section className="sec"><h2>Published prices in {A.label}</h2><div className="tblwrap"><table className="tbl"><thead><tr><th>Shop</th><th>Median ฿/g</th><th>From</th><th>Source</th></tr></thead><tbody>{priced.map((s) => <tr key={s.id}><td><Link href={`/phuket/shop/${s.slug}/`}>{s.name}</Link></td><td className="tnum">฿{Math.round(s.price_med as number)}</td><td className="tnum">{s.price_min ? `฿${Math.round(s.price_min)}` : "–"}</td><td>{s.price_src?.[0]?.u ? <a href={s.price_src[0].u} target="_blank" rel="noopener">{s.price_src[0].u.replace(/^https?:\/\//, "").split("/")[0]}</a> : "menu"}{s.price_src?.[0]?.d ? ` · ${s.price_src[0].d}` : ""}</td></tr>)}</tbody></table></div></section>}
      <Faq items={[
        { q: `How many weed shops are there in ${A.label}?`, a: `We map ${all.length} licensed cannabis shops in ${A.label} as of ${SNAPSHOT}; ${rows.length} have enough review text to score.` },
        { q: `What does weed cost in ${A.label}?`, a: priced.length ? `Published menus in ${A.label} start from ฿${Math.round(priced[0].price_med as number)} per gram; ${c.pp} reviewers call prices fair and ${c.pn} call them expensive.` : `No shop in ${A.label} publishes prices; ${c.pp} reviewers call prices fair and ${c.pn} call them expensive. Island-wide, budget flower starts around ฿100–200/g and top shelf runs ฿600–1,000/g.` },
        { q: `Which dispensary in ${A.label} has the best flower?`, a: rows.length ? `By product-only review comments, ${ranked("quality", all)[0]?.name} currently scores highest for flower in ${A.label}. The ranking updates as reviews come in; every score links to its quotes.` : "Not enough review text yet to say." },
      ]} />
    </main>
  );
}
