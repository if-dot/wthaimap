#!/usr/bin/env python3
"""Pull Google reviews via Apify actor compass/google-maps-reviews-scraper (pay per review: $0.0006 on the free plan,
$0.00045 on Starter). One run returns reviews in their original language plus Google's English translation.

Usage: APIFY_TOKEN=... python3 pipeline/fetch_reviews_compass.py [--max-reviews 25] [--only N] [--budget 4.5] [--since 2024-01-01]
Writes data/phuket/raw_reviews/<place_id>.json in the same shape merge_reviews.py expects. Re-runs skip shops that already have a file,
unless --refresh is given (then files are replaced and the dedupe in merge_reviews.py keeps the union).
"""
import json, os, sys, time, urllib.request, argparse, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent; DATA = ROOT / "data" / "phuket"; OUT = DATA / "raw_reviews"
ACTOR = "compass~google-maps-reviews-scraper"

def api(path, token, payload=None, method="POST"):
    req = urllib.request.Request(f"https://api.apify.com/v2/{path}", method=method, headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req, data=json.dumps(payload).encode() if payload is not None else None, timeout=120) as r:
        return json.loads(r.read().decode())

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-reviews", type=int, default=25); ap.add_argument("--only", type=int, default=0)
    ap.add_argument("--budget", type=float, default=4.5); ap.add_argument("--since", default=None)
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args(); token = os.environ.get("APIFY_TOKEN") or sys.exit("Set APIFY_TOKEN")
    shops = json.load(open(DATA / "shops.json"))
    ids = [s["id"] for s in shops if str(s.get("id", "")).startswith("ChIJ")]
    if a.only: ids = ids[: a.only]
    OUT.mkdir(exist_ok=True)
    todo = ids if a.refresh else [pid for pid in ids if not (OUT / f"{pid}.json").exists()]
    print(f"{len(ids)} shops, {len(todo)} to fetch, max {a.max_reviews}/shop, budget ${a.budget}")
    if not todo: return
    payload = {"placeIds": todo, "maxReviews": a.max_reviews, "reviewsSort": "newest", "language": "en", "reviewsOrigin": "google", "personalData": False}
    if a.since: payload["reviewsStartDate"] = a.since
    run = api(f"acts/{ACTOR}/runs?waitForFinish=0&maxTotalChargeUsd={a.budget}", token, payload)["data"]
    rid = run["id"]; print("run", rid)
    while True:
        d = api(f"actor-runs/{rid}", token, None, "GET")["data"]
        if d["status"] in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"): break
        time.sleep(15)
    print("status", d["status"], "usd", d.get("usageTotalUsd"))
    if d["status"] != "SUCCEEDED": return
    ds = d["defaultDatasetId"]; offset = 0; res = {pid: {"place_id": pid, "fetched": time.strftime("%Y-%m-%d"), "actor": ACTOR, "reviews": []} for pid in todo}
    while True:
        items = api(f"datasets/{ds}/items?offset={offset}&limit=1000&clean=true", token, None, "GET")
        if not items: break
        for it in items:
            pid = it.get("placeId")
            if pid not in res: continue
            text = it.get("textTranslated") and it.get("text") or it.get("text") or ""
            if not text: continue
            res[pid]["reviews"].append({"src": "google", "id": it.get("reviewId"), "date": str(it.get("publishedAtDate") or "")[:10], "stars": it.get("stars"), "text": it.get("text") or "", "text_en": it.get("textTranslated") or "", "lang": it.get("originalLanguage") or None, "likes": it.get("likesCount"), "author_reviews": it.get("reviewerNumberOfReviews"), "owner_reply": bool(it.get("responseFromOwnerText"))})
        offset += len(items)
    for pid, r in res.items(): json.dump(r, open(OUT / f"{pid}.json", "w"), ensure_ascii=False)
    print("saved", len(res), "files; reviews with text", sum(len(r["reviews"]) for r in res.values()))

if __name__ == "__main__": main()
