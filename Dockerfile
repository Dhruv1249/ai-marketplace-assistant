# ------------------------------------------------------------
# 1. Base Image
# ------------------------------------------------------------
FROM node:20-alpine AS base

# ------------------------------------------------------------
# 2. Dependencies
# ------------------------------------------------------------
# ------------------------------------------------------------
# 2. Dependencies (production only)
# ------------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

# ------------------------------------------------------------
# 3. Builder (installs dev deps too)
# ------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy prod deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Install dev deps (like TypeScript) on top
RUN npm install --only=dev --ignore-scripts

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# ------------------------------------------------------------
# 4. Runner (production image)
# ------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy public assets and standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensure permissions for .next folder
RUN mkdir -p .next && chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "server.js"]
