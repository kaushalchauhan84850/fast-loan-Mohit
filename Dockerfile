# syntax=docker/dockerfile:1

# ---------- Build arguments ----------
ARG NODE_VERSION=20-alpine
ARG NGINX_VERSION=1.27-alpine

# ---------- Stage 1: build the Vite bundle ----------
FROM node:${NODE_VERSION} AS build

WORKDIR /app

# Install dependencies first so this layer caches independently of source changes
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Build the production bundle
COPY . .
RUN npm run build

# ---------- Stage 2: serve with Nginx ----------
FROM nginx:${NGINX_VERSION}

LABEL org.opencontainers.image.title="TrustLend Frontend" \
      org.opencontainers.image.description="Single-cycle digital lending platform — React + Vite served by Nginx" \
      org.opencontainers.image.licenses="UNLICENSED"

# SPA routing (React Router fallback), gzip and hashed-asset caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets; nginx:alpine's www-data user only needs read access
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
