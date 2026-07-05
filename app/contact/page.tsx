import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/ContactSection";
import { Marquee } from "@/components/shared/Marquee";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Kontak",
  description: `Hubungi ${BRAND.name} — kolaborasi, stok, atau sekadar teriak.`,
};

export default function ContactPage() {
  return (
    <main className="bg-blueprint pt-16">
      <ContactSection />
      <Marquee text={`Bicara sama kami — ${BRAND.name} — Banjarmasin`} />
    </main>
  );
}
