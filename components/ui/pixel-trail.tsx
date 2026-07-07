"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

interface Pixel {
  id: number;
  x: number;
  y: number;
  opacity: number;
  age: number;
}

const PIXEL_SIZE = 12;
const TRAIL_LENGTH = 40;
const FADE_SPEED = 0.04;

/**
 * Pixel cursor trail — jejak kotak putih yang memudar mengikuti kursor.
 * Diadaptasi jadi overlay site-wide: pointer-events-none (tidak memblokir
 * klik), listener di window (bukan container), kursor native tetap tampak.
 * Touch device & prefers-reduced-motion: tidak render sama sekali.
 */
export function PixelCursorTrail() {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const pixelIdRef = useRef(0);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  const hoverCapable = useMediaQuery("(hover: hover)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const active = hoverCapable && !reducedMotion;

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const { clientX: x, clientY: y } = e;
    const dx = x - lastPositionRef.current.x;
    const dy = y - lastPositionRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > PIXEL_SIZE) {
      const newPixel: Pixel = {
        id: pixelIdRef.current++,
        x,
        y,
        opacity: 1,
        age: 0,
      };
      setPixels((prev) => [...prev.slice(-TRAIL_LENGTH), newPixel]);
      lastPositionRef.current = { x, y };
    }
  }, []);

  useEffect(() => {
    if (!active) return;

    const animate = () => {
      setPixels((prev) => {
        // Idle: kembalikan referensi sama → React skip re-render
        if (prev.length === 0) return prev;
        return prev
          .map((pixel) => ({
            ...pixel,
            opacity: pixel.opacity - FADE_SPEED,
            age: pixel.age + 1,
          }))
          .filter((pixel) => pixel.opacity > 0);
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [active, handlePointerMove]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
    >
      {pixels.map((pixel) => {
        // Makin tua makin kecil
        const sizeMultiplier = Math.max(0.3, 1 - pixel.age / 100);
        const currentSize = PIXEL_SIZE * sizeMultiplier;

        return (
          <div
            key={pixel.id}
            className="absolute bg-foreground"
            style={{
              left: pixel.x - currentSize / 2,
              top: pixel.y - currentSize / 2,
              width: currentSize,
              height: currentSize,
              opacity: pixel.opacity,
              transition: "width 0.1s ease-out, height 0.1s ease-out",
            }}
          />
        );
      })}
    </div>
  );
}
