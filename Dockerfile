# ─── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN npm ci --frozen-lockfile

# ─── Stage 2: Build frontend ─────────────────────────────────────────────────
FROM node:20-alpine AS build-frontend

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY frontend/ ./frontend/
COPY package.json ./

WORKDIR /app/frontend
RUN npm run build

# ─── Stage 3: Build backend ──────────────────────────────────────────────────
FROM node:20-alpine AS build-backend

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/
COPY package.json ./

WORKDIR /app/backend
RUN npm run build

# ─── Stage 4: Production image ───────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy compiled backend
COPY --from=build-backend --chown=nodejs:nodejs /app/backend/dist ./dist
COPY --from=build-backend --chown=nodejs:nodejs /app/backend/package.json ./

# Copy built frontend as static files served by Express
COPY --from=build-frontend --chown=nodejs:nodejs /app/frontend/dist ./public

# Install only production deps
RUN npm ci --only=production --frozen-lockfile && npm cache clean --force

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# Build metadata
ARG BUILD_DATE
ARG GIT_SHA
LABEL build-date=$BUILD_DATE
LABEL git-sha=$GIT_SHA
LABEL org.opencontainers.image.title="Claude Code Demo"
LABEL org.opencontainers.image.description="AI-assisted development best practices showcase"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
