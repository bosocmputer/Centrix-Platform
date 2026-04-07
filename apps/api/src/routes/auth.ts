import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/login', async (req, reply) => {
    const body = loginSchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid input' })

    const { email, password } = body.data

    const user = await prisma.user.findFirst({ where: { email } })
    if (!user) return reply.status(401).send({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return reply.status(401).send({ error: 'Invalid credentials' })

    const token = await reply.jwtSign(
      { userId: user.id, orgId: user.orgId, role: user.role },
      { expiresIn: '7d' }
    )

    return reply.send({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, language: user.language, mode: user.mode } })
  })

  app.get('/api/auth/me', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string; orgId: string; role: string }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, language: true, mode: true, orgId: true },
    })
    if (!user) return reply.status(404).send({ error: 'User not found' })
    return reply.send({ user })
  })
}
