import type { Metadata } from "next";
import Link from "next/link";
import { AREAS, SHOPS, ranked } from "@/lib/data";
import { RankedRow } from "@/components/RankedRow";

export const metadata: Metadata = { title: "Phuket dispensaries by area", description: "Patong, Kata, Karon, Kamala, Bang Tao, Rawai and Phuket Old Town: how many shops, who scores best, what reviewers say." };

export default function Page() {
  return (
    <main className="wrap page">
      <span className="eyebrow">Phuket · areas</span>
      <h1>Dispensaries by area</h1>
      <p className="lead">Phuket's shops cluster where tourists sleep. Patong alone has a third of them. Each area page ranks its shops and sums up what reviewers say.</p>
      <div className="grid2" style={{ marginTop: 16 }}>
        {AREAS.map((a) => {
          const all = SHOPS.filter((s) => s.area === a.key); const top = ranked("overall", all).slice(0, 3);
          return (
            <div className="card" key={a.slug}>
              <h3><Link href={`/phuket/areas/${a.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>{a.label}</Link> <span style={{ color: "var(--muted)", fontWeight: 500, fontSize: 13 }}>· {all.length} shops</span></h3>
              <p style={{ margin: "6px 0 8px", fontSize: 13.5, color: "var(--muted)" }}>{a.blurb}</p>
              <div className="rows">{top.map((sh, i) => <RankedRow key={sh.id} s={sh} i={i} take="overall" />)}</div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
