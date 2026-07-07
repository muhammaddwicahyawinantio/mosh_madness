import type { Metadata } from "next";
import { HeroClient } from "@/components/admin/HeroClient";

export const metadata: Metadata = { title: "Hero" };

export default function AdminHeroPage() {
  return (
    <main>
      <h1 className="type-headline-md mb-6 text-primary">Hero</h1>
      <HeroClient />
    </main>
  );
}
