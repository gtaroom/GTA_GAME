# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build-time environment variables
ARG VITE_APP_API_URL
ARG VITE_SERVER_URI

ENV VITE_APP_API_URL=$VITE_APP_API_URL
ENV VITE_SERVER_URI=$VITE_SERVER_URI

# Build the Vite application
RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine

# Copy built files from builder
# Copy custom Nginx configuration
#COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Uptime: Lightweight health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
