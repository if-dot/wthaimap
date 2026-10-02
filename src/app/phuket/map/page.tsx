import type { Metadata } from "next";
import MapLoader from "@/components/MapLoader";
import { TAKES, TakeKey } from "@/lib/data";

export const metadata: Metadata = {
  title: "Phuket weed map: best dispensaries near me",
  description: "Interactive map of 189 Phuket dispensaries ranked by what reviewers say: best flower, cheapest, best vibe, first-timer friendly, most trusted. Use your location.",
  robots: { index: true, follow: true },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ take?: string; area?: string }> }) {
  const sp = await searchParams;
  const take = (TAKES.find((t) => t.key === sp.take)?.key || "overall") as TakeKey;
  return <MapLoader initialTake={take} initialArea={sp.area} />;
}
