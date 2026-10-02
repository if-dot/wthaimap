"use client";
import { useEffect, useState } from "react";

const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
const KINDS = ["Hours or open/closed status", "Address, phone or website", "A published price or menu (attach a dated photo)", "Practitioner on site: hours and fee", "A quote that is not about this shop", "Lab results (COA) to link", "Something else"];

export default function CorrectionForm({ shop }: { shop?: string }) {
  const [f, setF] = useState({ shop: shop || "", kind: KINDS[0], wrong: "", right: "", proof: "", who: "", email: "" });
  const [copied, setCopied] = useState(false);
  useEffect(() => { try { const q = new URLSearchParams(window.location.search).get("shop"); if (q && !shop) setF((x) => ({ ...x, shop: q })); } catch {} }, [shop]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const body = `Shop: ${f.shop}\nWhat: ${f.kind}\nWhat is wrong now: ${f.wrong}\nCorrect value: ${f.right}\nEvidence (photo link, URL): ${f.proof}\nI am: ${f.who}\nReply to: ${f.email}`;
  const subject = `BudMap correction: ${f.shop || "shop"}`;
  const href = EMAIL ? `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : "";
  const ready = f.shop && f.wrong && f.right;
  return (
    <form className="card" style={{ marginTop: 14, display: "grid", gap: 10 }} onSubmit={(e) => e.preventDefault()}>
      <label>Shop name and area<input value={f.shop} onChange={set("shop")} placeholder="e.g. Green Garden, Kata" required /></label>
      <label>What needs fixing<select value={f.kind} onChange={set("kind")}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></label>
      <label>What the page says now<textarea value={f.wrong} onChange={set("wrong")} rows={2} placeholder="Copy the wrong line from the page" required /></label>
      <label>What is correct<textarea value={f.right} onChange={set("right")} rows={3} placeholder="The correct hours / price / fact, with the date it applies from" required /></label>
      <label>Evidence<input value={f.proof} onChange={set("proof")} placeholder="Link to a dated photo of the menu or board, your website, or the licence" /></label>
      <label>You are<input value={f.who} onChange={set("who")} placeholder="owner / manager / customer" /></label>
      <label>Reply-to email<input value={f.email} onChange={set("email")} type="email" placeholder="optional" /></label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {href ? <a className="btn primary" aria-disabled={!ready} href={ready ? href : undefined}>Send by email</a> : null}
        <button type="button" className="btn" disabled={!ready} onClick={() => { navigator.clipboard?.writeText(`${subject}\n\n${body}`).then(() => setCopied(true)).catch(() => {}); }}>{copied ? "Copied" : "Copy the text"}</button>
        <span className="note" style={{ fontSize: 12 }}>{EMAIL ? `Opens your mail app with the text filled in, addressed to ${EMAIL}.` : "Copy the text and send it to the address in the footer."}</span>
      </div>
    </form>
  );
}
