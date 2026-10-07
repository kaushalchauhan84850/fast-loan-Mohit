# ---------- Stage 1: build the Vite bundle ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first so this layer caches independently of source changes
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Build the production bundle
COPY . .
RUN npm run build

# ---------- Stage 2: serve with Nginx ----------
FROM nginx:1.27-alpine

# SPA routing: unknown paths must fall back to index.html (React Router),
# plus gzip and hashed-asset caching.
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
