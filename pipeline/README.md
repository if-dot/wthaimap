
## Review pulls (v0.4, 2 Oct 2026)
- `fetch_reviews_compass.py` is the working puller (actor compass/google-maps-reviews-scraper, pay per review: $0.0006 free plan, $0.00045 Starter). First pull: 30 newest reviews per shop for all 188 place_ids = 3,852 texts for $2.73 of the free $5 monthly credit. Corpus now 4,982 texts (was 1,516 from the Wanderlog sample).
- `fetch_reviews_apify.py` (litescrape actor, $0.25/1k pages) is cheaper on paper but the free plan hits "account daily allowance exhausted" after ~19 requests; keep for a paid plan.
- `merge_reviews.py` de-dupes by text+date, detects language by script/stopwords, and for languages outside the EN/RU/DE/FR/HE lexicon scores Google's English translation (`text_en`) while keeping the original in `text_orig`.
- `score.py` now keeps up to 5 quotes per theme (was 3) so shop pages carry enough own text to pass the 150-word index gate: 58 of 189 shops indexable (was 19).
- Decision 2 Oct: stay on the free plan. Weekly refresh = only reviews from the last 8 days for every shop (`--refresh --since "8 days" --max-reviews 50 --budget 1.0`), typically a few hundred texts ≈ $0.20–0.40, well inside the $5/month. merge_reviews.py keeps the union, so older texts are never lost. Then score.py, commit, push.
- Full history (44k reviews) would need Apify Starter ($29/mo, includes $29 credit → ~$20 for the whole island) — run `fetch_reviews_compass.py --refresh --max-reviews 0 --budget 25`.

## Licence registry (MC-GIS), 2 Oct 2026
- The public map at https://cannabis-gis.dtam.moph.go.th/ exposes a JSON API without login: `/api/geo/markers-dev?province_id=66&type=establishment` (Phuket = province_id 66; 1,066 establishments, 1,061 active, 4 closed, 1 suspended on 2 Oct). Fields: name, category, status, license_no, license_expiry_date, lat/lng.
- `match_mcgis.py --fetch` pulls it into `data/phuket/mcgis_phuket.json`; `match_mcgis.py` matches shops by normalised name + distance (≤300 m; strong = name similarity ≥0.75 or token containment within 150 m). 86 of 189 matched, all active. Unmatched ≠ unlicensed: the registry often carries the legal/Thai name. Result goes to `shop.mcgis`, shown on the shop page and in Trust (+6 strong, +3 probable, −30 closed/suspended).
- Re-run weekly with the review refresh; a status change to closed/suspended is the strongest single signal we have.
