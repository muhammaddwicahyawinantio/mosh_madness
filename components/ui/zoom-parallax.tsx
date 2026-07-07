"use client";

import { useScroll, useTransform, motion } from "motion/react";
import { useRef, type ReactNode } from "react";

interface ZoomParallaxItem {
  /** Konten yang dirender di setiap slot parallax */
  content: ReactNode;
  /** Klik handler (untuk buka link sponsor) */
  onClick?: () => void;
}

interface ZoomParallaxProps {
  items: ZoomParallaxItem[];
}

/**
 * ZoomParallax — scroll-driven zoom animation (referensi: zoom-parallax shadcn).
 *
 * Setiap item ditempatkan di layer absolute full-viewport, lalu inner div
 * diposisikan lewat `[&>div]:!` override. Saat scroll, masing-masing layer
 * di-scale dengan kecepatan berbeda → efek zoom parallax depth.
 *
 * Disesuaikan untuk 3 sponsor logo:
 * - Container h-[150vh] (compact, bukan 300vh)
 * - Ukuran image kecil (logo, bukan foto landscape)
 * - Klik item → buka link sponsor
 */
export function ZoomParallax({ items }: ZoomParallaxProps) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);

  const scales = [scale4, scale5, scale6];

  /*
   * Posisi per item — pola [&>div]:! untuk override inner div.
   * Item 0: center (default h-[15vh] w-[15vw], tidak ada override → tetap di tengah)
   * Item 1: kiri atas
   * Item 2: kanan bawah
   */
  const positionClasses = [
    // 0: center — default position, ukuran logo utama
    "",
    // 1: kiri atas — offset negatif
    "[&>div]:!-top-[18vh] [&>div]:!-left-[15vw] [&>div]:!h-[12vh] [&>div]:!w-[12vw]",
    // 2: kanan bawah — offset positif
    "[&>div]:!top-[18vh] [&>div]:!left-[15vw] [&>div]:!h-[12vh] [&>div]:!w-[12vw]",
  ];

  return (
    <div ref={container} className="relative h-[150vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {items.map((item, index) => {
          const scale = scales[index % scales.length];

          return (
            <motion.div
              key={index}
              style={{ scale }}
              className={`absolute top-0 flex h-full w-full items-center justify-center ${positionClasses[index] ?? ""}`}
            >
              <div
                className="relative h-[15vh] w-[15vw] cursor-pointer transition-opacity duration-300 hover:opacity-75"
                role={item.onClick ? "button" : undefined}
                tabIndex={item.onClick ? 0 : undefined}
                onClick={item.onClick}
                onKeyDown={(e) => {
                  if (item.onClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    item.onClick();
                  }
                }}
              >
                {item.content}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
