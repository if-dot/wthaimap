import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BestPage from "../BestPage";
import { SNAPSHOT, TAKES, TakeKey } from "@/lib/data";

const KEYS: string[] = TAKES.map((t) => t.key).filter((k) => k !== "overall");
export function generateStaticParams() { return KEYS.map((take) => ({ take })); }
export async function generateMetadata({ params }: { params: Promise<{ take: string }> }): Promise<Metadata> {
  const { take } = await params; const T = TAKES.find((t) => t.key === take);
  if (!T) return {};
  return { title: `${T.pageTitle} (${SNAPSHOT.split(" ").slice(1).join(" ")})`, description: `${T.blurb}. Phuket shops ranked from reviews in five languages, with the quotes behind every score.` };
}
export default async function Page({ params }: { params: Promise<{ take: string }> }) {
  const { take } = await params;
  if (!KEYS.includes(take)) notFound();
  return <BestPage take={take as TakeKey} />;
}
