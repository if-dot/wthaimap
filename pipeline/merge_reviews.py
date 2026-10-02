#!/usr/bin/env python3
"""Fold data/phuket/raw_reviews/*.json (full Apify pulls) into shops.json: replaces each shop's `reviews`
with the full, de-duplicated set (by text+date), keeps the Wanderlog sample if no full pull exists.
Then run pipeline/score.py."""
import json, pathlib
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
        seen.add(k); out.append(r)
    s["reviews"] = out; n += 1
json.dump(shops, open(DATA / "shops.json", "w"), ensure_ascii=False)
print("merged", n, "shops")
