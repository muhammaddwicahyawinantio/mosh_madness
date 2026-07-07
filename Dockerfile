# Mosh Madness — multi-stage build (BACKEND.md §8)
# Prisma engine-free (queryCompiler + driverAdapters): tidak ada download
# query engine; schema engine ikut paket `prisma` untuk migrate deploy.

FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:22-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0
# Standalone: server.js + node_modules runtime yang sudah dipangkas
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
# Prisma CLI + schema/migrations — untuk `migrate deploy` saat release
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=node:node /app/node_modules/@prisma ./node_modules/@prisma

USER node
EXPOSE 3000
# Railway: set env UPLOAD_DIR=/data/uploads + mount Volume ke /data/uploads.
# Pre-deploy/release command: node node_modules/prisma/build/index.js migrate deploy
CMD ["node", "server.js"]
