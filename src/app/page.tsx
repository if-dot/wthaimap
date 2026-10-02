import Link from "next/link";
import type { Metadata } from "next";
import { meta } from "@/lib/seo";
import { AREAS, SNAPSHOT, TAKES, ranked, stats } from "@/lib/data";
import { RankedRow } from "@/components/RankedRow";

export const metadata: Metadata = meta("/", { title: "BudMap — where the good weed actually is (Phuket)", description: "Independent guide to Phuket dispensaries. 189 shops scored from 4,982 reviews in five languages: best flower, cheapest, best vibe, first-timer friendly, most trusted. No paid placements." });

export default function Home() {
  const s = stats();
  const top = ranked("overall").slice(0, 5);
  return (
    <main className="wrap">
      <section className="hero">
        <span className="eyebrow">Phuket · independent · updated {SNAPSHOT}</span>
        <h1>Where the good weed actually is.</h1>
        <p className="lead">Every shop in Phuket has five stars on Google. That tells you nothing. We read {s.texts.toLocaleString("en-US")} reviews in five languages, {s.reddit} Reddit threads and every published menu we could find, and scored {s.shops} shops on what people actually say about the flower, the prices, the vibe and the staff.</p>
        <div className="cta-row">
          <Link href="/phuket/map/" className="btn primary">Open the map near me</Link>
          <Link href="/phuket/best/" className="btn">Best dispensaries in Phuket</Link>
          <Link href="/phuket/first-time/" className="btn">First time in Thailand?</Link>
        </div>
        <div className="stat-row">
          <span><b>{s.shops}</b>shops mapped</span>
          <span><b>{s.texts.toLocaleString("en-US")}</b>review texts read</span>
          <span><b>5</b>languages (EN, RU, DE, FR, HE)</span>
          <span><b>{s.priced}</b>shops with published prices</span>
          <span><b>0</b>paid placements</span>
        </div>
      </section>

      <section className="sec">
        <h2>Pick what matters to you</h2>
        <div className="grid3" style={{ marginTop: 12 }}>
          {TAKES.map((t) => (
            <Link key={t.key} href={`/phuket/best/${t.key === "overall" ? "" : t.key + "/"}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
              <h3>{t.label}</h3>
              <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: 14 }}>{t.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="sec">
        <h2>Top five right now</h2>
        <p className="lead" style={{ fontSize: 15 }}>Best overall, across the island. Every score opens to the reviews behind it.</p>
        <div className="rows">{top.map((sh, i) => <RankedRow key={sh.id} s={sh} i={i} take="overall" />)}</div>
        <p style={{ marginTop: 10 }}><Link href="/phuket/best/">See all ranked shops →</Link></p>
      </section>

      <section className="sec">
        <h2>By area</h2>
        <div className="chips" style={{ marginTop: 10 }}>
          {AREAS.map((a) => <Link key={a.slug} href={`/phuket/areas/${a.slug}/`} className="chip">{a.label}</Link>)}
        </div>
      </section>

      <section className="sec grid2">
        <div className="card">
          <h3>How this works</h3>
          <p style={{ margin: "6px 0 0", fontSize: 14 }}>No shop pays to be here. We classify every review sentence by theme (flower, price, staff, vibe, trust) and show you the counts and the quotes. A 5.0 with 2,000 reviews and no mention of the product counts for less than 40 reviews that talk about fresh, sticky flower. <Link href="/how-we-score/">Read the method.</Link></p>
        </div>
        <div className="card">
          <h3>Thailand, October 2026, in one paragraph</h3>
          <p style={{ margin: "6px 0 0", fontSize: 14 }}>Cannabis flower is legal to buy for adults 20+ with a Thai prescription, and many shops have a practitioner at the counter who issues one in minutes for a small fee; on the islands, not all do. Smoking in public can be fined. Taking anything to the airport, even for a domestic flight, is where tourists get arrested. <Link href="/phuket/first-time/">The practical guide.</Link></p>
        </div>
      </section>
    </main>
  );
}
