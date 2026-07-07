import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ProductSelector } from "@/components/sections/ProductSelector";
import { ContactPreview } from "@/components/sections/ContactPreview";
import { SponsorSection } from "@/components/sections/SponsorSection";
import { Marquee } from "@/components/shared/Marquee";
import { getContent } from "@/lib/content";
import { BRAND } from "@/lib/constants";
import { StackPanel } from "@/components/shared/StackPanel";

// Teks section dari DB (SiteContent) — edit admin langsung kelihatan
export const dynamic = "force-dynamic";

const FALLBACK = {
  "hero.word": "The Art\nof Darkness",
  "about.writer":
    `${BRAND.name} berdiri ${BRAND.established} di ${BRAND.location} — dibangun ${BRAND.owner} dari keringat barisan depan panggung.`,
  "marquee.about": `${BRAND.name} — ${BRAND.estCode} — ${BRAND.sku}`,
  "marquee.product": "The Art of Darkness — 666",
  "marquee.contact": `The Art of Darkness — ${BRAND.name} — Banjarmasin`,
};

/**
 * Home — sticky stack ala Lusion/oryzo: tiap section pin lalu ditimpa
 * section berikutnya (yang tertimpa menyusut + meredup). Marquee jadi
 * leading edge section yang masuk. Panel WAJIB punya bg opaque.
 * Urutan (FRONTEND.md §2): Hero → About → Product → Sponsor → Contact.
 */
export default async function HomePage() {
  const db = await getContent(Object.keys(FALLBACK));
  const content = { ...FALLBACK, ...db };

  return (
    <main className="relative">
      <StackPanel className="bg-surface-lowest">
        <HeroSection word={content["hero.word"]} />
      </StackPanel>

      {/* About = pin sendiri (2 fase), BUKAN di dalam StackPanel —
          sticky-in-sticky bikin progress scroll mati (lihat AboutSection) */}
      <Marquee text={content["marquee.about"]} />
      <AboutSection writer={content["about.writer"]} />

      {/* Product = pin sendiri (carousel berputar mengikuti scroll),
          BUKAN di dalam StackPanel — sama alasannya dengan About */}
      <Marquee text={content["marquee.product"]} />
      <ProductSelector />

      {/* Sponsor = pin sendiri (radial gallery GSAP), BUKAN di StackPanel —
          pin GSAP tidak bisa hidup di dalam parent sticky (lihat SponsorSection) */}
      <SponsorSection />

      <StackPanel className="bg-surface">
        <Marquee text={content["marquee.contact"]} />
        <ContactPreview />
      </StackPanel>
    </main>
  );
}
