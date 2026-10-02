import Link from "next/link";
import { SNAPSHOT, stats } from "@/lib/data";

export default function SiteFooter() {
  const s = stats();
  return (
    <footer className="site-footer">
      <div className="wrap cols">
        <div>
          <h4>BudMap</h4>
          <p>An independent guide for travellers. Nobody pays to be listed or ranked. Scores come from what reviewers say, not from who advertises.</p>
          <p>Data snapshot {SNAPSHOT}: {s.shops} shops, {s.texts.toLocaleString("en-US")} review texts, {s.reddit} Reddit mentions.</p>
        </div>
        <div>
          <h4>Phuket</h4>
          <ul>
            <li><Link href="/phuket/map/">Map near me</Link></li>
            <li><Link href="/phuket/best/">Best dispensaries</Link></li>
            <li><Link href="/phuket/areas/">Areas</Link></li>
            <li><Link href="/phuket/prices/">Prices</Link></li>
            <li><Link href="/phuket/lounges/">Lounges &amp; cafés</Link></li>
            <li><Link href="/phuket/strains/">Strains on menus</Link></li>
            <li><Link href="/phuket/mushrooms/">Mushrooms: law &amp; risks</Link></li>
            <li><Link href="/phuket/first-time/">First time in Thailand</Link></li>
            <li><Link href="/phuket/what-to-buy/">What to buy, how much, where (2-minute quiz)</Link></li>
            <li><Link href="/thailand/is-weed-legal/">Is weed legal in Thailand?</Link></li>
          </ul>
        </div>
        <div>
          <h4>About</h4>
          <ul>
            <li><Link href="/how-we-score/">How we score</Link></li>
            <li><Link href="/about/">About BudMap</Link></li>
            <li><Link href="/for-shops/">For shops: fix your listing</Link></li>
            {process.env.NEXT_PUBLIC_CONTACT_EMAIL && <li>Contact: {process.env.NEXT_PUBLIC_CONTACT_EMAIL}</li>}
          </ul>
          <p style={{ marginTop: 10 }}>Map data © OpenStreetMap contributors. Review excerpts belong to their authors; we quote them to explain a score. Adults 20+ only. Cannabis flower is sold in Thailand for medical use on a Thai prescription; this site informs, it does not sell.</p>
        </div>
      </div>
    </footer>
  );
}
