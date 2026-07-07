"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { heroBirds } from "@/lib/motion";

/**
 * Pseudo-random deterministik per index — nilai sama di server & client
 * (tanpa Math.random supaya tidak hydration mismatch).
 */
function rand(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Siluet burung terbang — path "M" gull, di-flap via CSS scaleY */
function BirdSilhouette({ size }: { size: number }) {
  return (
    <svg
      className="bird-flap fill-on-surface/95"
      width={size}
      height={(size * 20) / 32}
      viewBox="0 0 32 20"
      aria-hidden="true"
    >
      <path d="M16 9 C 11 2, 4 1, 0 6 C 5 5, 9 7, 12 11 C 13 13, 15 14, 16 12 C 17 14, 19 13, 20 11 C 23 7, 27 5, 32 6 C 28 1, 21 2, 16 9 Z" />
    </svg>
  );
}

type BirdVars = CSSProperties & Record<string, string | number>;

/**
 * Burung hero (REVISI hero) — CSS/Tailwind murni, tanpa canvas & tanpa
 * rAF: drift horizontal + bob + kepak via keyframes globals.css.
 * Saat scroll ke bawah melewati ambang, semua burung terbang ke atas
 * layar bersamaan (stagger halus); balik ke puncak halaman = kembali.
 * Konstanta timing dari lib/motion.ts (heroBirds) via CSS vars.
 */
export function HeroBirds() {
  const [flown, setFlown] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY;
      lastY = y;
      // Kabur HANYA saat gerakan scroll ke bawah; reset saat balik ke atas
      if (goingDown && y > heroBirds.scrollThreshold) setFlown(true);
      else if (y <= heroBirds.scrollThreshold) setFlown(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const birds = Array.from({ length: heroBirds.countDesktop }, (_, i) => {
    const drift =
      heroBirds.driftMin +
      rand(i, 1) * (heroBirds.driftMax - heroBirds.driftMin);
    const size =
      heroBirds.sizeMin + rand(i, 2) * (heroBirds.sizeMax - heroBirds.sizeMin);
    const reverse = rand(i, 3) > 0.5;
    return {
      top: 5 + rand(i, 4) * 52, // langit: 5%–57% tinggi hero
      size: Math.round(size),
      drift,
      // Delay negatif = burung tersebar di sepanjang lintasan sejak awal
      delay: -rand(i, 5) * drift,
      reverse,
      flyDelay: rand(i, 6) * heroBirds.flyUpStaggerMax,
      mobile: i < heroBirds.countMobile,
    };
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        flown ? "birds-away" : ""
      }`}
      style={{ "--birds-fly": `${heroBirds.flyUpDuration}s` } as BirdVars}
    >
      {birds.map((b, i) => (
        <div
          key={i}
          className={`bird-flyup absolute inset-x-0 ${
            b.mobile ? "" : "hidden md:block"
          }`}
          style={
            {
              top: `${b.top}%`,
              "--bird-fly-delay": `${b.flyDelay}s`,
            } as BirdVars
          }
        >
          <div
            className="bird-drift w-fit"
            style={
              {
                "--bird-drift": `${b.drift}s`,
                "--bird-delay": `${b.delay}s`,
                animationDirection: b.reverse ? "reverse" : "normal",
              } as BirdVars
            }
          >
            <div
              className="bird-bob"
              style={
                {
                  "--bird-bob": `${heroBirds.bob}s`,
                  "--bird-delay": `${-rand(i, 7) * heroBirds.bob}s`,
                } as BirdVars
              }
            >
              {/* Burung arah kiri: siluet di-mirror, kepak tetap jalan */}
              <div
                style={
                  {
                    "--bird-flap": `${heroBirds.flap}s`,
                    ...(b.reverse ? { transform: "scaleX(-1)" } : {}),
                  } as BirdVars
                }
              >
                <BirdSilhouette size={b.size} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
