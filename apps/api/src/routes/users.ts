import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['SUPER_ADMIN', 'SUPERVISOR', 'AGENT']).default('AGENT'),
  language: z.enum(['th', 'en']).default('th'),
})

export async function userRoutes(app: FastifyInstance) {
  // GET /api/users
  app.get('/api/users', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { orgId } = req.user as { orgId: string }
    const users = await prisma.user.findMany({
      where: { orgId },
      select: { id: true, name: true, email: true, role: true, language: true, mode: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    return reply.send({ users })
  })

  // POST /api/users
  app.post('/api/users', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { orgId, role } = req.user as { orgId: string; role: string }
    if (!['SUPER_ADMIN', 'SUPERVISOR'].includes(role)) return reply.status(403).send({ error: 'Forbidden' })

    const body = createUserSchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid input' })

    const hashed = await bcrypt.hash(body.data.password, 10)
    const user = await prisma.user.create({
      data: { orgId, ...body.data, password: hashed },
      select: { id: true, name: true, email: true, role: true, language: true, mode: true, createdAt: true },
    })
    return reply.status(201).send({ user })
  })

  // PUT /api/users/:id
  app.put('/api/users/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { orgId, role } = req.user as { orgId: string; role: string }
    if (!['SUPER_ADMIN', 'SUPERVISOR'].includes(role)) return reply.status(403).send({ error: 'Forbidden' })

    const { id } = req.params as { id: string }
    const body = createUserSchema.omit({ password: true }).partial().safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid input' })

    const user = await prisma.user.update({
      where: { id },
      data: body.data,
      select: { id: true, name: true, email: true, role: true, language: true, mode: true },
    })
    return reply.send({ user })
  })

  // DELETE /api/users/:id
  app.delete('/api/users/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { orgId, role, userId } = req.user as { orgId: string; role: string; userId: string }
    if (role !== 'SUPER_ADMIN') return reply.status(403).send({ error: 'Forbidden' })

    const { id } = req.params as { id: string }
    if (id === userId) return reply.status(400).send({ error: 'Cannot delete yourself' })

    await prisma.user.delete({ where: { id } })
    return reply.send({ ok: true })
  })

  // PATCH /api/users/me/language — Agent เปลี่ยนภาษา monitor
  app.patch('/api/users/me/language', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const { language } = req.body as { language: string }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { language },
      select: { id: true, language: true },
    })
    return reply.send({ user })
  })

  // PATCH /api/users/me/mode — สลับ AI/Manual mode
  app.patch('/api/users/me/mode', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const { mode } = req.body as { mode: string }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { mode: mode as any },
      select: { id: true, mode: true },
    })
    return reply.send({ user })
  })
}
