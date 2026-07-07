"use client";

import useSWR from "swr";
import { motion } from "motion/react";
import { RadialScrollGallery } from "@/components/ui/portfolio-and-image-gallery";
import { SafeImage } from "@/components/shared/SafeImage";
import { VideoCards } from "@/components/shared/VideoCards";
import { ASSETS, BRAND } from "@/lib/constants";
import { jsonFetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { revealStagger, revealUp, viewportOnce } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { SponsorDTO } from "@/types/api";

/** Auto-update: foto/sponsor baru dari admin nongol tanpa reload manual */
const REFRESH_MS = 20_000;

/**
 * Link default per logo statis ("untuk sementara") — dipakai kalau admin
 * belum isi field link di CMS. Admin tetap bisa override lewat /admin/sponsors
 * (link DB menang). Cocokkan dari nama file aset statis.
 */
const SPONSOR_LINK_FALLBACK: { hint: string; url: string }[] = [
  { hint: "dwiscript", url: "https://dwiscript.my.id/" },
  { hint: "polihasnur", url: "https://sipha.polihasnur.ac.id/" },
  {
    hint: "himati",
    url: "https://www.instagram.com/himati.polhas?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  },
];

function resolveSponsorLink(s: SponsorDTO): string | null {
  if (s.link) return s.link;
  return SPONSOR_LINK_FALLBACK.find((f) => s.logoUrl.includes(f.hint))?.url ?? null;
}

/**
 * S5 Sponsor — background editorial (about-section.png) + scrim, 2 video
 * card diagonal, lalu showcase logo RADIAL SCROLL GALLERY (GSAP, sinkron
 * Lenis). Data 100% dari DB (`Sponsor`, CRUD/on-off /admin) — foto baru
 * auto muncul (SWR). Klik logo → link sponsor (fallback default kalau admin
 * belum set). prefers-reduced-motion → grid statis (aksesibel).
 */
export function SponsorSection() {
  const { data } = useSWR<SponsorDTO[]>("/api/sponsors", jsonFetcher, {
    refreshInterval: REFRESH_MS,
    revalidateOnFocus: true,
  });
  const sponsors = data ?? [];
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Mobile → galeri radial (pin GSAP) diganti kartu swipe biar mulus & rapi
  const isMobile = useMediaQuery("(max-width: 767px)");

  const openLink = (index: number) => {
    const sponsor = sponsors[index];
    if (!sponsor) return;
    const link = resolveSponsorLink(sponsor);
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="sponsor"
      aria-label="Didukung oleh"
      className="relative border-t border-outline-variant bg-surface-lowest"
    >
      {/* Background editorial + scrim — biar section tidak polos & teks kebaca */}
      <SafeImage
        src={ASSETS.about}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="absolute inset-0 object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-surface-lowest via-surface-lowest/75 to-surface-lowest"
      />

      {/* Konten di atas background */}
      <div className="relative">
        <div className="mx-auto max-w-[1600px] px-4 pt-16 md:px-8">
          <motion.div
            variants={revealStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.p variants={revealUp} className="type-label mb-2 text-accent-666">
              004 / Didukung oleh
            </motion.p>
            <motion.h2
              variants={revealUp}
              className="type-headline-lg text-primary max-md:text-4xl"
            >
              Berdiri bareng barisan
            </motion.h2>

            <motion.div variants={revealUp} className="mt-10">
              <VideoCards />
            </motion.div>
          </motion.div>
        </div>

        {/* Showcase logo — hanya kalau ada sponsor aktif (hormati toggle admin) */}
        {sponsors.length > 0 && (
          <div className="mt-16">
            {/* Header di atas cards — teks diperbesar */}
            <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
              <p className="type-label text-base text-accent-666 md:text-lg">
                Sponsored by
              </p>
              <p className="type-headline-lg mt-3 text-primary max-md:text-3xl">
                Inovasi Digital Untuk Kemandirian UMKM Lokal
              </p>
            </div>

            {reducedMotion || isMobile ? (
              <StaticLogos sponsors={sponsors} />
            ) : (
              <>
                <p className="type-label mt-4 text-center text-outline">
                  Scroll untuk memutar — klik logo untuk kunjungi
                </p>
                <RadialScrollGallery
                  baseRadius={360}
                  mobileRadius={210}
                  visiblePercentage={55}
                  scrollDuration={1000}
                  className="!min-h-0"
                  onItemSelect={openLink}
                  aria-label="Sponsor Mosh Madness"
                >
                  {(hoveredIndex) =>
                    sponsors.map((sponsor, i) => (
                      <SponsorCard
                        key={sponsor.id}
                        sponsor={sponsor}
                        active={hoveredIndex === i}
                      />
                    ))
                  }
                </RadialScrollGallery>

                {/* Link asli untuk screen reader / tanpa-JS (galeri = tombol visual) */}
                <ul className="sr-only">
                  {sponsors.map((s) => {
                    const link = resolveSponsorLink(s);
                    return (
                      <li key={s.id}>
                        {link ? (
                          <a href={link} target="_blank" rel="noopener noreferrer">
                            {s.name}
                          </a>
                        ) : (
                          s.name
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        )}

        <p className="type-label pb-10 pt-8 text-center text-outline-variant">
          {BRAND.sku} / {BRAND.estCode} / {BRAND.location}
        </p>
      </div>
    </section>
  );
}

/**
 * Kartu logo — IMAGE FULL memenuhi kartu (object-cover). Nama di overlay
 * bawah. Aktif (hover/fokus) → tepi + garis aksen 666.
 */
function SponsorCard({
  sponsor,
  active,
}: {
  sponsor: SponsorDTO;
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "relative h-[230px] w-[170px] overflow-hidden rounded-xl border bg-white shadow-xl transition-colors duration-500 sm:h-[270px] sm:w-[200px]",
        active ? "border-accent-666" : "border-black/10",
      )}
    >
      <SafeImage
        src={sponsor.logoUrl}
        alt={sponsor.name}
        fill
        sizes="240px"
        className="object-cover"
      />
      {/* Nama — overlay bawah dengan scrim biar kebaca di atas image */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3 pt-12">
        <span className="type-label text-white">{sponsor.name}</span>
      </div>
      <span
        className={cn(
          "absolute bottom-0 left-0 z-10 h-1 bg-accent-666 transition-all duration-500",
          active ? "w-full opacity-100" : "w-0 opacity-0",
        )}
      />
    </div>
  );
}

/**
 * Layout mobile & reduced-motion — mobile: baris kartu swipe (snap),
 * desktop: wrap ke tengah. Kartu = link asli (aksesibel).
 */
function StaticLogos({ sponsors }: { sponsors: SponsorDTO[] }) {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 pt-10 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-auto md:max-w-[1600px] md:flex-wrap md:justify-center md:gap-8 md:overflow-visible md:px-8 md:pt-14 [&::-webkit-scrollbar]:hidden">
      {sponsors.map((sponsor) => {
        const link = resolveSponsorLink(sponsor);
        const card = <SponsorCard sponsor={sponsor} active={false} />;
        return link ? (
          <a
            key={sponsor.id}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={sponsor.name}
            className="shrink-0 snap-center"
          >
            {card}
          </a>
        ) : (
          <div key={sponsor.id} className="shrink-0 snap-center">
            {card}
          </div>
        );
      })}
    </div>
  );
}
