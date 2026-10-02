#!/usr/bin/env python3
"""Weekly snapshot of Google rating + review count per shop (via the Wanderlog Places proxy used in build.py).
Appends to data/phuket/review_snapshots.json: {date: {place_id: [rating, count]}}.
Velocity (reviews per week) feeds the Trust score once two or more snapshots exist."""
import json, pathlib, time, urllib.request, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent; DATA = ROOT / "data" / "phuket"
F = DATA / "review_snapshots.json"
snap = json.load(open(F)) if F.exists() else {}
shops = json.load(open(DATA / "shops.json")); today = time.strftime("%Y-%m-%d")
if today in snap and "--force" not in sys.argv: sys.exit("already have today")
cur = {}
for s in shops:
    pid = s["id"]
    if not str(pid).startswith("ChIJ"): continue
    try:
        req = urllib.request.Request(f"https://wanderlog.com/api/placesAPI/getPlaceDetails/v2?placeId={pid}", headers={"User-Agent": "Mozilla/5.0 budmap-snapshot"})
        j = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
        d = j.get("data") or j
        cur[pid] = [d.get("rating"), d.get("user_ratings_total") or d.get("userRatingCount")]
    except Exception as e:
        cur[pid] = [s.get("google", {}).get("rating"), s.get("google", {}).get("count")]
    time.sleep(0.3)
snap[today] = cur
json.dump(snap, open(F, "w"))
print(today, len(cur), "shops")
