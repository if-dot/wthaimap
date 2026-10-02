import type { Metadata } from "next";
import BestPage from "./BestPage";
import { SNAPSHOT } from "@/lib/data";

export const metadata: Metadata = {
  title: `Best dispensaries in Phuket (${SNAPSHOT.split(" ").slice(1).join(" ")})`,
  description: "Phuket dispensaries ranked by what reviewers in five languages say about the flower, prices, staff and trust. No paid placements. Every score shows its evidence.",
};
export default function Page() { return <BestPage take="overall" />; }
