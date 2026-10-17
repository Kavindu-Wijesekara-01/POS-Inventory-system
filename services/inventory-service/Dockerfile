# ---- Build Stage ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# ---- Production Stage ----
FROM node:22-alpine

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN rm -f .env .env.example
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5002

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5002/health || exit 1

CMD ["node", "server.js"]
