"use client";

import { useEffect, useRef } from "react";
import { boidsConfig } from "@/lib/motion";

type Boid = { x: number; y: number; vx: number; vy: number };

/* Tuning flock — jarak/bobot steering (px & px/s), bukan timing animasi */
const VIEW_RADIUS = 64;
const SEP_RADIUS = 22;
const MAX_SPEED = 70;
const MIN_SPEED = 32;
const W_COHESION = 0.35;
const W_ALIGN = 0.6;
const W_SEPARATION = 1.1;
const EDGE_MARGIN = 40;
const EDGE_TURN = 90;
const MAX_DPR = 1.5;

/**
 * "Burung terbang" hero — boids canvas 2D (DESIGN.md §6 hard rules):
 * max 60 desktop / 25 mobile, rAF pause saat off-viewport / tab hidden,
 * tidak mount sama sekali di prefers-reduced-motion.
 */
export function ParticleCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let boids: Boid[] = [];
    let rafId = 0;
    let running = false;
    let inView = true;
    let lastTime = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = () => {
      const count =
        width < 768 ? boidsConfig.countMobile : boidsConfig.countDesktop;
      boids = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        };
      });
    };

    const step = (dt: number) => {
      for (const b of boids) {
        let cx = 0;
        let cy = 0;
        let ax = 0;
        let ay = 0;
        let sx = 0;
        let sy = 0;
        let neighbors = 0;

        for (const other of boids) {
          if (other === b) continue;
          const dx = other.x - b.x;
          const dy = other.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > VIEW_RADIUS || dist === 0) continue;
          neighbors++;
          cx += other.x;
          cy += other.y;
          ax += other.vx;
          ay += other.vy;
          if (dist < SEP_RADIUS) {
            sx -= dx / dist;
            sy -= dy / dist;
          }
        }

        if (neighbors > 0) {
          b.vx += ((cx / neighbors - b.x) * W_COHESION * dt) / 10;
          b.vy += ((cy / neighbors - b.y) * W_COHESION * dt) / 10;
          b.vx += (ax / neighbors - b.vx) * W_ALIGN * dt;
          b.vy += (ay / neighbors - b.vy) * W_ALIGN * dt;
          b.vx += sx * W_SEPARATION * MAX_SPEED * dt;
          b.vy += sy * W_SEPARATION * MAX_SPEED * dt;
        }

        // Belok halus menjauhi tepi (jangan wrap — burung, bukan asteroid)
        if (b.x < EDGE_MARGIN) b.vx += EDGE_TURN * dt;
        if (b.x > width - EDGE_MARGIN) b.vx -= EDGE_TURN * dt;
        if (b.y < EDGE_MARGIN) b.vy += EDGE_TURN * dt;
        if (b.y > height - EDGE_MARGIN) b.vy -= EDGE_TURN * dt;

        // Clamp kecepatan
        const speed = Math.hypot(b.vx, b.vy) || 1;
        const clamped = Math.min(Math.max(speed, MIN_SPEED), MAX_SPEED);
        b.vx = (b.vx / speed) * clamped;
        b.vy = (b.vy / speed) * clamped;

        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(229, 226, 225, 0.65)";
      for (const b of boids) {
        const angle = Math.atan2(b.vy, b.vx);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(angle);
        // Siluet burung kecil: segitiga pipih
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(-3, 2.2);
        ctx.lineTo(-1.5, 0);
        ctx.lineTo(-3, -2.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    };

    const loop = (time: number) => {
      if (!running) return;
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      step(dt);
      draw();
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || !inView || document.hidden) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      if (inView) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => {
      resize();
      if (boids.length === 0) spawn();
    });
    ro.observe(canvas);

    resize();
    spawn();
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas ref={canvasRef} aria-hidden="true" className={className} />
  );
}
