import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker/Railway (BACKEND.md §8) — server.js self-contained di .next/standalone
  output: "standalone",
};

export default nextConfig;
