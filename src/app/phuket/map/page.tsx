import type { Metadata } from "next";
import Link from "next/link";
import MapLoader from "@/components/MapLoader";
import { AREAS, SNAPSHOT, TAKES, TakeKey, ranked, stats } from "@/lib/data";
import { meta } from "@/lib/seo";
import { RankedRow } from "@/components/RankedRow";

export const metadata: Metadata = meta("/phuket/map/", {
  title: "Phuket weed map: dispensaries near me, ranked by reviews",
  description: "Interactive map of 189 Phuket dispensaries ranked by what reviewers say: best flower, cheapest, best vibe, first-timer friendly, most trusted. Use your location, filter by area, lounge, 24h or doctor on site.",
});

export default function Page() {
  const take: TakeKey = "overall";
  const T = TAKES.find((t) => t.key === take)!;
  const s = stats();
  const top = ranked(take).slice(0, 20);
  return (
    <>
      <MapLoader />
      <section className="wrap page" id="list">
        <span className="eyebrow">Phuket · map · {SNAPSHOT}</span>
        <h1 style={{ fontSize: 26 }}>Dispensaries near me in Phuket, ranked by {T.label.toLowerCase()}</h1>
        <p className="lead" style={{ fontSize: 15 }}>The map above sorts {s.shops} licensed shops by distance from you and by what reviewers say. Google shows almost all of them at 4.9–5.0, so the star average cannot separate them; we read {s.texts.toLocaleString("en-US")} review texts in five languages and score the flower, the prices, the vibe, how first-timers are treated and how trustworthy the ratings look. Tap ⌖ to use your location or pick a landmark such as Bangla Road or Kata Beach; tap a marker for the evidence behind its score. Shops with fewer than five review texts are drawn hollow and ranked only when you ask.</p>
        <h2 style={{ marginTop: 18 }}>Top 20 right now: {T.label}</h2>
        <div className="rows" style={{ marginTop: 8 }}>{top.map((sh, i) => <RankedRow key={sh.id} s={sh} i={i} take={take} />)}</div>
        <div className="chips" style={{ marginTop: 14 }}>
          {TAKES.map((t) => <Link key={t.key} className="chip" href={t.key === "overall" ? "/phuket/best/" : `/phuket/best/${t.key}/`}>{t.label}</Link>)}
          {AREAS.filter((a) => a.key !== "Other").map((a) => <Link key={a.slug} className="chip" href={`/phuket/areas/${a.slug}/`}>{a.label}</Link>)}
        </div>
        <p className="note" style={{ marginTop: 14 }}>Looking for delivery? Delivery of flower is not permitted under Thailand's 2025 rules and we do not list it. Looking for the law? <Link href="/thailand/is-weed-legal/">Is weed legal in Thailand in 2026</Link> and the <Link href="/phuket/first-time/">first-time guide</Link>.</p>
      </section>
    </>
  );
}
