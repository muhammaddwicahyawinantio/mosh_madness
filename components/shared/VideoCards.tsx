"use client";

import { motion } from "motion/react";
import { AutoVideo } from "@/components/shared/AutoVideo";
import { duration, easeBrand, viewportOnce, wipeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** kiri.mp4 kartu kiri-atas, kanan.mp4 kartu kanan-bawah (FRONTEND.md §2.4) */
const CARDS = [
  { src: "/assets/videos/kiri.mp4", label: "Reel / kiri", offset: "" },
  { src: "/assets/videos/kanan.mp4", label: "Reel / kanan", offset: "lg:mt-32" },
] as const;

/**
 * VideoCards — 2 kartu video komposisi diagonal (desktop) / stack
 * vertikal (mobile). Reveal wipe on-scroll + hover lift halus; backdrop
 * abu tipis + border tajam. Dipakai di Sponsor, contact preview, /contact.
 */
export function VideoCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-2 lg:gap-8", className)}>
      {CARDS.map((card) => (
        <motion.div
          key={card.src}
          variants={wipeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className={card.offset}
        >
          <motion.figure
            whileHover={{ y: -6 }}
            transition={{ duration: duration.fast, ease: easeBrand }}
            className="border border-outline-variant bg-white/5 p-2"
          >
            <AutoVideo
              src={card.src}
              className="aspect-video w-full border border-outline-variant"
            />
            <figcaption className="type-label px-1 pb-1 pt-3 text-on-surface-variant">
              {card.label} — 666
            </figcaption>
          </motion.figure>
        </motion.div>
      ))}
    </div>
  );
}
