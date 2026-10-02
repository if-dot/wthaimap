"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AREAS, FEATS, LANG, SHOPS, Shop, TAKES, TakeKey, fmtKm, isOpenStatus, isThin, km, scoreColor, shortName } from "@/lib/data";
import { EvidenceSections, Practical, ScoreBars, Why } from "./ShopEvidence";

const NEAR: { id: string; label: string; lat?: number; lng?: number }[] = [
  { id: "", label: "Anywhere on Phuket" },
  { id: "bangla", label: "Bangla Road, Patong", lat: 7.8929, lng: 98.2974 },
  { id: "jung", label: "Jungceylon, Patong", lat: 7.8918, lng: 98.3017 },
  { id: "karon", label: "Karon Circle", lat: 7.8468, lng: 98.2944 },
  { id: "kata", label: "Kata Beach", lat: 7.8208, lng: 98.2975 },
  { id: "kamala", label: "Kamala Beach", lat: 7.9526, lng: 98.2831 },
  { id: "boat", label: "Boat Avenue, Bang Tao", lat: 7.9933, lng: 98.296 },
  { id: "rawai", label: "Rawai Beach", lat: 7.776, lng: 98.329 },
  { id: "naiharn", label: "Nai Harn", lat: 7.775, lng: 98.306 },
  { id: "old", label: "Phuket Old Town", lat: 7.884, lng: 98.388 },
];

const COLORS: Record<string, string> = { s4: "#1F7A4D", s3: "#6DB06F", s2: "#D9A441", s1: "#B77A7A", thin: "#9AA8A0" };
function colorHex(v: number | null, thin: boolean) {
  if (thin || v == null) return COLORS.thin;
  return v >= 75 ? COLORS.s4 : v >= 60 ? COLORS.s3 : v >= 45 ? COLORS.s2 : COLORS.s1;
}

type Me = { lat: number; lng: number; label: string };

