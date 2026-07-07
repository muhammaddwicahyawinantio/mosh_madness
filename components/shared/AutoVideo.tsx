"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

type AutoVideoProps = {
  src: string;
  className?: string;
  /**
   * eager = video dekoratif yang HARUS selalu tampil & loop tanpa henti
   * (mis. kartu kontak): preload penuh biar frame kebaca + terus play
   * selama tidak reduced-motion, tanpa nunggu in-view. Default lazy:
   * play saat in-view saja (hemat CPU/baterai untuk video berat).
   */
  eager?: boolean;
};

/**
 * Video dekoratif autoplay-loop-muted-playsinline (FRONTEND.md §2.2/§2.4).
 * Default: play hanya saat in-view (hemat CPU/baterai) dan TIDAK autoplay
 * saat prefers-reduced-motion — frame pertama jadi poster statis.
 * eager: preload penuh + terus play (video kontak yang tidak boleh stop).
 */
export function AutoVideo({ src, className, eager = false }: AutoVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { margin: "100px 0px" });
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // eager → anggap selalu in-view supaya tidak pernah dipause saat visible
  const shouldPlay = (eager || inView) && !reducedMotion;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (shouldPlay) {
      // play() bisa reject (autoplay policy) — biarkan, frame statis cukup
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [shouldPlay]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      // eager: preload penuh + autoPlay atribut → frame pasti kerender
      // (fix "video tidak tampil") & stabil di Windows/desktop.
      autoPlay={eager}
      preload={eager ? "auto" : "metadata"}
      aria-hidden="true"
      className={cn("object-cover", className)}
    />
  );
}
