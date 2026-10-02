import type { Metadata } from "next";
import { meta, breadcrumbs, Ld, SITE } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AREAS, LANG, SHOPS, SHOP_BY_SLUG, SNAPSHOT, TAKES, indexable, isThin, km, fmtKm, ranked } from "@/lib/data";
import { EvidenceSections, Practical, ScoreBars, Why } from "@/components/ShopEvidence";
import { RankedRow } from "@/components/RankedRow";
import PlacePhotos from "@/components/PlacePhotos";

export function generateStaticParams() { return SHOPS.map((s) => ({ slug: s.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const s = SHOP_BY_SLUG.get(slug); if (!s) return {};
  const c = s.cnt || {};
  return meta(`/phuket/shop/${s.slug}/`, {
    title: `${s.name}, ${s.area}: what reviewers really say`,
    description: `${s.name} in ${s.area}, Phuket. Overall ${s.scores.overall ?? "–"}/100 from ${s.n} review texts: ${c.quality_pos || 0} praise the flower, ${c.quality_neg || 0} complain; ${c.price_pos || 0} call prices fair. ${s.price_med ? `Published median ฿${Math.round(s.price_med)}/g.` : ""}`,
    index: indexable(s),
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const s = SHOP_BY_SLUG.get(slug); if (!s) notFound();
  const A = AREAS.find((a) => a.key === s.area);
  const rankIn = (key: typeof TAKES[number]["key"], pool = SHOPS) => { const r = ranked(key, pool); const i = r.findIndex((x) => x.id === s.id); return i >= 0 ? { pos: i + 1, of: r.length } : null; };
  const overallIsland = rankIn("overall"); const overallArea = rankIn("overall", SHOPS.filter((x) => x.area === s.area));
  const nearby = SHOPS.filter((x) => x.id !== s.id && !isThin(x)).map((x) => ({ x, d: km(s, x) })).sort((a, b) => a.d - b.d).slice(0, 5);
  const ld = {
    "@context": "https://schema.org", "@type": "Store", name: s.name, address: s.address || undefined, telephone: s.phone || undefined, url: s.web || undefined,
    geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng },
    ...(s.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: s.rating, reviewCount: s.count, description: "Google rating as observed; BudMap scores are separate" } } : {}),
  };
  return (
    <main className="wrap page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Ld data={breadcrumbs([{ name: "BudMap", path: "/" }, { name: "Phuket", path: "/phuket/" }, { name: A?.label || s.area, path: `/phuket/areas/${A?.slug}/` }, { name: s.name, path: `/phuket/shop/${s.slug}/` }])} />
      <span className="eyebrow"><Link href="/phuket/">Phuket</Link> · <Link href={`/phuket/areas/${A?.slug}/`}>{A?.label}</Link> · snapshot {SNAPSHOT}</span>
      <h1>{s.name}</h1>
      <p className="lead">{s.area}, Phuket · {s.rating ? `★${s.rating} from ${s.count.toLocaleString("en-US")} Google reviews` : "no Google rating"} · we read {s.n} review texts ({(s.langs || []).map((l) => LANG[l] || l).join(", ")}){isThin(s) ? " · thin data: treat scores as provisional" : ""}</p>
      {overallIsland && <div className="stat-row" style={{ margin: "6px 0 14px" }}><span><b>#{overallIsland.pos}</b>of {overallIsland.of} on Phuket (overall)</span>{overallArea && <span><b>#{overallArea.pos}</b>of {overallArea.of} in {s.area}</span>}<span><b>{Math.round((s.scores.conf || 0) * 100)}%</b>confidence</span></div>}
      <PlacePhotos placeId={s.id} />
      <div className="grid2">
        <div className="card"><h3>Scores</h3><div style={{ marginTop: 10 }}><ScoreBars s={s} linkTakes /></div><p style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 0" }}>0–100. Built from review text, published prices and trust signals, not from the star average. <Link href="/how-we-score/">How we score.</Link></p></div>
        <div className="card"><h3>Why</h3><div style={{ marginTop: 8 }}><Why s={s} /></div></div>
      </div>
      <div className="card" style={{ marginTop: 14 }}><EvidenceSections s={s} /></div>
      <section className="sec grid2">
        <div className="card"><h3>Practical</h3><div style={{ marginTop: 8 }}><Practical s={s} /></div><p style={{ marginTop: 10, marginBottom: 0 }}><Link href={`/phuket/map/?area=${encodeURIComponent(s.area)}`} className="btn">Open on the map</Link></p></div>
        <div className="card"><h3>Nearby, with enough reviews to score</h3><div className="rows" style={{ marginTop: 8 }}>{nearby.map(({ x, d }, i) => <RankedRow key={x.id} s={x} i={i} take="overall" dist={fmtKm(d)} />)}</div></div>
      </section>
      {(s.scores.overall ?? 0) >= 60 && !isThin(s) && (
        <section className="card" style={{ marginTop: 18 }}>
          <h3>Show this score on your site</h3>
          <p style={{ fontSize: 14, margin: "6px 0 8px" }}>This shop scores {s.scores.overall}/100 overall{overallArea ? `, #${overallArea.pos} in ${s.area}` : ""}. Shops may quote the score with a link to this page; the link is what lets readers check the evidence behind it. Copy the snippet:</p>
          <pre style={{ fontSize: 12, whiteSpace: "pre-wrap", background: "var(--bg)", padding: 10, borderRadius: 8, margin: 0 }}>{`<a href="${SITE}/phuket/shop/${s.slug}/">BudMap score ${s.scores.overall}/100 — ${s.name}, independently rated from ${s.n} reviews</a>`}</pre>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 0" }}>Scores change with each review snapshot; the page is the source of truth. Placement cannot be bought.</p>
        </section>
      )}
      <p className="note" style={{ marginTop: 18 }}>Own or run this shop? Hours, prices or menu wrong? <Link href="/for-shops/">Send a correction</Link>. We do not sell placement and we do not change scores by request; we fix facts.</p>
    </main>
  );
}
