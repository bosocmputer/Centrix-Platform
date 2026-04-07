# Centrix — The center of every conversation

> Unified messaging platform for e-commerce & customer support teams  
> ศูนย์กลางทุกบทสนทนา — LINE, Facebook, Instagram, Shopee, Lazada, TikTok Shop

---

## Stack

| Layer | Tech |
|-------|------|
| API | Fastify, Prisma, PostgreSQL, Redis (Pub/Sub) |
| Web | Next.js 16, Tailwind CSS, TypeScript |
| Realtime | WebSocket + Redis |
| Infra | Docker Compose |

**Monorepo (pnpm workspaces)**
```
centrix/
├── apps/
│   ├── api/          # Fastify REST API + WebSocket
│   └── web/          # Next.js dashboard
└── packages/
    ├── database/     # Prisma schema + migrations
    └── types/        # Shared TypeScript types
```

---

## Quick Start (Local)

```bash
pnpm install
docker compose up -d postgres redis
cd packages/database && pnpm exec prisma db push && npx tsx prisma/seed.ts
cd apps/api && pnpm dev        # :5000
cd apps/web && pnpm dev        # :3000
```

Login: `admin@demo.com` / `admin1234`

---

## Deploy (Docker)

```bash
docker compose up -d
docker compose exec api sh -c 'cd /app/packages/database && npx prisma db push'
docker compose exec api sh -c 'cd /app/packages/database && npx tsx prisma/seed.ts'
```

Default ports: Web `:3002` · API `:5001` · Postgres `:5434` · Redis `:6380`

---

## Channels Supported

- **LINE** Official Account
- **Facebook** Messenger
- **Instagram** DM
- **Shopee** Chat (planned)
- **Lazada** Chat (planned)
- **TikTok Shop** Chat (planned)

---

## Docs

- [Development Status](docs/status.md) — สถานะ features ปัจจุบัน
- [Platform Plan](docs/centrix-platform-plan.md) — roadmap, competitive analysis, pricing strategy
