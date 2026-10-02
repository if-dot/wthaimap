#!/usr/bin/env python3
"""Pull the full Google review history for every shop in data/phuket/shops.json via Apify
(actor litescrape/google-maps-reviews), in several languages, newest first.

Usage:
  APIFY_TOKEN=apify_api_xxx python3 pipeline/fetch_reviews_apify.py [--langs en,ru,de,fr,iw,th] [--max-pages 20] [--only N]

Writes data/phuket/raw_reviews/<place_id>.json  ({place_id, fetched, langs, reviews:[{src,date,stars,text,lang,author_reviews,likes}]})
Then run pipeline/merge_reviews.py to fold them into shops.json and pipeline/score.py to rescore.

Cost: ~$0.25 per 1,000 review pages (page = up to 100 reviews on the first request, 20 on continuation pages).
Phuket, 189 shops × 6 languages × a few pages ≈ 3–5k pages ≈ $1–2 + Apify compute.
"""
import json, os, sys, time, urllib.request, argparse, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "phuket"
OUT = DATA / "raw_reviews"
ACTOR = "litescrape~google-maps-reviews"

def api(path, token, payload=None, method="POST"):
    req = urllib.request.Request(f"https://api.apify.com/v2/{path}", method=method, headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    data = json.dumps(payload).encode() if payload is not None else None
    with urllib.request.urlopen(req, data=data, timeout=120) as r:
        return json.loads(r.read().decode())

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--langs", default="en,ru,de,fr,iw,th")
    ap.add_argument("--max-pages", type=int, default=20)
    ap.add_argument("--only", type=int, default=0, help="limit to first N shops (smoke test)")
    a = ap.parse_args()
    token = os.environ.get("APIFY_TOKEN")
    if not token:
        sys.exit("Set APIFY_TOKEN")
    shops = json.load(open(DATA / "shops.json"))
    ids = [s["id"] for s in shops if str(s.get("id", "")).startswith("ChIJ")]
    if a.only: ids = ids[: a.only]
    OUT.mkdir(exist_ok=True)
    langs = a.langs.split(",")
    todo = [pid for pid in ids if not (OUT / f"{pid}.json").exists()]
    print(f"{len(ids)} shops, {len(todo)} to fetch, langs {langs}")
    # one run per language; the actor accepts many place ids per run
    results = {pid: {"place_id": pid, "fetched": time.strftime("%Y-%m-%d"), "langs": langs, "reviews": []} for pid in todo}
    for lang in langs:
        payload = {"placeIds": todo, "hl": lang, "sort_by": "newest", "maxPagesPerInput": a.max_pages, "maxRequests": len(todo) * a.max_pages}
        run = api(f"acts/{ACTOR}/runs?waitForFinish=0", token, payload)["data"]
        run_id = run["id"]; print("run", lang, run_id)
        while True:
            st = api(f"actor-runs/{run_id}", token, None, "GET")["data"]["status"]
            if st in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"): break
            time.sleep(10)
        print("status", st)
        if st != "SUCCEEDED": continue
        ds = run["defaultDatasetId"]; offset = 0
        while True:
            items = api(f"datasets/{ds}/items?offset={offset}&limit=1000&clean=true", token, None, "GET")
            if not items: break
            for it in items:
                pid = it.get("placeId") or it.get("place_id") or it.get("input", {}).get("placeId")
                for rv in it.get("reviews", []) or []:
                    if pid in results:
                        results[pid]["reviews"].append({"src": "google", "date": (rv.get("publishedAtDate") or rv.get("date") or "")[:10], "stars": rv.get("stars") or rv.get("rating"), "text": rv.get("text") or "", "lang": lang, "likes": rv.get("likesCount"), "author_reviews": rv.get("reviewerNumberOfReviews")})
            offset += len(items)
    for pid, r in results.items():
        json.dump(r, open(OUT / f"{pid}.json", "w"), ensure_ascii=False)
    print("saved", len(results), "files; total reviews", sum(len(r["reviews"]) for r in results.values()))

if __name__ == "__main__":
    main()
