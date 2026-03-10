# 1. Base image with Node.js and necessary tools
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-alpine AS base
RUN apk update && apk add --no-cache libc6-compat

RUN npm install -g pnpm turbo

# 2. Prune the monorepo to only include the necessary files for the website app
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune --scope=website --docker

# 3. Build the project
FROM base AS builder
ARG BUILD_MODE=production
ARG APP_HOSTNAME
ARG NEXT_PUBLIC_APP_DOMAIN
ARG NEXT_PUBLIC_ADMIN_DOMAIN
ARG NEXT_PUBLIC_SERVER_DOMAIN

WORKDIR /app

COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/tsconfig.json ./tsconfig.json

RUN pnpm install --frozen-lockfile

ENV APP_HOSTNAME=$APP_HOSTNAME
ENV NEXT_PUBLIC_APP_DOMAIN=$NEXT_PUBLIC_APP_DOMAIN
ENV NEXT_PUBLIC_ADMIN_DOMAIN=$NEXT_PUBLIC_ADMIN_DOMAIN
ENV NEXT_PUBLIC_SERVER_DOMAIN=$NEXT_PUBLIC_SERVER_DOMAIN

COPY .env.example ./.env
COPY apps/website/.env.${BUILD_MODE}.example ./apps/website/.env

COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/types ./types
COPY turbo.json turbo.json
COPY .gitignore .gitignore

RUN pnpm db:generate
RUN turbo build --filter=website

# 4. Runner stage to create a minimal image for running the built application
FROM base AS runner

WORKDIR /app
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

COPY --from=builder /app/apps/website/next.config.ts ./apps/website/next.config.ts
COPY --from=builder /app/apps/website/package.json ./apps/website/package.json

COPY --from=builder --chown=nextjs:nodejs /app/apps/website/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/website/.next/static ./apps/website/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/website/public ./apps/website/public
COPY --from=builder --chown=nextjs:nodejs /app/.env ./.env  
COPY --from=builder --chown=nextjs:nodejs /app/apps/website/.env ./apps/website/.env

WORKDIR /app/apps/website

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

USER nextjs

ARG APP_PORT
ENV PORT=${APP_PORT}
ENV HOSTNAME=0.0.0.0
EXPOSE ${APP_PORT}

CMD ["node", "server.js"]