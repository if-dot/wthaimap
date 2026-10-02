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
