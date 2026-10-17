# ============================================================
# Hardened Dockerfile for Auth Service (Node.js 22)
# ============================================================
# Security features:
#   - Multi-stage build (builder vs runtime - smaller attack surface)
#   - node:22-alpine base (minimal OS footprint)
#   - Non-root user (appuser:1001)
#   - No new privileges escalation
#   - Read-only filesystem friendly
#   - Build args for provenance labeling (SLSA)
#   - Health check built in
#   - Explicit COPY instead of COPY . . to avoid secrets leakage
# ============================================================

# ---- Stage 1: Dependency Builder ----
FROM node:22-alpine AS builder

# Install only what is needed for building
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy dependency manifests first (maximizes layer cache hits)
COPY package*.json ./

# npm install: production dependencies
RUN npm install --omit=dev --ignore-scripts && \
    npm cache clean --force

# ---- Stage 2: Hardened Runtime ----
FROM node:22-alpine AS production

# Build args for SLSA-style image labeling
ARG BUILD_DATE
ARG VCS_REF
ARG SERVICE_PORT=5001

# OCI standard image labels
LABEL org.opencontainers.image.title="POS Auth Service" \
      org.opencontainers.image.description="Authentication and authorization microservice" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.vendor="POS System" \
      org.opencontainers.image.licenses="MIT"

# Install dumb-init for proper signal handling in containers
# (prevents zombie processes, ensures graceful shutdown)
RUN apk add --no-cache dumb-init wget && \
    # Remove apk cache to reduce image size
    rm -rf /var/cache/apk/*

# Create non-root group and user
# UID/GID 1001 is commonly used; never use root (UID 0)
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup -h /app -s /sbin/nologin

WORKDIR /app

# Copy only production node_modules from builder (no devDeps, no cache)
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules

# Copy application source files explicitly
# NEVER use: COPY . . (may include .env, secrets, test files)
COPY --chown=appuser:appgroup server.js ./
COPY --chown=appuser:appgroup routes/ ./routes/
COPY --chown=appuser:appgroup controllers/ ./controllers/
COPY --chown=appuser:appgroup models/ ./models/
COPY --chown=appuser:appgroup package.json ./

# Ensure no sensitive files exist in the image
RUN find /app -name ".env*" -not -name ".env.example" -delete 2>/dev/null || true && \
    find /app -name "*.test.js" -delete 2>/dev/null || true && \
    find /app -name "*.spec.js" -delete 2>/dev/null || true

# Set ownership and restrict permissions
RUN chown -R appuser:appgroup /app && \
    chmod -R 550 /app && \
    chmod -R 440 /app/package.json

# Switch to non-root user - mandatory for CIS benchmarks
USER appuser

# Expose service port
EXPOSE ${SERVICE_PORT}

# Built-in health check - aligns with docker-compose.yml health checks
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider \
      http://localhost:${SERVICE_PORT}/health || exit 1

# Use dumb-init as PID 1 to handle signals correctly
# This ensures SIGTERM propagates to node process and enables graceful shutdown
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
