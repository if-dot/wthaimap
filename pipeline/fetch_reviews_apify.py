#!/usr/bin/env python3
"""Pull the full Google review history for every shop in data/phuket/shops.json via Apify
(actor litescrape/google-maps-reviews), in several languages, newest first.

Usage:
  APIFY_TOKEN=apify_api_xxx python3 pipeline/fetch_reviews_apify.py [--langs en,ru,de,fr,iw,th] [--max-pages 20] [--only N]

Writes data/phuket/raw_reviews/<place_id>.json  ({place_id, fetched, langs, reviews:[{src,date,stars,text,lang,author_reviews,likes}]})
Then run pipeline/merge_reviews.py to fold them into shops.json and pipeline/score.py to rescore.

Cost: ~$0.25 per 1,000 review pages (first page 100 reviews, continuation pages 20). One hl=en run returns all reviews in their
original language plus Google's English translation, so one run covers Phuket: 189 shops × ~10 pages ≈ 2k pages ≈ $0.50 + compute.
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

def pick(d, *keys):
    for k in keys:
        v = d.get(k) if isinstance(d, dict) else None
        if v not in (None, ""): return v
    return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--langs", default="en", help="one run with hl=en already returns every review with original + translated text")
    ap.add_argument("--max-pages", type=int, default=20)
    ap.add_argument("--only", type=int, default=0, help="limit to first N shops (smoke test)")
    ap.add_argument("--budget", type=float, default=3.0, help="max USD charge per run (Apify caps PPE runs at a small default otherwise)")
    ap.add_argument("--dump", action="store_true", help="save raw dataset items for inspection")
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
        payload = {"requests": [{"place_id": pid} for pid in todo], "hl": lang, "num": 100, "sort_by": "newestFirst", "maxPagesPerInput": a.max_pages, "maxRequests": min(10000, len(todo) * a.max_pages), "maxResults": 100000}
        run = api(f"acts/{ACTOR}/runs?waitForFinish=0&maxTotalChargeUsd={a.budget}", token, payload)["data"]
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
            if a.dump: json.dump(items, open(OUT / f"_dump_{lang}_{offset}.json", "w"), ensure_ascii=False)
            for it in items:
                idx = it.get("inputIndex"); pid = todo[idx] if isinstance(idx, int) and idx < len(todo) else None
                rv = it.get("data") or {}
                if pid in results and (rv.get("snippet") or rv.get("extracted_snippet")):
                    ex = rv.get("extracted_snippet") or {}
                    results[pid]["reviews"].append({"src": "google", "id": rv.get("review_id"), "date": str(rv.get("iso_date") or "")[:10], "stars": rv.get("rating"), "text": ex.get("original") or rv.get("snippet") or "", "text_en": ex.get("translated") or "", "likes": rv.get("likes"), "author_reviews": (rv.get("user") or {}).get("reviews"), "owner_reply": bool(rv.get("response"))})
            offset += len(items)
    for pid, r in results.items():
        json.dump(r, open(OUT / f"{pid}.json", "w"), ensure_ascii=False)
    print("saved", len(results), "files; total reviews", sum(len(r["reviews"]) for r in results.values()))

if __name__ == "__main__":
    main()