export default function MapApp({ initialTake = "overall", initialArea }: { initialTake?: TakeKey; initialArea?: string }) {
  const [take, setTake] = useState<TakeKey>(initialTake);
  const [me, setMe] = useState<Me | null>(null);
  const [areas, setAreas] = useState<Set<string>>(() => new Set(initialArea ? [initialArea] : []));
  const [feats, setFeats] = useState<Set<string>>(new Set());
  const [showThin, setShowThin] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [geoMsg, setGeoMsg] = useState<string>("");
  const mapRef = useRef<L.Map | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const meRef = useRef<L.CircleMarker | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());

  const rows = useMemo(() => {
    const vis = SHOPS.filter((s) => {
      if (areas.size && !areas.has(s.area)) return false;
      for (const f of feats) if (!s.feat?.[f]) return false;
      if (!showThin && isThin(s)) return false;
      if (!showThin && !isOpenStatus(s)) return false;
      return true;
    }).map((s) => ({ s, v: s.scores[take], d: me ? km(me, s) : null }));
    vis.sort((a, b) => {
      const av = a.v ?? -1, bv = b.v ?? -1;
      if (me) return bv - Math.min(30, (b.d as number) * 6) - (av - Math.min(30, (a.d as number) * 6));
      return bv - av;
    });
    return vis;
  }, [take, me, areas, feats, showThin]);

  // init map
  useEffect(() => {
    if (!boxRef.current || mapRef.current) return;
    const map = L.map(boxRef.current, { zoomControl: true, attributionControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    map.fitBounds([[7.76, 98.27], [8.06, 98.41]]);
    layerRef.current = L.layerGroup().addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => {
      setMe({ lat: e.latlng.lat, lng: e.latlng.lng, label: "the spot you tapped" });
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // draw markers
  useEffect(() => {
    const layer = layerRef.current; const map = mapRef.current; if (!layer || !map) return;
    layer.clearLayers(); markersRef.current.clear();
    const top = new Set(rows.slice(0, 5).map((r) => r.s.id));
    rows.forEach((r, i) => {
      const s = r.s; const thin = isThin(s); const v = r.v;
      const radius = thin ? 5 : v != null && v >= 75 ? 10 : v != null && v >= 60 ? 8 : 6;
      const m = L.circleMarker([s.lat, s.lng], {
        radius, color: sel === s.id ? "#16221C" : "#ffffff", weight: sel === s.id ? 3 : 2,
        fillColor: colorHex(v, thin), fillOpacity: thin ? 0.35 : 0.95, dashArray: thin ? "2 2" : undefined,
      });
      m.on("click", (e) => { L.DomEvent.stopPropagation(e); setSel(s.id); });
      if (top.has(s.id)) m.bindTooltip(`${i + 1} · ${shortName(s.name).slice(0, 22)}`, { permanent: true, direction: "right", className: "mk-label", offset: [8, 0] });
      else m.bindTooltip(shortName(s.name), { direction: "top", className: "mk-label" });
      m.addTo(layer); markersRef.current.set(s.id, m);
    });
    if (me) {
      if (!meRef.current) meRef.current = L.circleMarker([me.lat, me.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#1E63D6", fillOpacity: 1 });
      meRef.current.setLatLng([me.lat, me.lng]).addTo(map);
    } else if (meRef.current) meRef.current.remove();
  }, [rows, sel, me]);

  function locate() {
    if (!navigator.geolocation) { setGeoMsg("Location is not available in this browser. Pick a landmark instead."); return; }
    setGeoMsg("Finding you…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const m = { lat: p.coords.latitude, lng: p.coords.longitude, label: "your location" };
        if (m.lat < 7.6 || m.lat > 8.3 || m.lng < 98.1 || m.lng > 98.6) { setGeoMsg("You are outside Phuket. Showing the island; pick a landmark to simulate."); return; }
        setMe(m); setGeoMsg(""); mapRef.current?.setView([m.lat, m.lng], 15);
      },
      () => setGeoMsg("Location was refused. Tap the map or pick a landmark."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  const selected = sel ? SHOPS.find((s) => s.id === sel) : null;
  const T = TAKES.find((t) => t.key === take)!;

  function openShop(s: Shop) {
    setSel(s.id);
    mapRef.current?.setView([s.lat, s.lng], Math.max(mapRef.current.getZoom(), 15));
  }

  return (
    <div className="mapapp">
      <div className="mapctl">
        <div className="takes" role="tablist" aria-label="Rank by">
          {TAKES.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={t.key === take} className={`take ${t.key === take ? "on" : ""}`} onClick={() => setTake(t.key)} title={t.blurb}>{t.label}</button>
          ))}
        </div>
        <div className="ctl">
          <button type="button" className="chip" onClick={locate} id="locate">⌖ Use my location</button>
          <label className="lbl" htmlFor="near">or near</label>
          <select id="near" value={me?.label && NEAR.find((n) => n.label === me.label)?.id || ""} onChange={(e) => { const n = NEAR.find((x) => x.id === e.target.value); if (n && n.lat) { setMe({ lat: n.lat, lng: n.lng!, label: n.label }); mapRef.current?.setView([n.lat, n.lng!], 15); } else setMe(null); }}>
            {NEAR.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
          {geoMsg && <span className="lbl">{geoMsg}</span>}
          <span className="chips">
            {AREAS.filter((a) => a.key !== "Other").map((a) => (
              <button key={a.key} type="button" className={`chip soft ${areas.has(a.key) ? "on" : ""}`} onClick={() => { const n = new Set(areas); n.has(a.key) ? n.delete(a.key) : n.add(a.key); setAreas(n); }}>{a.label}</button>
            ))}
          </span>
          <span className="chips">
            {FEATS.map((f) => (
              <button key={f.key} type="button" className={`chip soft ${feats.has(f.key) ? "on" : ""}`} onClick={() => { const n = new Set(feats); n.has(f.key) ? n.delete(f.key) : n.add(f.key); setFeats(n); }}>{f.label}</button>
            ))}
          </span>
          <label className="chip" style={{ cursor: "pointer" }}><input id="thin" type="checkbox" checked={showThin} onChange={(e) => setShowThin(e.target.checked)} style={{ verticalAlign: -2, margin: "0 4px 0 0" }} />include shops with under 5 reviews</label>
        </div>
      </div>
      <div className="mapmain">
        <div className="mapbox">
          <div ref={boxRef} style={{ width: "100%", height: "100%" }} aria-label="Map of Phuket dispensaries"></div>
          <div className="legend"><span><i style={{ background: COLORS.s4 }}></i>75+</span><span><i style={{ background: COLORS.s3 }}></i>60–74</span><span><i style={{ background: COLORS.s2 }}></i>45–59</span><span><i style={{ background: COLORS.s1 }}></i>&lt;45</span><span><i style={{ border: `2px dashed ${COLORS.thin}`, width: 8, height: 8, background: "transparent" }}></i>thin data</span><span>· tap map to set “I'm here”</span></div>
          <button type="button" className="locbtn" onClick={locate} aria-label="Use my location" title="Use my location">⌖</button>
        </div>
        <aside className="side">
          <div className="list">
            <div className="lhead"><b>{T.label}</b><span>{rows.length} shops{me ? ` · nearest to ${me.label} first` : ""} · {T.blurb}</span></div>
            <div className="rows">
              {rows.map((r, i) => {
                const s = r.s; const thin = isThin(s);
                const sub = [s.area, s.rating ? `★${s.rating} · ${s.count.toLocaleString("en-US")} Google reviews` : "no Google rating", s.price_med ? `฿${Math.round(s.price_med)}/g` : null].filter(Boolean).join(" · ");
                return (
                  <div key={s.id} className={`row ${sel === s.id ? "sel" : ""}`} role="button" tabIndex={0} onClick={() => openShop(s)} onKeyDown={(e) => { if (e.key === "Enter") openShop(s); }}>
                    <div className="score" style={{ color: colorHex(r.v, thin) }}>{r.v == null ? "–" : r.v}<small>{thin ? "thin" : "score"}</small></div>
                    <div><div className="nm">{i + 1}. {s.name}</div><div className="sub">{sub}</div></div>
                    <div className="right">{r.d != null && <b>{fmtKm(r.d)}</b>}{s.n} texts</div>
                  </div>
                );
              })}
            </div>
          </div>
          {selected && (
            <div className="detail" id="detail">
              <div className="dhead">
                <div>
                  <h2>{selected.name}</h2>
                  <div className="meta">{selected.area} · {selected.rating ? `★${selected.rating} from ${selected.count.toLocaleString("en-US")} Google reviews` : "no Google rating"} · {selected.n} review texts read ({(selected.langs || []).map((l) => LANG[l] || l).join(", ")}){me ? ` · ${fmtKm(km(me, selected))} from ${me.label}` : ""}</div>
                </div>
                <button type="button" className="close" aria-label="Close" onClick={() => setSel(null)}>✕</button>
              </div>
              <div style={{ marginTop: 12 }}><ScoreBars s={selected} /></div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6 }}>Confidence {Math.round((selected.scores.conf || 0) * 100)}% from {selected.n} texts{selected.n < 12 ? "; scores shrink toward 50 when data is thin" : ""}. <Link href={`/phuket/shop/${selected.slug}/`}>Full page →</Link></div>
              <div className="dsec"><h3>Why</h3><Why s={selected} /></div>
              <EvidenceSections s={selected} compact />
              <div className="dsec"><h3>Practical</h3><Practical s={selected} /></div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
