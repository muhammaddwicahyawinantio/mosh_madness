import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker/Railway (BACKEND.md §8) — server.js self-contained di .next/standalone
  output: "standalone",
  // Next 16: tiap quality non-default (75) wajib didaftar. Hero pakai 90.
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
