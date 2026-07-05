"use client";

import { motion } from "motion/react";
import {
  duration,
  easeBrand,
  staggerChar,
  viewportOnce,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

type SplitTextProps = {
  text: string;
  className?: string;
  /** Delay awal sebelum karakter pertama (detik) */
  delay?: number;
  /** true = animate saat masuk viewport (default); false = langsung saat mount */
  onView?: boolean;
  "aria-hidden"?: boolean;
};

/**
 * Headline reveal per karakter (ala React Bits SplitText) — tiap huruf
 * naik dari clip line dengan stagger rapat. Hanya transform + opacity.
 * Teks utuh tetap tersedia untuk screen reader via aria-label.
 */
export function SplitText({
  text,
  className,
  delay = 0,
  onView = true,
}: SplitTextProps) {
  const words = text.split(" ");
  let charIndex = 0;

  return (
    <motion.span
      aria-label={text}
      role="text"
      initial="hidden"
      {...(onView
        ? { whileInView: "visible", viewport: viewportOnce }
        : { animate: "visible" })}
      className={cn("inline-block", className)}
    >
      {words.map((word, wi) => (
        <span
          key={`${word}-${wi}`}
          aria-hidden="true"
          /* pb/-mb trick: clip tanpa motong descender blackletter */
          className="inline-block overflow-hidden whitespace-pre pb-[0.08em] -mb-[0.08em] align-bottom"
        >
          {(wi < words.length - 1 ? `${word} ` : word)
            .split("")
            .map((char, ci) => {
              const i = charIndex++;
              return (
                <motion.span
                  key={ci}
                  className="inline-block whitespace-pre will-change-transform"
                  variants={{
                    hidden: { y: "110%", opacity: 0 },
                    visible: {
                      y: "0%",
                      opacity: 1,
                      transition: {
                        delay: delay + i * staggerChar,
                        duration: duration.base,
                        ease: easeBrand,
                      },
                    },
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
        </span>
      ))}
    </motion.span>
  );
}
