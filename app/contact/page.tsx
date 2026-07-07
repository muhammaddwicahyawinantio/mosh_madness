import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/ContactSection";
import { Marquee } from "@/components/shared/Marquee";
import { getContent } from "@/lib/content";
import { BRAND } from "@/lib/constants";

// Kontak (WA/IG/alamat) dari DB — edit admin langsung kelihatan
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontak",
  description: `Hubungi ${BRAND.name} — kolaborasi, stok, atau sekadar teriak.`,
};

export default async function ContactPage() {
  const content = await getContent([
    "contact.whatsapp",
    "contact.instagram",
    "contact.address",
  ]);

  return (
    <main className="pt-16">
      <ContactSection
        whatsapp={content["contact.whatsapp"]}
        instagram={content["contact.instagram"]}
        address={content["contact.address"]}
      />
      <Marquee text={`Bicara sama kami — ${BRAND.name} — Banjarmasin`} />
    </main>
  );
}
