FROM node:22-alpine
RUN npm install -g pnpm
WORKDIR /app

# Install deps
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --no-frozen-lockfile

# Copy source and build
COPY . .
RUN cd packages/database && pnpm exec prisma generate
RUN cd apps/api && pnpm build

ENV NODE_ENV=production
EXPOSE 5000
WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]
