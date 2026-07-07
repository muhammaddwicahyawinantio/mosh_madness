# =============================================================================
# Mosh Madness — Multi-stage Docker build untuk Railway
#
# Perubahan penting:
#   - apt install openssl libssl-dev: fix "Prisma failed to detect libssl"
#   - prisma generate dilakukan di stage builder (bukan deps) setelah COPY source
#   - prisma migrate deploy dijalankan di CMD (runtime), bukan saat build,
#     karena DATABASE_URL hanya tersedia di runtime Railway, bukan build time.
#   - Salin node_modules/.prisma (generated client) ke runner stage.
# =============================================================================

# ---------- Stage 1: deps (install packages saja) ----------
FROM node:22-slim AS deps
WORKDIR /app

# Fix: libssl dibutuhkan Prisma engine di semua stage
RUN apt-get update && \
    apt-get install -y openssl libssl-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# Install semua deps (termasuk devDeps untuk build)
RUN npm ci

# ---------- Stage 2: builder ----------
FROM node:22-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && \
    apt-get install -y openssl libssl-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (butuh schema.prisma + engine sudah ada di node_modules)
# DATABASE_URL tidak dibutuhkan saat generate, hanya saat runtime.
RUN npx prisma generate

# Build Next.js (prebuild juga akan run prisma generate via "prebuild" script)
RUN npm run build

# ---------- Stage 3: runner (production image) ----------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# Fix: libssl WAJIB ada di runner agar Prisma engine bisa berjalan
RUN apt-get update && \
    apt-get install -y openssl libssl-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Salin output standalone Next.js
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# Salin Prisma: schema + migrations (untuk migrate deploy) + generated client
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=node:node /app/node_modules/prisma ./node_modules/prisma

USER node
EXPOSE 3000

# migrate deploy: terapkan migrasi yang belum dijalankan, lalu start server
# Ini berjalan SETELAH container Railway mendapat DATABASE_URL dari environment.
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
