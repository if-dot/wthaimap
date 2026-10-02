// Submit all sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver; feeds Bing-backed LLM retrieval).
// Usage: INDEXNOW_KEY=... node scripts/indexnow.mjs   (key file must be served at /<key>.txt → public/<key>.txt)
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://wthaimap.vercel.app";
const KEY = process.env.INDEXNOW_KEY; if (!KEY) { console.error("INDEXNOW_KEY missing"); process.exit(1); }
const sm = await (await fetch(SITE + "/sitemap.xml")).text();
const urlList = [...sm.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
const host = new URL(SITE).host;
const r = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }) });
console.log("IndexNow", r.status, urlList.length, "urls");
