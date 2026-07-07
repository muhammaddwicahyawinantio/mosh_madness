"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { AutoVideo } from "@/components/shared/AutoVideo";
import { SplitText } from "@/components/shared/SplitText";
import { BRAND } from "@/lib/constants";
import { revealStagger, revealUp, viewportOnce, wipeUp } from "@/lib/motion";

/**
 * S4 Contact preview di home (FRONTEND.md §2.5) — REVISI: dibikin standar
 * & ringkas. Satu reel kanan.mp4 (loop tanpa henti) sebagai aksen + CTA ke
 * /contact tempat form lengkap berada. Layout 2 kolom di desktop, menumpuk
 * di mobile.
 */
export function ContactPreview() {
  return (
    <section
      id="contact"
      aria-label="Kontak"
      className="relative mx-auto max-w-[1400px] px-4 py-28 md:px-8 md:py-32"
    >
      <span
        aria-hidden="true"
        className="type-label text-vertical absolute left-2 top-32 hidden text-outline lg:block"
      >
        Kontak / {BRAND.sku}
      </span>

      <motion.div
        variants={revealStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
      >
        {/* Copy + CTA */}
        <div>
          <motion.p variants={revealUp} className="type-label mb-6 text-accent-666">
            003 / Kontak
          </motion.p>
          <h2 className="type-headline-lg text-primary">
            <SplitText text="Masuk ke barisan" />
          </h2>
          <motion.p
            variants={revealUp}
            className="type-body-lg mt-8 max-w-md text-on-surface-variant"
          >
            Kolaborasi, stok, atau sekadar teriak — pintunya di halaman kontak.
          </motion.p>

          <motion.div variants={revealUp} className="mt-12">
            <Link
              href="/contact"
              className="type-label inline-flex items-center gap-2 border border-primary bg-primary px-8 py-4 text-on-primary hover:bg-transparent hover:text-primary"
            >
              Kirim pesan <ArrowUpRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* Reel aksen — kanan.mp4, loop tanpa henti + reveal wipe */}
        <motion.figure
          variants={wipeUp}
          aria-hidden="true"
          className="border border-outline-variant bg-white/5 p-2"
        >
          <AutoVideo
            src="/assets/videos/kanan.mp4"
            className="aspect-video w-full border border-outline-variant"
          />
          <figcaption className="type-label px-1 pb-1 pt-3 text-on-surface-variant">
            Reel / kanan — 666
          </figcaption>
        </motion.figure>
      </motion.div>
    </section>
  );
}
