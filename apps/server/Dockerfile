# 1. Use an official Node.js image as the base image
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-bookworm-slim AS base

RUN apt-get update && apt-get install -y \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
    libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2 \
    fonts-liberation ca-certificates \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*
    
RUN npm install -g pnpm turbo

# 2. Prune the monorepo to only include the necessary files for the server app
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune --scope=server --docker

# 3. Builder stage to install dependencies and build the application
FROM base AS builder
ARG BUILD_MODE=local
ARG APP_DOMAIN
ARG APP_WEBSITE_DOMAIN
ARG APP_ADMIN_DOMAIN

WORKDIR /app

COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/tsconfig.json ./tsconfig.json

RUN pnpm install --frozen-lockfile

ENV APP_DOMAIN=$APP_DOMAIN
ENV APP_WEBSITE_DOMAIN=$APP_WEBSITE_DOMAIN
ENV APP_ADMIN_DOMAIN=$APP_ADMIN_DOMAIN

COPY .env.example ./.env
COPY apps/server/.env.${BUILD_MODE}.example ./apps/server/.env

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
COPY .gitignore .gitignore

RUN pnpm db:generate
RUN turbo build --filter=server

# 4. Final stage to create a minimal image for running the server application
FROM base AS runner

USER node

WORKDIR /app
COPY --from=builder --chown=node:node /app .

WORKDIR /app/packages/prisma

WORKDIR /app/apps/server

ARG APP_PORT=3000
ENV NODE_ENV=production
ENV PORT=${APP_PORT}
ENV HOSTNAME=0.0.0.0
EXPOSE ${APP_PORT}

CMD ["/bin/sh", "-c", "node dist/main.js"]