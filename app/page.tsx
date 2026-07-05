import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ProductSelector } from "@/components/sections/ProductSelector";
import { ContactSection } from "@/components/sections/ContactSection";
import { SponsorSection } from "@/components/sections/SponsorSection";
import { Marquee } from "@/components/shared/Marquee";
import { StackPanel } from "@/components/shared/StackPanel";
import { BRAND } from "@/lib/constants";

/**
 * Home — sticky stack ala Lusion/oryzo: tiap section pin lalu ditimpa
 * section berikutnya (yang tertimpa menyusut + meredup). Marquee jadi
 * leading edge section yang masuk. Panel WAJIB punya bg opaque.
 */
export default function HomePage() {
  return (
    <main className="relative">
      <StackPanel className="bg-surface-lowest">
        <HeroSection />
      </StackPanel>

      <StackPanel className="bg-surface">
        <Marquee text={`${BRAND.name} — ${BRAND.estCode} — ${BRAND.sku}`} />
        <AboutSection />
      </StackPanel>

      <StackPanel className="bg-surface">
        <Marquee text="Kegelapan sebagai bentuk seni — 666" />
        <ProductSelector />
      </StackPanel>

      <StackPanel className="bg-surface">
        <Marquee text={`Bicara sama kami — ${BRAND.name} — Banjarmasin`} />
        <ContactSection />
      </StackPanel>

      <StackPanel className="bg-surface-low">
        <SponsorSection />
      </StackPanel>
    </main>
  );
}
