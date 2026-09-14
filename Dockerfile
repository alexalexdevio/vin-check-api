FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.build.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
ENV PSQL_DB_URL="postgresql://user:password@localhost:5432/db"
RUN npm run build

FROM base AS migrator
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
USER node
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache dumb-init python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
    && apk del python3 make g++ \
    && npm cache clean --force

COPY --from=builder /app/dist ./dist

ARG PORT=5001
ENV PORT=${PORT}
EXPOSE ${PORT}

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- "http://127.0.0.1:${PORT}/v1/" || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/app.js"]
