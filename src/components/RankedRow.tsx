import Link from "next/link";
import { Shop, TakeKey, isThin, scoreColor } from "@/lib/data";

export function RankedRow({ s, i, take, dist }: { s: Shop; i: number; take: TakeKey; dist?: string }) {
  const v = s.scores[take];
  const thin = isThin(s);
  const sub = [s.area, s.rating ? `★${s.rating} · ${s.count.toLocaleString("en-US")} Google reviews` : "no Google rating", s.price_med ? `฿${Math.round(s.price_med)}/g published` : null].filter(Boolean).join(" · ");
  return (
    <Link href={`/phuket/shop/${s.slug}/`} className="row">
      <div className="score" style={{ color: scoreColor(v, thin) }}>{v == null ? "–" : v}<small>{thin ? "thin" : "score"}</small></div>
      <div><div className="nm">{i + 1}. {s.name}</div><div className="sub">{sub}</div></div>
      <div className="right">{dist && <b>{dist}</b>}{s.n} texts</div>
    </Link>
  );
}
