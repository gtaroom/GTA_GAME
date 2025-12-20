# Stage 1: Build
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy lockfile and package.json
COPY bun.lock package.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_IMAGE_URL
ARG NEXT_PUBLIC_VERIFF_API_KEY
ARG NEXT_PUBLIC_PRODUCT_ID

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_IMAGE_URL=$NEXT_PUBLIC_IMAGE_URL
ENV NEXT_PUBLIC_VERIFF_API_KEY=$NEXT_PUBLIC_VERIFF_API_KEY
ENV NEXT_PUBLIC_PRODUCT_ID=$NEXT_PUBLIC_PRODUCT_ID

# Build the Next.js application
RUN bun run build

# Stage 2: Production (Optimized Standalone)
FROM oven/bun:latest

WORKDIR /app

# Next.js standalone mode optimization
# Copy only the necessary files for the standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Security: Production environment
ENV NODE_ENV=production

# Uptime: Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD bun run server.js --help || exit 1

EXPOSE 3000

# Nextjs standalone entry point is server.js
CMD ["bun", "run", "server.js"]
