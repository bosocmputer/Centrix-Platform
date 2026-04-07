import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

const createChannelSchema = z.object({
  type: z.enum(['FACEBOOK', 'INSTAGRAM', 'LINE', 'WECHAT', 'LAZADA', 'TIKTOK', 'SHOPEE']),
  name: z.string().min(1),
  accessToken: z.string().optional(),
  secret: z.string().optional(),
})

export async function channelRoutes(app: FastifyInstance) {
  // GET /api/channels
  app.get('/api/channels', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { orgId } = req.user as { orgId: string }
    const channels = await prisma.channel.findMany({
      where: { orgId },
      orderBy: { createdAt: 'asc' },
    })
    // ซ่อน secret ก่อน return
    const safe = channels.map((c: any) => ({
      ...c,
      accessToken: c.accessToken ? '••••••••' : null,
      secret: c.secret ? '••••••••' : null,
      hasAccessToken: !!c.accessToken,
      hasSecret: !!c.secret,
    }))
    return reply.send({ channels: safe })
  })

  // POST /api/channels
  app.post('/api/channels', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { orgId, role } = req.user as { orgId: string; role: string }
    if (role !== 'SUPER_ADMIN') return reply.status(403).send({ error: 'Forbidden' })

    const body = createChannelSchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid input' })

    const channel = await prisma.channel.create({
      data: { orgId, ...body.data },
    })
    return reply.status(201).send({ channel })
  })

  // PUT /api/channels/:id
  app.put('/api/channels/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { orgId, role } = req.user as { orgId: string; role: string }
    if (role !== 'SUPER_ADMIN') return reply.status(403).send({ error: 'Forbidden' })

    const { id } = req.params as { id: string }
    const body = createChannelSchema.partial().safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid input' })

    const channel = await prisma.channel.update({
      where: { id },
      data: body.data,
    })
    return reply.send({ channel })
  })

  // PATCH /api/channels/:id/toggle
  app.patch('/api/channels/:id/toggle', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { orgId, role } = req.user as { orgId: string; role: string }
    if (role !== 'SUPER_ADMIN') return reply.status(403).send({ error: 'Forbidden' })

    const { id } = req.params as { id: string }
    const channel = await prisma.channel.findFirst({ where: { id, orgId } })
    if (!channel) return reply.status(404).send({ error: 'Not found' })

    const updated = await prisma.channel.update({
      where: { id },
      data: { isActive: !channel.isActive },
    })
    return reply.send({ channel: updated })
  })

  // DELETE /api/channels/:id
  app.delete('/api/channels/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { orgId, role } = req.user as { orgId: string; role: string }
    if (role !== 'SUPER_ADMIN') return reply.status(403).send({ error: 'Forbidden' })

    const { id } = req.params as { id: string }
    await prisma.channel.delete({ where: { id } })
    return reply.send({ ok: true })
  })
}
