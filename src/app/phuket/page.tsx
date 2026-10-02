import type { Metadata } from "next";
import { meta } from "@/lib/seo";
import Link from "next/link";
import { AREAS, SNAPSHOT, TAKES, ranked, stats } from "@/lib/data";
import { RankedRow } from "@/components/RankedRow";

export const metadata: Metadata = meta("/phuket/", {
  title: "Phuket cannabis guide: shops, prices, areas",
  description: "Independent guide to Phuket dispensaries: 189 shops scored from reviews in five languages, prices, areas from Patong to Rawai, and how buying works in practice.",
});

export default function Page() {
  const s = stats();
  return (
    <main className="wrap page">
      <span className="eyebrow">Phuket edition · snapshot {SNAPSHOT}</span>
      <h1>Phuket cannabis guide</h1>
      <p className="lead">{s.shops} shops from Patong to Rawai, scored from {s.texts.toLocaleString("en-US")} reviews. Start with the map, a ranking, or your area.</p>
      <div className="cta-row"><Link href="/phuket/map/" className="btn primary">Map near me</Link><Link href="/phuket/first-time/" className="btn">First time? Read this</Link></div>
      <section className="sec"><h2>Rankings</h2><div className="chips" style={{ marginTop: 10 }}>{TAKES.map((t) => <Link key={t.key} className="chip" href={`/phuket/best/${t.key === "overall" ? "" : t.key + "/"}`}>{t.label}</Link>)}</div></section>
      <section className="sec"><h2>Areas</h2><div className="grid3" style={{ marginTop: 10 }}>{AREAS.map((a) => { const top = ranked("overall").filter((x) => x.area === a.key).slice(0, 3); return (<div className="card" key={a.slug}><h3><Link href={`/phuket/areas/${a.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>{a.label}</Link></h3><p style={{ margin: "6px 0 8px", fontSize: 13.5, color: "var(--muted)" }}>{a.blurb}</p><div className="rows">{top.map((sh, i) => <RankedRow key={sh.id} s={sh} i={i} take="overall" />)}</div></div>); })}</div></section>
    </main>
  );
}
