# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies for build
RUN npm ci

# Copy source code and config
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Security & Uptime: Add tini for better signal handling
RUN apk add --no-cache tini

# Security: Create a specific production user with UID 1001 to match host permissions
RUN addgroup -g 1001 node-prod && \
    adduser -u 1001 -G node-prod -s /bin/sh -D node-prod

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Ensure the app directory is owned by the new user
RUN chown -R node-prod:node-prod /app

# Security: Run as non-root user
USER node-prod

# Expose the application port
EXPOSE 3000

# Optimization: Use production environment
ENV NODE_ENV=production

# Uptime: Tini handles zombie processes and signal passing
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
