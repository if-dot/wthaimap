"use client";
import { useEffect, useState } from "react";

/** Live photos from Google Places API (New). Renders nothing until NEXT_PUBLIC_GOOGLE_MAPS_KEY is set.
 *  Photos are fetched at view time and never stored, as the Places terms require; attribution is shown. */
export default function PlacePhotos({ placeId, max = 4 }: { placeId: string; max?: number }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const [photos, setPhotos] = useState<{ name: string; uri: string; attr: string; attrUrl?: string }[]>([]);
  useEffect(() => {
    if (!key || !placeId || !placeId.startsWith("ChIJ")) return;
    let alive = true;
    fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=photos&key=${key}`, { headers: { "X-Goog-FieldMask": "photos" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive || !j?.photos) return;
        const list = j.photos.slice(0, max) as { name: string; authorAttributions?: { displayName: string; uri?: string }[] }[];
        // resolve each photo to its direct image URL (skipHttpRedirect returns JSON {photoUri}); avoids <img> following a keyed redirect
        return Promise.all(list.map((p) => fetch(`https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=640&skipHttpRedirect=true&key=${key}`).then((r) => (r.ok ? r.json() : null)).then((m) => ({ name: p.name, uri: m?.photoUri as string, attr: p.authorAttributions?.[0]?.displayName || "Google user", attrUrl: p.authorAttributions?.[0]?.uri })).catch(() => null)))
          .then((ps) => { if (alive) setPhotos(ps.filter((x): x is NonNullable<typeof x> => !!x && !!x.uri)); });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [key, placeId, max]);
  if (!key || !photos.length) return null;
  return (
    <div className="photos">
      {photos.map((p) => (
        <figure key={p.name} style={{ margin: 0 }}>
          <img src={p.uri} alt="Photo of the shop from Google Maps" referrerPolicy="no-referrer" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 8 }} />
          <figcaption style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Photo: {p.attrUrl ? <a href={p.attrUrl} target="_blank" rel="noopener">{p.attr}</a> : p.attr} via Google</figcaption>
        </figure>
      ))}
    </div>
  );
}
