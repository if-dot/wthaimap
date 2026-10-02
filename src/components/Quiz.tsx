"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

export type QuizShop = { slug: string; name: string; area: string; overall: number | null; quality: number | null; price: number | null; atmosphere: number | null; beginner: number | null; trust: number | null; n: number; price_med: number | null; lounge: boolean; doctor: boolean; late: boolean };

const AREAS = ["Patong", "Kata", "Karon", "Kamala", "Bang Tao", "Rawai", "Old Town", "Other"];
type Exp = "never" | "rarely" | "regular";
type Want = "relax" | "social" | "sleep" | "try";
type Pri = "quality" | "price" | "atmosphere" | "beginner";

const DOSE: Record<Exp, { amount: string; why: string }> = {
  never: { amount: "0.2–0.3 g in a joint, or a quarter of a gummy", why: "Thai indoor flower is routinely 20%+ THC. The most common bad first night in Phuket reviews and on Reddit is a full-gram joint. Ask for a single pre-roll and smoke a third of it, then wait twenty minutes." },
  rarely: { amount: "0.3–0.5 g, one small joint, not a whole gram", why: "Tolerance resets. What was fine ten years ago on European hash will hit harder with fresh indoor flower; go in halves." },
  regular: { amount: "whatever you usually smoke, minus a third the first night", why: "Potency labels in Phuket are the shop's word (there are no public lab results), so treat the first jar as unknown until you have tried it." },
};
const FORM: Record<Want, { pick: string; avoid: string }> = {
  relax: { pick: "an indica-leaning Thai indoor or greenhouse jar in the ฿250–450 band", avoid: "anything sold as “Cali” or “exotic” at ฿700+; reviewers say it is often the same flower in imported packaging." },
  social: { pick: "a sativa or hybrid in the standard band, bought in a shop with a lounge so you have somewhere legal to smoke it", avoid: "edibles before a night out: they take two hours and are inconsistently dosed here." },
  sleep: { pick: "a heavy indica or a low-dose gummy (5 mg) taken two hours before bed", avoid: "strong sativas and anything with a card-fee surprise at the till; you want a quiet shop, not Bangla Road." },
  try: { pick: "the cheapest honest jar: Thai outdoor or greenhouse at ฿100–200 per gram from a shop reviewers call fair", avoid: "paying top-shelf money to find out whether you like it at all." },
};

export default function Quiz({ shops }: { shops: QuizShop[] }) {
  const [exp, setExp] = useState<Exp | null>(null);
  const [want, setWant] = useState<Want | null>(null);
  const [area, setArea] = useState<string>("");
  const [pri, setPri] = useState<Pri | null>(null);
  const done = exp && want && pri;
  const picks = useMemo(() => {
    if (!done) return [];
    const pool = shops.filter((s) => s.n >= 8 && (!area || s.area === area));
    const key: Pri = exp === "never" ? "beginner" : pri;
    const score = (s: QuizShop) => {
      const base = (s[key] ?? 0) + 0.35 * (s.trust ?? 0) + 0.25 * (s.overall ?? 0);
      const bonus = (want === "social" && s.lounge ? 8 : 0) + (exp === "never" && s.doctor ? 4 : 0) + (want === "try" && s.price_med && s.price_med <= 300 ? 6 : 0) + (want === "sleep" && s.area === "Patong" ? -6 : 0);
      return base + bonus;
    };
    return pool.sort((a, b) => score(b) - score(a)).slice(0, 3);
  }, [done, shops, area, exp, want, pri]);

  const Opt = <T extends string>({ v, cur, set, label }: { v: T; cur: T | null | string; set: (x: T) => void; label: string }) => (
    <button type="button" className="chip" aria-pressed={cur === v} onClick={() => set(v)} style={cur === v ? { background: "var(--accent)", color: "var(--accent-ink)", borderColor: "transparent" } : undefined}>{label}</button>
  );

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <h3>1. How much have you smoked before?</h3>
      <div className="chips" style={{ marginTop: 8 }}>
        <Opt v="never" cur={exp} set={setExp} label="Never, or once" /><Opt v="rarely" cur={exp} set={setExp} label="Years ago / rarely" /><Opt v="regular" cur={exp} set={setExp} label="Regularly" />
      </div>
      <h3 style={{ marginTop: 16 }}>2. What do you want from it?</h3>
      <div className="chips" style={{ marginTop: 8 }}>
        <Opt v="relax" cur={want} set={setWant} label="Relax on the balcony" /><Opt v="social" cur={want} set={setWant} label="A fun night out" /><Opt v="sleep" cur={want} set={setWant} label="Sleep / jet lag" /><Opt v="try" cur={want} set={setWant} label="Just curious, cheaply" />
      </div>
      <h3 style={{ marginTop: 16 }}>3. Where are you staying?</h3>
      <div className="chips" style={{ marginTop: 8 }}>
        <Opt v="" cur={area} set={setArea} label="Anywhere on Phuket" />{AREAS.map((a) => <Opt key={a} v={a} cur={area} set={setArea} label={a} />)}
      </div>
      <h3 style={{ marginTop: 16 }}>4. What matters most?</h3>
      <div className="chips" style={{ marginTop: 8 }}>
        <Opt v="quality" cur={pri} set={setPri} label="The flower itself" /><Opt v="price" cur={pri} set={setPri} label="Price" /><Opt v="atmosphere" cur={pri} set={setPri} label="Somewhere to sit and smoke" /><Opt v="beginner" cur={pri} set={setPri} label="Staff who explain" />
      </div>

      {done && (
        <div style={{ marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          <h3>How much to take</h3>
          <p style={{ margin: "6px 0 0" }}><b>{DOSE[exp].amount}.</b> {DOSE[exp].why}</p>
          <h3 style={{ marginTop: 14 }}>What to ask for</h3>
          <p style={{ margin: "6px 0 0" }}>Ask for <b>{FORM[want].pick}</b>. Avoid {FORM[want].avoid} Smell the jar before paying: fresh flower smells strong and feels slightly sticky; dry, brown or scentless flower is the number-one complaint in Phuket reviews.</p>
          <h3 style={{ marginTop: 14 }}>Three shops that fit{area ? ` in ${area}` : ""}</h3>
          {picks.length === 0 && <p style={{ margin: "6px 0 0" }}>Not enough reviewed shops in that area yet; try “Anywhere on Phuket”.</p>}
          <div className="rows" style={{ marginTop: 8 }}>
            {picks.map((s, i) => (
              <Link key={s.slug} href={`/phuket/shop/${s.slug}/`} className="row">
                <div className="score">{s[exp === "never" ? "beginner" : pri] ?? "–"}<small>{exp === "never" ? "first time" : pri}</small></div>
                <div><div className="nm">{i + 1}. {s.name}</div><div className="sub">{[s.area, s.price_med ? `฿${Math.round(s.price_med)}/g published` : null, s.lounge ? "lounge" : null, s.doctor ? "practitioner on site" : null, s.late ? "open late" : null].filter(Boolean).join(" · ")}</div></div>
                <div className="right">{s.n} texts</div>
              </Link>
            ))}
          </div>
          <p className="note" style={{ marginTop: 10 }}>Picked by the score that matches your answers, weighted by Trust and overall; every score opens to the reviews behind it. Not medical advice. Smoke indoors or in a lounge, not on the street, and leave everything behind when you fly.</p>
        </div>
      )}
    </div>
  );
}
