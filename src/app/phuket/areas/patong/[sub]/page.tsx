import type { Metadata } from "next";
import { meta } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SNAPSHOT, SUBAREAS, TAKES, isThin, ranked, subareaShops } from "@/lib/data";
import { RankedRow } from "@/components/RankedRow";

export function generateStaticParams() { return SUBAREAS.map((s) => ({ sub: s.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ sub: string }> }): Promise<Metadata> {
  const { sub } = await params; const S = SUBAREAS.find((x) => x.slug === sub); if (!S) return {};
  const n = subareaShops(sub).length;
  return meta(`/phuket/areas/patong/${S.slug}/`, { title: `Weed shops on ${S.label}, Patong (${SNAPSHOT.split(" ").slice(1).join(" ")})`, description: `${n} dispensaries around ${S.label} in Patong, Phuket, ranked from reviews: best flower, cheapest, best vibe, first-timer friendly. With the quotes behind every score.` });
}
export default async function Page({ params }: { params: Promise<{ sub: string }> }) {
  const { sub } = await params; const S = SUBAREAS.find((x) => x.slug === sub); if (!S) notFound();
  const all = subareaShops(sub); const rows = ranked("overall", all); const thin = all.filter(isThin).length;
  const c = { qp: 0, qn: 0, pp: 0, pn: 0 }; all.forEach((s) => { c.qp += s.cnt?.quality_pos || 0; c.qn += s.cnt?.quality_neg || 0; c.pp += s.cnt?.price_pos || 0; c.pn += s.cnt?.price_neg || 0; });
  return (
    <main className="wrap page">
      <span className="eyebrow"><Link href="/phuket/">Phuket</Link> · <Link href="/phuket/areas/patong/">Patong</Link> · {SNAPSHOT}</span>
      <h1>Weed shops on {S.label}</h1>
      <p className="lead">{S.blurb}</p>
      <div className="stat-row" style={{ margin: "8px 0 14px" }}><span><b>{all.length}</b>shops</span><span><b>{c.qp}</b>praise the flower · {c.qn} complain</span><span><b>{c.pp}</b>call prices fair · {c.pn} expensive</span></div>
      <div className="chips" style={{ marginBottom: 14 }}>{SUBAREAS.map((x) => <Link key={x.slug} className="chip" aria-current={x.slug === sub ? "page" : undefined} href={`/phuket/areas/patong/${x.slug}/`}>{x.label}</Link>)}<Link className="chip" href="/phuket/map/?area=Patong">Patong on the map →</Link></div>
      <div className="rows">{rows.map((s, i) => <RankedRow key={s.id} s={s} i={i} take="overall" />)}</div>
      {thin > 0 && <p className="note" style={{ marginTop: 10 }}>{thin} more shops here have fewer than five review texts and are shown on the map as thin data.</p>}
      <section className="sec grid2">{TAKES.filter((t) => t.key !== "overall").slice(0, 4).map((t) => <div className="card" key={t.key}><h3>{t.label}</h3><div className="rows" style={{ marginTop: 8 }}>{ranked(t.key, all).slice(0, 3).map((s, i) => <RankedRow key={s.id} s={s} i={i} take={t.key} />)}</div></div>)}</section>
    </main>
  );
}
