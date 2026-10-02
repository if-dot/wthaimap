# BudMap

Independent, review-driven guide to cannabis dispensaries for travellers. First edition: Phuket (`/phuket/`).

## Stack
Next.js 16 (App Router, static generation), Leaflet + OpenStreetMap tiles, no database. All data lives in `data/phuket/`.

## Data pipeline (`pipeline/`)
- `build.py` — assembles `data/phuket/shops.json` from raw place/review dumps (Google Places via Wanderlog proxy, weeden.club list, Reddit via arctic-shift). See `collection_log.txt` for what worked.
- `score.py` — classifies review texts by theme (5-language vocabulary) and writes `data/phuket/scored.json` with six scores per shop. Run `python3 pipeline/score.py` after changing `shops.json`.
- Snapshot date is in `src/lib/data.ts` (`SNAPSHOT`).

## Run
```
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Environment
- `NEXT_PUBLIC_SITE_URL` — canonical origin (sitemap/robots). Default `https://budmap.vercel.app`.
- `NEXT_PUBLIC_LAUNCHED=1` — switches robots.txt from `Disallow: /` to allow. Leave unset until launch.
- `NEXT_PUBLIC_CONTACT_EMAIL` — shown in footer and on /for-shops/.

## Map tiles
Development uses tile.openstreetmap.org (usage policy: light traffic only). Before public launch switch `MapApp.tsx` to a provider with a key (MapTiler / Stadia / Thunderforest) — one line.

## Routes
`/` · `/phuket/` · `/phuket/map/` (client map, geolocation) · `/phuket/best/` and `/phuket/best/{quality|price|atmosphere|beginner|trust}/` · `/phuket/areas/` and `/phuket/areas/{area}/` · `/phuket/shop/{slug}/` (189; indexed only with ≥5 review texts) · `/phuket/prices/` · `/phuket/first-time/` · `/how-we-score/` · `/about/` · `/for-shops/` · `/sitemap.xml` · `/robots.txt` · `/llms.txt`

## Pipeline, round 2
- `pipeline/fetch_reviews_apify.py` — full review history per shop via Apify (`APIFY_TOKEN`), several languages, newest first → `data/phuket/raw_reviews/`.
- `pipeline/merge_reviews.py` — folds full pulls into `shops.json`; then `score.py`.
- `pipeline/snapshot_counts.py` — weekly rating/count snapshot → `review_snapshots.json` (seeded 2026-10-02). Review velocity will feed Trust once ≥2 snapshots exist.
- Photos: `src/components/PlacePhotos.tsx` renders live Google Places photos when `NEXT_PUBLIC_GOOGLE_MAPS_KEY` is set (key restricted to the site's HTTP referrers; Places API (New) enabled).

## SEO / GEO guardrails (v0.3)
- Every page sets canonical + robots through `src/lib/seo.tsx`. Nothing is indexable until `NEXT_PUBLIC_LAUNCHED=1` (robots.txt also flips then).
- Shop pages are indexed only when `indexable()` passes: not thin, open, ≥8 review texts, ≥150 own unique words from quotes/prices/address. Others stay noindex,follow (still linked, still useful). Strain pages need ≥2 menu entries.
- `npm run build` runs `scripts/check-index.mjs`: every built page has a canonical equal to its URL; with the launch flag on, no noindex page may be in the sitemap and every sitemap URL must exist. Build fails otherwise.
- Breadcrumb JSON-LD on area, shop and law pages; FAQPage on first-time and law pages; Store on shops; ItemList on rankings.
- `public/llms.txt` lists the pages and facts an LLM should cite. Shop pages with score ≥60 carry a copyable "link to your score" snippet (inbound links from shops).
- Analytics: set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` to load Plausible. IndexNow: put `<key>.txt` in `public/`, then `INDEXNOW_KEY=<key> npm run indexnow` after each deploy.
