import Link from "next/link";
import { FEATS, LANG, Shop, TAKES, TakeKey, scoreColor, trustFlags, whyLines } from "@/lib/data";

function Quotes({ s, k, cls, max = 2 }: { s: Shop; k: string; cls?: string; max?: number }) {
  const ev = (s.ev?.[k] || []).slice(0, max);
  if (!ev.length) return null;
  return (
    <>
      {ev.map((e, i) => (
        <div className={`q ${cls || ""}`} key={k + i}>
          {e.text}
          <span className="m">
            {LANG[e.lang || ""] || "?"} · {e.date || ""} {e.stars ? `· ★${e.stars}` : ""}
          </span>
        </div>
      ))}
    </>
  );
}

export function ScoreBars({ s, linkTakes }: { s: Shop; linkTakes?: boolean }) {
  return (
    <div className="bars">
      {TAKES.map((t) => {
        const v = s.scores[t.key];
        const label = linkTakes ? <Link href={`/phuket/best/${t.key === "overall" ? "" : t.key + "/"}`}>{t.label}</Link> : t.label;
        return (
          <span key={t.key} style={{ display: "contents" }}>
            <span>{label}</span>
            <div className="bar"><i style={{ width: `${v || 0}%`, background: scoreColor(v) }}></i></div>
            <span className="v">{v == null ? "–" : v}</span>
          </span>
        );
      })}
    </div>
  );
}

export function Why({ s }: { s: Shop }) {
  const lines = whyLines(s);
  const labels: Record<TakeKey, string> = { overall: "Overall", quality: "Flower", price: "Price", atmosphere: "Vibe", beginner: "First time", trust: "Trust" };
  return (
    <>
      {lines.map((l) => (
        <p className="why" key={l.k}>
          <b>{labels[l.k]}.</b> {l.text}
        </p>
      ))}
      <div>
        {trustFlags(s).map((f, i) => (
          <span className={`flag ${f.kind}`} key={i}>{f.text}</span>
        ))}
      </div>
    </>
  );
}

export function EvidenceSections({ s, compact }: { s: Shop; compact?: boolean }) {
  const prices = (s.price_src || []).filter((p) => p.v);
  const feats = FEATS;
  return (
    <>
      <div className="dsec">
        <h3>What reviewers say about the flower</h3>
        <Quotes s={s} k="quality_pos" cls="pos" max={compact ? 2 : 3} />
        <Quotes s={s} k="quality_neg" cls="neg" max={2} />
        {!(s.ev?.quality_pos?.length || s.ev?.quality_neg?.length) && <div className="q">No product-specific comments in our sample.</div>}
      </div>
      <div className="dsec">
        <h3>Price</h3>
        <Quotes s={s} k="price_pos" cls="pos" />
        <Quotes s={s} k="price_neg" cls="neg" />
        {prices.length > 0 && (
          <>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>Published prices</div>
            {prices.slice(0, compact ? 4 : 10).map((p, i) => (
              <div className="q" key={i}>
                ฿{p.v}/g {p.s ? `· ${String(p.s).slice(0, 70)}` : ""}
                <span className="m">
                  {p.d || ""} · {p.u ? <a href={p.u} target="_blank" rel="noopener">source</a> : "source n/a"}
                </span>
              </div>
            ))}
          </>
        )}
        {!prices.length && !(s.ev?.price_pos?.length || s.ev?.price_neg?.length) && <div className="q">No price information in our sample.</div>}
      </div>
      <div className="dsec">
        <h3>Vibe &amp; staff</h3>
        <Quotes s={s} k="atmosphere" />
        <Quotes s={s} k="beginner" cls="pos" />
        <Quotes s={s} k="staff_pos" max={1} />
        <Quotes s={s} k="staff_neg" cls="neg" />
        <Quotes s={s} k="trust_neg" cls="neg" />
      </div>
      <div className="dsec">
        <h3>Features mentioned</h3>
        {feats.map((f) => (
          <span className={`pill ${s.feat?.[f.key] ? "on" : ""}`} key={f.key}>{f.label}</span>
        ))}
        {s.feat?.doctor_prescription && s.feat_ev?.doctor_prescription?.[0] && <div className="q">{s.feat_ev.doctor_prescription[0]}</div>}
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Features come from review text, names and hours. “Not mentioned” does not mean “not available”.</div>
      </div>
      {s.reddit?.n > 0 && (
        <div className="dsec">
          <h3>Reddit</h3>
          {(s.reddit.ex || []).slice(0, compact ? 2 : 3).map((e, i) => (
            <div className="q" key={i}>
              {e.text}
              <span className="m">
                {e.date || ""} · score {e.score} · <a href={e.url} target="_blank" rel="noopener">thread</a>
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function Practical({ s }: { s: Shop }) {
  const host = s.web ? s.web.replace(/^https?:\/\//, "").split("/")[0] : null;
  return (
    <div className="kv">
      <span>Address</span><span>{s.address || "n/a"}</span>
      <span>Hours</span><span>{(s.hours || []).length ? (s.hours || []).map((h, i) => <span key={i}>{h}<br /></span>) : "n/a"}</span>
      <span>Phone</span><span>{s.phone || "n/a"}</span>
      <span>Web</span><span>{s.web ? <a href={s.web} target="_blank" rel="noopener">{host}</a> : "n/a"}</span>
      <span>Map</span><span><a href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`} target="_blank" rel="noopener">Open in Google Maps</a></span>
    </div>
  );
}
