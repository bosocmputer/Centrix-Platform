import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { translateText, detectLanguage } from '../lib/translate.js'
import { redis } from '../lib/redis.js'

export async function conversationRoutes(app: FastifyInstance) {
  // GET /api/conversations — list ทั้งหมดของ org
  app.get('/api/conversations', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { orgId } = req.user as { orgId: string }
    const conversations = await prisma.conversation.findMany({
      where: { orgId },
      include: {
        customer: true,
        channel: { select: { type: true, name: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { lastMessageAt: 'desc' },
    })
    return reply.send({ conversations })
  })

  // GET /api/conversations/:id/messages
  app.get('/api/conversations/:id/messages', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
    })
    return reply.send({ messages })
  })

  // POST /api/conversations/:id/messages — Agent ส่งข้อความ
  app.post('/api/conversations/:id/messages', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { content } = req.body as { content: string }
    const { userId, orgId } = req.user as { userId: string; orgId: string }

    const conversation = await prisma.conversation.findFirst({
      where: { id, orgId },
      include: { channel: true, customer: { include: { channelProfiles: true } } },
    })
    if (!conversation) return reply.status(404).send({ error: 'Conversation not found' })

    // หา original language จาก message ล่าสุดของลูกค้า
    const lastCustomerMsg = await prisma.message.findFirst({
      where: { conversationId: id, role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
    })
    const targetLang = lastCustomerMsg?.originalLanguage ?? 'en'

    // แปลข้อความ Agent → ภาษาลูกค้า
    const translatedContent = await translateText(content, targetLang)

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        role: 'AGENT',
        content,
        translatedContent,
        originalLanguage: targetLang,
      },
    })

    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    })

    // ส่งข้อความกลับไปยัง channel ต้นทาง
    const channelType = conversation.channel.type
    const accessToken = conversation.channel.accessToken

    if (channelType === 'LINE' && accessToken) {
      const profile = conversation.customer.channelProfiles.find(p => p.type === 'LINE')
      if (profile) {
        await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            to: profile.externalId,
            messages: [{ type: 'text', text: translatedContent }],
          }),
        })
      }
    } else if (channelType === 'FACEBOOK' && accessToken) {
      const profile = conversation.customer.channelProfiles.find(p => p.type === 'FACEBOOK')
      if (profile) {
        await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${accessToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: profile.externalId },
            message: { text: translatedContent },
          }),
        })
      }
    }

    await redis.publish(`org:${orgId}`, JSON.stringify({ type: 'NEW_MESSAGE', conversationId: id, message }))

    return reply.send({ message, translatedContent })
  })

  // PATCH /api/conversations/:id — update status / assign
  app.patch('/api/conversations/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { orgId } = req.user as { orgId: string }
    const { status, assignedToId, tags } = req.body as { status?: string; assignedToId?: string; tags?: string[] }

    const conversation = await prisma.conversation.update({
      where: { id },
      data: {
        ...(status && { status: status as any }),
        ...(assignedToId !== undefined && { assignedToId }),
        ...(tags && { tags }),
      },
    })

    await redis.publish(`org:${orgId}`, JSON.stringify({ type: 'CONVERSATION_UPDATED', conversation }))

    return reply.send({ conversation })
  })

  // GET /api/media/line/:messageId — proxy รูป/ไฟล์จาก LINE ให้ browser เปิดได้
  app.get('/api/media/line/:messageId', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { messageId } = req.params as { messageId: string }
    const { orgId } = req.user as { userId: string; orgId: string }

    const channel = await prisma.channel.findFirst({
      where: { orgId, type: 'LINE', isActive: true },
    })
    if (!channel?.accessToken) return reply.status(404).send({ error: 'Channel not found' })

    const lineRes = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
      headers: { Authorization: `Bearer ${channel.accessToken}` },
    })
    if (!lineRes.ok) return reply.status(502).send({ error: 'Failed to fetch from LINE' })

    const contentType = lineRes.headers.get('content-type') ?? 'application/octet-stream'
    const buffer = Buffer.from(await lineRes.arrayBuffer())
    reply.header('Content-Type', contentType)
    reply.header('Cache-Control', 'private, max-age=3600')
    return reply.send(buffer)
  })
}
