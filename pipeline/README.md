
## Review pulls (v0.4, 2 Oct 2026)
- `fetch_reviews_compass.py` is the working puller (actor compass/google-maps-reviews-scraper, pay per review: $0.0006 free plan, $0.00045 Starter). First pull: 30 newest reviews per shop for all 188 place_ids = 3,852 texts for $2.73 of the free $5 monthly credit. Corpus now 4,982 texts (was 1,516 from the Wanderlog sample).
- `fetch_reviews_apify.py` (litescrape actor, $0.25/1k pages) is cheaper on paper but the free plan hits "account daily allowance exhausted" after ~19 requests; keep for a paid plan.
- `merge_reviews.py` de-dupes by text+date, detects language by script/stopwords, and for languages outside the EN/RU/DE/FR/HE lexicon scores Google's English translation (`text_en`) while keeping the original in `text_orig`.
- `score.py` now keeps up to 5 quotes per theme (was 3) so shop pages carry enough own text to pass the 150-word index gate: 58 of 189 shops indexable (was 19).
- Full history (44k reviews) needs Apify Starter ($29/mo, includes $29 credit → ~$20 for the whole island) — run `fetch_reviews_compass.py --refresh --max-reviews 0 --budget 25`.
