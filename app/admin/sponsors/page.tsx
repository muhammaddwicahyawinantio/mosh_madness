import type { Metadata } from "next";
import { SponsorsClient } from "@/components/admin/SponsorsClient";

export const metadata: Metadata = { title: "Sponsor" };

export default function AdminSponsorsPage() {
  return (
    <main>
      <h1 className="type-headline-md mb-6 text-primary">Sponsor</h1>
      <SponsorsClient />
    </main>
  );
}
