"use client";

import { useEffect, useRef, type RefObject } from "react";
import { SafeImage } from "@/components/shared/SafeImage";
import { ASSETS } from "@/lib/constants";
import { heroReveal } from "@/lib/motion";
import { springStep, type SpringState } from "@/lib/webgl";

type Props = {
  /** Section hero — sumber pointer event & ukuran area reveal */
  sectionRef: RefObject<HTMLElement | null>;
};

/**
 * Hero soft reveal (REVISI 2) — bentuk blob/lingkaran kursor DIHILANGKAN:
 * mask radial-gradient dengan feather sangat lebar, jadi terasa seperti
 * cahaya lembut yang membuka foto garment putih di bawah foto hitam.
 * Posisi mengikuti kursor dengan lag berbobot (spring fisik) dan
 * ditarik lembut ke titik tengah objek manusia (heroReveal.center).
 *
 * Murni DOM+CSS mask (tanpa SVG filter/WebGL). rAF hanya hidup saat
 * pointer di hero dan berhenti sendiri setelah reveal kolaps. Hanya
 * dirender pada device hover-capable tanpa prefers-reduced-motion
 * (gate di HeroSection).
 */
export function HeroReveal({ sectionRef }: Props) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const layer = layerRef.current;
    if (!section || !layer) return;

    let rect = section.getBoundingClientRect();
    const phys = {
      x: { p: rect.width / 2, v: 0 } as SpringState,
      y: { p: rect.height / 2, v: 0 } as SpringState,
      tx: rect.width / 2,
      ty: rect.height / 2,
      r: 0,
      active: false,
    };

    let rafId = 0;
    let running = false;
    let lastTime = 0;

    const apply = () => {
      layer.style.setProperty("--mx", `${phys.x.p.toFixed(1)}px`);
      layer.style.setProperty("--my", `${phys.y.p.toFixed(1)}px`);
      layer.style.setProperty("--mr", `${Math.max(phys.r, 0).toFixed(1)}px`);
    };

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 1 / 30);
      lastTime = time;
      const f = dt * 60; // normalisasi lerp per-frame ke 60fps

      // Titik reveal mengejar target via spring — lag berbobot
      springStep(phys.x, phys.tx, dt);
      springStep(phys.y, phys.ty, dt);

      // Radius tumbuh saat hover, kolaps saat pointer keluar
      const targetR = phys.active
        ? Math.min(rect.width, rect.height) * heroReveal.radius
        : 0;
      phys.r += (targetR - phys.r) * heroReveal.radiusLerp * f;

      apply();

      // Berhenti sendiri setelah kolaps penuh — tanpa rAF idle
      if (!phys.active && phys.r < 0.4) {
        phys.r = 0;
        apply();
        running = false;
        return;
      }
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      rect = section.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      // Target ditarik lembut ke titik tengah objek manusia di foto
      const cx = rect.width * heroReveal.center.x;
      const cy = rect.height * heroReveal.center.y;
      phys.tx = px + (cx - px) * heroReveal.centerBias;
      phys.ty = py + (cy - py) * heroReveal.centerBias;
      phys.active = true;
      start();
    };

    const onPointerLeave = () => {
      phys.active = false;
      start(); // pastikan loop hidup untuk animasi kolaps
    };

    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerleave", onPointerLeave);

    return () => {
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(rafId);
      running = false;
    };
  }, [sectionRef]);

  // Feather lebar: solid sampai featherStart%, lalu gradasi panjang ke
  // transparan — tidak ada tepi lingkaran yang terlihat
  const maskGradient = `radial-gradient(circle var(--mr, 0px) at var(--mx, 50%) var(--my, 50%), rgb(0 0 0) ${heroReveal.featherStart}%, transparent 100%)`;

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        maskImage: maskGradient,
        WebkitMaskImage: maskGradient,
      }}
    >
      <SafeImage
        src={ASSETS.hero.white}
        alt="Mosh Madness — garment putih"
        fill
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
