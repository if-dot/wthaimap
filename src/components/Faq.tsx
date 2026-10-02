export type QA = { q: string; a: string };
export default function Faq({ items, title = "Questions people ask" }: { items: QA[]; title?: string }) {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })) };
  return (
    <section className="sec">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h2>{title}</h2>
      <div className="stack" style={{ marginTop: 10 }}>
        {items.map((i) => (
          <details key={i.q} className="card" style={{ padding: "10px 16px" }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>{i.q}</summary>
            <p style={{ margin: "8px 0 0", fontSize: 14 }}>{i.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
