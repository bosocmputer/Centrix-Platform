import type { FastifyInstance } from 'fastify'
import { createWriteStream, createReadStream, existsSync, mkdirSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { randomUUID } from 'node:crypto'
import { extname, join } from 'node:path'
import { prisma } from '../lib/prisma.js'
import { translateText, detectLanguage } from '../lib/translate.js'
import { redis } from '../lib/redis.js'
import { getOrgConfig } from './config.js'

const UPLOADS_DIR = '/app/uploads'
const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
}

function ensureUploadsDir() {
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })
}

export async function conversationRoutes(app: FastifyInstance) {
  // POST /api/media/upload — อัปโหลดไฟล์ แล้วได้ public URL กลับ
  app.post('/api/media/upload', { onRequest: [app.authenticate] }, async (req, reply) => {
    ensureUploadsDir()
    const { orgId } = req.user as { orgId: string }
    const data = await req.file()
    if (!data) return reply.status(400).send({ error: 'No file' })

    const ext = extname(data.filename).toLowerCase() || '.bin'
    const filename = `${randomUUID()}${ext}`
    const dest = join(UPLOADS_DIR, filename)

    await pipeline(data.file, createWriteStream(dest))

    const externalUrl = await getOrgConfig(orgId, 'external_url') ?? process.env.EXTERNAL_URL ?? 'http://localhost:5000'
    return reply.send({ url: `${externalUrl}/api/uploads/${filename}`, filename })
  })

  // GET /api/uploads/:filename — serve ไฟล์ที่อัปโหลด (สำหรับ LINE fetch)
  app.get('/api/uploads/:filename', async (req, reply) => {
    const { filename } = req.params as { filename: string }
    if (!/^[\w.-]+$/.test(filename)) return reply.status(400).send({ error: 'Invalid filename' })
    const filePath = join(UPLOADS_DIR, filename)
    if (!existsSync(filePath)) return reply.status(404).send({ error: 'Not found' })

    const ext = extname(filename).toLowerCase()
    const contentType = MIME_MAP[ext] ?? 'application/octet-stream'
    reply.header('Content-Type', contentType)
    reply.header('Cross-Origin-Resource-Policy', 'cross-origin')
    reply.header('Cache-Control', 'public, max-age=86400')
    return reply.send(createReadStream(filePath))
  })
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
    const { content, messageType = 'text', mediaUrl } = req.body as { content: string; messageType?: string; mediaUrl?: string }
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

    // แปลข้อความ Agent → ภาษาลูกค้า (เฉพาะ text)
    const translateApiKey = await getOrgConfig(orgId, 'google_translate_api_key')
    const translatedContent = messageType === 'text' ? await translateText(content, targetLang, translateApiKey) : null

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        role: 'AGENT',
        messageType,
        content,
        mediaUrl: mediaUrl ?? undefined,
        translatedContent: translatedContent ?? undefined,
        originalLanguage: messageType === 'text' ? targetLang : undefined,
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
        let lineMessage: any
        if (messageType === 'image' && mediaUrl) {
          lineMessage = { type: 'image', originalContentUrl: mediaUrl, previewImageUrl: mediaUrl }
        } else if (messageType === 'video' && mediaUrl) {
          lineMessage = { type: 'video', originalContentUrl: mediaUrl, previewImageUrl: mediaUrl }
        } else if (messageType === 'file' && mediaUrl) {
          lineMessage = { type: 'text', text: `📎 ${content}\n${mediaUrl}` }
        } else {
          lineMessage = { type: 'text', text: translatedContent ?? content }
        }
        await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
          body: JSON.stringify({ to: profile.externalId, messages: [lineMessage] }),
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
  app.get('/api/media/line/:messageId', async (req, reply) => {
    const { messageId } = req.params as { messageId: string }

    // รับ token จาก header หรือ query string (สำหรับ <img src>)
    let orgId: string | null = null
    try {
      const token = (req.headers.authorization?.replace('Bearer ', '') ?? (req.query as any).token) as string
      const decoded = app.jwt.verify(token) as any
      orgId = decoded?.orgId ?? null
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    if (!orgId) return reply.status(401).send({ error: 'Unauthorized' })

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
    reply.header('Cross-Origin-Resource-Policy', 'cross-origin')
    return reply.send(buffer)
  })
}
