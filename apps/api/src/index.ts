import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import websocket from '@fastify/websocket'
import { Redis as IORedis } from 'ioredis'
import { redis } from './lib/redis.js'
import { authRoutes } from './routes/auth.js'
import { conversationRoutes } from './routes/conversations.js'
import { channelRoutes } from './routes/channels.js'
import { userRoutes } from './routes/users.js'
import { facebookWebhookRoutes } from './routes/webhooks/facebook.js'
import { lineWebhookRoutes } from './routes/webhooks/line.js'

async function main() {
  const app = Fastify({ logger: true })

  // ─── Plugins ────────────────────────────────────────────────────────────────
  await app.register(helmet)
  await app.register(cors, { origin: true })
  await app.register(jwt, { secret: process.env.JWT_SECRET ?? 'dev-secret-change-me' })
  await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } }) // 20 MB
  await app.register(websocket)

  // ─── Auth decorator ─────────────────────────────────────────────────────────
  app.decorate('authenticate', async (req: any, reply: any) => {
    try {
      await req.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Unauthorized' })
    }
  })

  // ─── Routes ─────────────────────────────────────────────────────────────────
  await app.register(authRoutes)
  await app.register(conversationRoutes)
  await app.register(channelRoutes)
  await app.register(userRoutes)
  await app.register(facebookWebhookRoutes)
  await app.register(lineWebhookRoutes)

  // ─── WebSocket realtime ─────────────────────────────────────────────────────
  app.get('/ws', { websocket: true }, (socket, req) => {
    const sub = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: null })
    let orgId: string | null = null

    console.log('[WS] New connection from', req.ip)

    // รอรับ auth message จาก client
    socket.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString())
        console.log('[WS] Received message type:', msg.type)

        if (msg.type === 'auth' && msg.token) {
          // verify JWT
          const decoded = app.jwt.verify(msg.token) as any
          orgId = decoded.orgId ?? null
          console.log('[WS] Auth decoded orgId:', orgId)
          if (!orgId) { socket.close(); return }

          // subscribe redis channel เดียวต่อ org
          await sub.subscribe(`org:${orgId}`)
          console.log('[WS] Subscribed to Redis channel:', `org:${orgId}`)
          sub.on('message', (_ch, message) => {
            console.log('[WS] Redis message received, socket state:', socket.readyState, 'data:', message.substring(0, 100))
            if (socket.readyState === 1) {
              socket.send(message)
              console.log('[WS] Sent to client OK')
            } else {
              console.log('[WS] Socket not open, skipped')
            }
          })

          socket.send(JSON.stringify({ type: 'authenticated' }))
          console.log('[WS] Sent authenticated to client')
        }
      } catch (err) {
        console.error('[WS] Error:', err)
        socket.close()
      }
    })

    socket.on('close', () => {
      console.log('[WS] Connection closed, orgId:', orgId)
      sub.quit().catch(() => sub.disconnect())
    })
  })

  // ─── Health check ───────────────────────────────────────────────────────────
  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }))

  // ─── Start ──────────────────────────────────────────────────────────────────
  const PORT = parseInt(process.env.PORT ?? '5000')
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`API running on port ${PORT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
