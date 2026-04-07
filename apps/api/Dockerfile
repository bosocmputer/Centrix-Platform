FROM node:22-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules || true
COPY . .
RUN cd packages/database && pnpm exec prisma generate
RUN cd apps/api && pnpm build

FROM node:22-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Prisma client
COPY --from=builder /app/packages/database/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./.prisma

EXPOSE 5000

CMD ["node", "dist/index.js"]
