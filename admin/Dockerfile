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
COPY --from=builder /app/dist /usr/share/nginx/html
# Create custom Nginx configuration directly
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    # Gzip Compression\n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_min_length 10240;\n\
    gzip_proxied expired no-cache no-store private auth;\n\
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;\n\
    gzip_disable "MSIE [1-6].";\n\
    \n\
    # Security Headers\n\
    add_header X-Frame-Options "SAMEORIGIN";\n\
    add_header X-XSS-Protection "1; mode=block";\n\
    add_header X-Content-Type-Options "nosniff";\n\
    add_header Referrer-Policy "no-referrer-when-downgrade";\n\
    add_header Content-Security-Policy "default-src '\''self'\'' http: https: data: blob: '\''unsafe-inline'\''";\n\
    \n\
    # Buffering Optimizations\n\
    client_body_buffer_size 10K;\n\
    client_header_buffer_size 1k;\n\
    client_max_body_size 8m;\n\
    large_client_header_buffers 4 8k;\n\
    \n\
    location / {\n\
    try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    # Cache static assets\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\n\
    expires 30d;\n\
    add_header Cache-Control "public, no-transform";\n\
    }\n\
    \n\
    error_page 500 502 503 504 /50x.html;\n\
    location = /50x.html {\n\
    root /usr/share/nginx/html;\n\
    }\n\
    }' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Uptime: Lightweight health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
