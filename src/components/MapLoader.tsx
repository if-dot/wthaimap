"use client";
import dynamic from "next/dynamic";
import type { TakeKey } from "@/lib/data";

const MapApp = dynamic(() => import("./MapApp"), { ssr: false, loading: () => <div style={{ padding: 24, color: "var(--muted)" }}>Loading the map…</div> });

export default function MapLoader(props: { initialTake?: TakeKey; initialArea?: string }) {
  return <MapApp {...props} />;
}
