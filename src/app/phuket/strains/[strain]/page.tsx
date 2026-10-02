import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SNAPSHOT, strainIndex } from "@/lib/data";

const multi = () => strainIndex().filter((x) => x.entries.length > 1);
export function generateStaticParams() { return multi().map((x) => ({ strain: x.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ strain: string }> }): Promise<Metadata> {
  const { strain } = await params; const x = multi().find((s) => s.slug === strain); if (!x) return {};
  return { title: `${x.name} in Phuket: where to buy and price per gram`, description: `${x.name} is on ${x.entries.length} published Phuket menus, from ฿${x.entries[0].price}/g. Shops, prices, dates and what reviewers say about each.` };
}
export default async function Page({ params }: { params: Promise<{ strain: string }> }) {
  const { strain } = await params; const x = multi().find((s) => s.slug === strain); if (!x) notFound();
  return (
    <main className="wrap page">
      <span className="eyebrow"><Link href="/phuket/strains/">Strains</Link> · {SNAPSHOT}</span>
      <h1>{x.name} in Phuket</h1>
      <p className="lead">On {x.entries.length} published menus, from ฿{x.entries[0].price} to ฿{x.entries[x.entries.length - 1].price} per gram. Same name does not mean same jar: check each shop's Flower score before you choose by price.</p>
      <div className="tblwrap"><table className="tbl"><thead><tr><th>Shop</th><th>Area</th><th>฿/g</th><th>Flower score</th><th>Source · date</th></tr></thead><tbody>
        {x.entries.map((e) => <tr key={e.shop.id}><td><Link href={`/phuket/shop/${e.shop.slug}/`}>{e.shop.name}</Link></td><td>{e.shop.area}</td><td className="tnum">฿{e.price}</td><td className="tnum">{e.shop.scores.quality ?? "–"}</td><td>{e.url ? <a href={e.url} target="_blank" rel="noopener">menu</a> : "menu"}{e.date ? ` · ${e.date}` : ""}</td></tr>)}
      </tbody></table></div>
      <p style={{ marginTop: 14 }}><Link href="/phuket/strains/">All strains on Phuket menus →</Link></p>
    </main>
  );
}
