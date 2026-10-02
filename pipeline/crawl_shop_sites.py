#!/usr/bin/env python3
"""Crawl each shop's own website (not Facebook/Instagram/Telegram) for (a) per-gram prices, (b) doctor/prescription
mentions and fee, (c) lounge/delivery/payment/language mentions. Adds price_points (source = shop site, dated today)
and feature evidence with src='website'. Skips shops already crawled today unless --force.

Usage: python3 pipeline/crawl_shop_sites.py [--force] [--only N]
Output: updates data/phuket/shops.json; writes data/phuket/site_crawl.json with raw findings per shop.
"""
import json, re, sys, time, pathlib, argparse, urllib.request, urllib.parse, html as H
from concurrent.futures import ThreadPoolExecutor
ROOT = pathlib.Path(__file__).resolve().parent.parent; DATA = ROOT / "data" / "phuket"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36 BudMapBot/0.1 (+https://wthaimap.vercel.app/about/)"
SOCIAL = ("facebook.com", "instagram.com", "t.me", "line.me", "lin.ee", "wa.me", "tiktok.com", "linktr.ee", "google.com", "goo.gl", "maps.app")
MENU_WORDS = ("menu", "price", "strain", "product", "shop", "flower", "catalog", "store", "order", "weed", "cannabis", "about", "faq", "prescription", "doctor")

def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        ct = r.headers.get("Content-Type", "")
        if "html" not in ct and "text" not in ct: return None, r.geturl()
        return r.read(300000).decode("utf-8", "ignore"), r.geturl()

def text_of(h):
    h = re.sub(r"<script.*?</script>|<style.*?</style>|<noscript.*?</noscript>", " ", h, flags=re.S | re.I)
    t = H.unescape(re.sub(r"<[^>]+>", " ", h)); return re.sub(r"\s+", " ", t)

def links_of(h, base):
    out = []
    for m in re.finditer(r'href="([^"#]+)"', h):
        u = urllib.parse.urljoin(base, m.group(1))
        if urllib.parse.urlparse(u).netloc != urllib.parse.urlparse(base).netloc: continue
        if any(w in u.lower() for w in MENU_WORDS): out.append(u.split("?")[0])
    seen = set(); return [u for u in out if not (u in seen or seen.add(u))][:8]

PRICE_RX = re.compile(r"(?:(฿|THB|baht)\s*([0-9][0-9,\.]{1,6})|([0-9][0-9,\.]{1,6})\s*(฿|THB|baht))\s*(?:/|per|a|each)?\s*(g|gram|grams|gr|1g|3\.5g|oz|ounce|eighth|1/8)?", re.I)
DOC_RX = re.compile(r"(doctor|physician|practitioner|prescription|PT\.?\s?33|medical (?:certificate|consult)|consultation|telemed)[^.]{0,140}", re.I)
FEE_RX = re.compile(r"(?:prescription|consult(?:ation)?|doctor)[^.]{0,80}?(?:฿|THB|baht)\s?([0-9]{2,5})|(?:฿|THB|baht)\s?([0-9]{2,5})[^.]{0,60}?(?:prescription|consult|doctor)", re.I)
FEAT = {
    "lounge_smoking_area": r"\b(lounge|smoking (?:area|room)|smoke (?:here|inside|on site|on-site)|rooftop|chill(?:out)? (?:area|zone))\b",
    "delivery": r"\b(delivery|deliver to|we deliver)\b",
    "card_payment": r"\b(credit card|visa|mastercard|card payment|promptpay|crypto|usdt)\b",
    "russian_staff": r"(русск|по-русски|russian[- ]speaking|говорим)",
    "english_staff": r"\b(english[- ]speaking|english staff)\b",
    "edibles": r"\b(edible|gummies|brownie|cookies)\b",
    "games_ps5_netflix": r"\b(ps ?5|playstation|netflix|xbox|board games|pool table)\b",
}
STRAIN_CTX = re.compile(r"([A-Z][A-Za-z0-9'&\-]+(?:\s+[A-Z#][A-Za-z0-9'&\-]*){0,3})\s*(?:[-–:|]|\s)\s*(?:฿|THB)?\s*([0-9][0-9,]{2,5})\s*(?:฿|THB|baht)?\s*/?\s*(?:g|gram)\b")

def parse(txt, url):
    prices = []
    for m in STRAIN_CTX.finditer(txt):
        v = int(m.group(2).replace(",", ""))
        if 50 <= v <= 3000: prices.append({"source_url": url, "date": time.strftime("%Y-%m-%d"), "value_thb": v, "unit": "g", "strain_or_tier": m.group(1).strip()[:60], "note": "shop site, per gram (auto)"})
    if not prices:
        for m in PRICE_RX.finditer(txt):
            v = (m.group(2) or m.group(3) or "").replace(",", "")
            unit = (m.group(5) or "").lower()
            if not v or not unit: continue
            try: v = float(v)
            except: continue
            if unit in ("g", "gram", "grams", "gr", "1g") and 50 <= v <= 3000:
                ctx = txt[max(0, m.start() - 50):m.start()].strip()
                prices.append({"source_url": url, "date": time.strftime("%Y-%m-%d"), "value_thb": int(v), "unit": "g", "strain_or_tier": ctx[-40:], "note": "shop site, per gram (auto)"})
    doc = [m.group(0)[:160] for m in DOC_RX.finditer(txt)][:3]
    fee = None
    for m in FEE_RX.finditer(txt):
        f = int(m.group(1) or m.group(2));
        if 50 <= f <= 5000: fee = f; break
    feats = {}
    for k, rx in FEAT.items():
        m = re.search(rx, txt, re.I)
        if m: feats[k] = txt[max(0, m.start() - 60):m.end() + 60]
    return prices, doc, fee, feats

def crawl(shop):
    url = shop.get("website") or ""
    if not url or any(s in url for s in SOCIAL): return None
    out = {"id": shop["id"], "site": url, "pages": [], "prices": [], "doctor": [], "doctor_fee": None, "features": {}, "error": None}
    try:
        h, final = fetch(url)
        if not h: return out
        pages = [final] + links_of(h, final)
        seen = set()
        for p in pages[:6]:
            if p in seen: continue
            seen.add(p)
            try:
                hh = h if p == final else fetch(p)[0]
                if not hh: continue
            except Exception: continue
            txt = text_of(hh)
            prices, doc, fee, feats = parse(txt, p)
            out["pages"].append(p); out["prices"] += prices; out["doctor"] += doc
            if fee and not out["doctor_fee"]: out["doctor_fee"] = fee
            for k, v in feats.items(): out["features"].setdefault(k, v)
    except Exception as e:
        out["error"] = str(e)[:120]
    # dedupe prices by (strain, value)
    seen = set(); out["prices"] = [p for p in out["prices"] if not ((p["strain_or_tier"].lower(), p["value_thb"]) in seen or seen.add((p["strain_or_tier"].lower(), p["value_thb"])))][:40]
    out["doctor"] = list(dict.fromkeys(out["doctor"]))[:3]
    return out

NEG = re.compile(r"\b(don'?t|do not|no |not |without|coming soon)\b", re.I)
DOC_OK = re.compile(r"(prescription|practitioner|doctor|consult)[^.]{0,80}(on[- ]site|available|in[- ]store|in the shop|issue|provide|free|฿|THB|baht|minutes)|(on[- ]site|in[- ]store|free)[^.]{0,60}(prescription|practitioner|doctor|consult)", re.I)
def clean_price(p):
    t = (p.get("strain_or_tier") or "").strip()
    if len(t) < 4 or t.lower() in ("from",) or re.search(r"\b(from|starts? at|ranges?|typically|add to cart|quantity|under|in thai baht)\b", t, re.I): return False
    if re.search(r"\b(hour|delivery|prices?)\b", t, re.I): return False
    return 50 <= p["value_thb"] <= 2000
KEEP_FEATS = ("lounge_smoking_area", "edibles", "card_payment", "games_ps5_netflix")

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--force", action="store_true"); ap.add_argument("--only", type=int, default=0); ap.add_argument("--merge-only", action="store_true"); a = ap.parse_args()
    shops = json.load(open(DATA / "shops.json"))
    todo = [s for s in shops if s.get("website") and not any(x in s["website"] for x in SOCIAL)]
    if a.only: todo = todo[: a.only]
    if a.merge_only:
        results = json.load(open(DATA / "site_crawl.json"))
    else:
        print(len(todo), "shop sites to crawl")
        with ThreadPoolExecutor(8) as ex: results = [r for r in ex.map(crawl, todo) if r]
        json.dump(results, open(DATA / "site_crawl.json", "w"), ensure_ascii=False, indent=0)
    # strict filters before merging: auto-extraction is noisy
    for r in results:
        r["prices"] = [p for p in r["prices"] if clean_price(p)]
        r["doctor"] = [d for d in r["doctor"] if DOC_OK.search(d) and not NEG.search(d)]
        r["features"] = {k: v for k, v in r["features"].items() if k in KEEP_FEATS and not NEG.search(v)}
    by = {r["id"]: r for r in results}; np = nd = nf = 0
    for s in shops:
        r = by.get(s["id"]);
        if not r: continue
        if r["prices"]:
            old = [p for p in (s.get("price_points") or []) if "(auto)" not in (p.get("note") or "")]
            s["price_points"] = old + r["prices"]; np += 1
        f = s.setdefault("features", {})
        if r["doctor"]:
            d = f.setdefault("doctor_prescription", {"value": False, "evidence": []}); d["value"] = True
            d["evidence"] = [e for e in d["evidence"] if e.get("src") != "website"] + [{"src": "website", "snippet": x, "url": r["site"]} for x in r["doctor"][:2]]
            if r["doctor_fee"]: d["fee_thb"] = r["doctor_fee"]
            nd += 1
        for k, snip in r["features"].items():
            d = f.setdefault(k, {"value": False, "evidence": []}); d["value"] = True
            d["evidence"] = [e for e in d["evidence"] if e.get("src") != "website"] + [{"src": "website", "snippet": snip, "url": r["site"]}]; nf += 1
    json.dump(shops, open(DATA / "shops.json", "w"), ensure_ascii=False)
    print(f"sites {len(results)}, with prices {np}, with doctor mention {nd}, feature evidences {nf}, errors {sum(1 for r in results if r['error'])}")

if __name__ == "__main__": main()
