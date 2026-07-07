"use client";

import { useSyncExternalStore } from "react";

let cached: boolean | null = null;

/** Deteksi dukungan WebGL sekali per sesi — dipakai sebelum mount canvas r3f. */
function canUseWebGL(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    cached = false;
  }
  return cached;
}

const emptySubscribe = () => () => {};

/**
 * Dukungan WebGL sebagai external store — SSR-safe (server: false).
 * Section WAJIB tetap render layer foto statis kalau ini false
 * (REFACTOR-02 fallback: no crash, no blank section).
 */
export function useWebGLSupport(): boolean {
  return useSyncExternalStore(emptySubscribe, canUseWebGL, () => false);
}

/* --------------------------- Spring fisik manual -------------------------- */

import { spring3D } from "@/lib/motion";

/** State damped harmonic oscillator — simpan di ref, mutasi per frame */
export type SpringState = { p: number; v: number };

/**
 * Satu langkah integrasi spring (semi-implicit Euler) — dipakai gerak
 * per-frame di rAF (blob reveal hero): mengejar target dengan bobot &
 * inersia nyata, bukan tween linear/easing default.
 */
export function springStep(s: SpringState, target: number, dt: number): void {
  s.v += (spring3D.stiffness * (target - s.p) - spring3D.damping * s.v) * dt;
  s.p += s.v * dt;
}
