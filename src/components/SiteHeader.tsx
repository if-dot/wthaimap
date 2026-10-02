import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand"><span className="dot" aria-hidden="true"></span>BudMap <span className="ed">Phuket</span></Link>
        <nav className="nav" aria-label="Main">
          <Link href="/phuket/best/">Best of</Link>
          <Link href="/phuket/areas/">Areas</Link>
          <Link href="/phuket/prices/">Prices</Link>
          <Link href="/phuket/first-time/">First time</Link>
          <Link href="/how-we-score/">How we score</Link>
          <Link href="/phuket/map/" className="cta">Map near me</Link>
        </nav>
      </div>
    </header>
  );
}
