#!/usr/bin/env python3
"""Fold data/phuket/raw_reviews/*.json (full Apify pulls) into shops.json: replaces each shop's `reviews`
with the full, de-duplicated set (by text+date), keeps the Wanderlog sample if no full pull exists.
Then run pipeline/score.py."""
import json, pathlib, re
SUPPORTED = {"en", "ru", "de", "fr", "he"}
def detect(t):
    t = t or ""
    if re.search(r"[\u0400-\u04FF]", t): return "ru"
    if re.search(r"[\u0590-\u05FF]", t): return "he"
    if re.search(r"[\u0E00-\u0E7F]", t): return "th"
    if re.search(r"[\u4E00-\u9FFF]", t): return "zh"
    if re.search(r"[\u3040-\u30FF]", t): return "ja"
    if re.search(r"[\uAC00-\uD7AF]", t): return "ko"
    if re.search(r"[\u0600-\u06FF]", t): return "ar"
    w = set(re.findall(r"[a-zà-ÿ']+", t.lower()))
    sc = {"de": len(w & {"und","der","die","das","nicht","sehr","ist","mit","ich","wir","gut","auch","ein","eine","hier"}),
          "fr": len(w & {"et","le","la","les","très","est","pas","nous","une","des","pour","avec","bon","super","je"}),
          "es": len(w & {"muy","el","los","las","pero","bueno","buena","gracias","con","para","es","una","está"}),
          "it": len(w & {"molto","il","gli","che","ottimo","buono","anche","con","per","una","sono","grazie"}),
          "en": len(w & {"the","and","very","good","great","staff","with","was","they","this","you","for","place","friendly"})}
    best = max(sc, key=sc.get)
    return best if sc[best] >= 2 else "en"
ROOT = pathlib.Path(__file__).resolve().parent.parent; DATA = ROOT / "data" / "phuket"
shops = json.load(open(DATA / "shops.json")); n = 0
for s in shops:
    f = DATA / "raw_reviews" / f"{s['id']}.json"
    if not f.exists(): continue
    full = json.load(open(f))["reviews"]
    seen = set(); out = []
    for r in full + (s.get("reviews") or []):
        k = ((r.get("text") or "").strip()[:80], r.get("date"))
        if not r.get("text") or k in seen: continue
        seen.add(k)
        if not r.get("lang"): r["lang"] = detect(r["text"])
        # the lexicon covers EN/RU/DE/FR/HE; for other languages score Google's English translation, keep the original for display
        if r["lang"] not in SUPPORTED and r.get("text_en"):
            r["text_orig"] = r["text"]; r["text"] = r["text_en"]
        out.append(r)
    s["reviews"] = out; n += 1
json.dump(shops, open(DATA / "shops.json", "w"), ensure_ascii=False)
print("merged", n, "shops")
