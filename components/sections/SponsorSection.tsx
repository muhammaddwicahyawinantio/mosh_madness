"use client";

import useSWR from "swr";
import { motion } from "motion/react";
import { SafeImage } from "@/components/shared/SafeImage";
import { BRAND } from "@/lib/constants";
import { jsonFetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { revealStagger, revealUp, viewportOnce } from "@/lib/motion";
import type { SponsorDTO } from "@/types/api";

/** Auto-update: foto/sponsor baru dari admin nongol tanpa reload manual */
const REFRESH_MS = 20_000;

/**
 * Link default per logo statis — dipakai kalau admin belum isi field link
 * di CMS. Admin tetap bisa override lewat /admin/sponsors (link DB menang).
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

export function SponsorSection() {
  const { data } = useSWR<SponsorDTO[]>("/api/sponsors", jsonFetcher, {
    refreshInterval: REFRESH_MS,
    revalidateOnFocus: true,
  });
  const sponsors = data ?? [];

  return (
    <section
      id="sponsor"
      aria-label="Didukung oleh"
      className="relative border-t border-outline-variant bg-surface-lowest"
    >
      {/* Konten — background polos sesuai tema (surface-lowest) */}
      <div className="relative mx-auto max-w-[1600px] px-4 py-10 md:px-8 md:py-14">
        <motion.div
          variants={revealStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {/* Headline utama */}
          <motion.p variants={revealUp} className="type-meta mb-2 text-accent-666">
            004 / Didukung oleh
          </motion.p>
          <motion.h2
            variants={revealUp}
            className="type-headline-lg type-metal text-primary max-md:text-xl md:text-3xl"
          >
            Partners
          </motion.h2>

          {/* "Sponsored by" + subjudul — bagian dari headline block */}
          <motion.div variants={revealUp} className="mt-4 border-t border-outline-variant pt-4">
            <p className="type-meta text-base text-accent-666 md:text-lg">
              Sponsored by
            </p>
            <p className="type-metal mt-2 text-center text-xl text-on-surface-variant md:text-2xl">
              Inovasi Digital Untuk Kemandirian UMKM Lokal
            </p>
          </motion.div>
        </motion.div>

        {/* Logo grid — hanya kalau ada sponsor aktif */}
        {sponsors.length > 0 && (
          <motion.div
            variants={revealStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 md:mt-10 md:gap-12"
          >
            {sponsors.map((sponsor) => {
              const link = resolveSponsorLink(sponsor);

              const logoCard = (
                <motion.div
                  key={sponsor.id}
                  variants={revealUp}
                  className={cn(
                    "group relative flex h-[150px] w-[150px] flex-col items-center justify-center gap-2 md:h-[180px] md:w-[180px]",
                    "transition-transform duration-300 hover:-translate-y-1",
                  )}
                >
                  <div className="relative h-[130px] w-[130px] md:h-[160px] md:w-[160px]">
                    <SafeImage
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      fill
                      sizes="(max-width: 768px) 130px, 160px"
                      className="object-contain transition-opacity duration-300 group-hover:opacity-70"
                    />
                  </div>
                  <span className="type-label whitespace-nowrap text-[10px] text-on-surface-variant md:text-xs">
                    {sponsor.name}
                  </span>
                </motion.div>
              );

              return link ? (
                <a
                  key={sponsor.id}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={sponsor.name}
                >
                  {logoCard}
                </a>
              ) : (
                <div key={sponsor.id}>{logoCard}</div>
              );
            })}
          </motion.div>
        )}

        <p className="type-label pb-2 pt-8 text-center text-xs text-outline-variant md:text-sm">
          {BRAND.sku} / {BRAND.estCode} / {BRAND.location}
        </p>
      </div>
    </section>
  );
}
