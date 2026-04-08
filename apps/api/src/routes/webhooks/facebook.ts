import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { detectLanguage, translateText } from '../../lib/translate.js'
import { redis } from '../../lib/redis.js'
import { getOrgConfig } from '../config.js'

export async function facebookWebhookRoutes(app: FastifyInstance) {
  // Webhook verification
  app.get('/api/webhooks/facebook', async (req, reply) => {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query as Record<string, string>
    if (mode === 'subscribe') {
      const channel = await prisma.channel.findFirst({ where: { type: 'FACEBOOK', isActive: true } })
      const verifyToken = channel?.secret ?? process.env.FACEBOOK_VERIFY_TOKEN
      if (token === verifyToken) return reply.send(parseInt(challenge))
    }
    return reply.status(403).send({ error: 'Forbidden' })
  })

  // Receive messages
  app.post('/api/webhooks/facebook', async (req, reply) => {
    const body = req.body as any
    if (body.object !== 'page') return reply.status(400).send()

    for (const entry of body.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        if (!event.message) continue
        const hasText = !!event.message.text
        const hasAttachment = !!(event.message.attachments?.length)
        if (!hasText && !hasAttachment) continue

        const externalId = event.sender.id
        const text = event.message.text ?? ''

        // หา channel ที่เป็น FACEBOOK
        const channel = await prisma.channel.findFirst({
          where: { type: 'FACEBOOK', isActive: true },
        })
        if (!channel) continue

        // หรือสร้าง customer
        let customerChannel = await prisma.customerChannel.findUnique({
          where: { type_externalId: { type: 'FACEBOOK', externalId } },
          include: { customer: true },
        })

        if (!customerChannel) {
          const customer = await prisma.customer.create({
            data: { orgId: channel.orgId, name: `Facebook User ${externalId.slice(-4)}` },
          })
          customerChannel = await prisma.customerChannel.create({
            data: { customerId: customer.id, type: 'FACEBOOK', externalId },
            include: { customer: true },
          })
        }

        // หา conversation ที่ยังเปิดอยู่
        let conversation = await prisma.conversation.findFirst({
          where: {
            channelId: channel.id,
            customerId: customerChannel.customerId,
            status: { not: 'RESOLVED' },
          },
        })

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              orgId: channel.orgId,
              channelId: channel.id,
              customerId: customerChannel.customerId,
              status: 'OPEN',
            },
          })
        }

        // หา attachment ถ้ามี
        let messageType = 'text'
        let mediaUrl: string | null = null
        if (hasAttachment) {
          const att = event.message.attachments[0]
          if (att.type === 'image') { messageType = 'image'; mediaUrl = att.payload?.url ?? null }
          else if (att.type === 'video') { messageType = 'video'; mediaUrl = att.payload?.url ?? null }
          else if (att.type === 'audio') { messageType = 'audio'; mediaUrl = att.payload?.url ?? null }
          else if (att.type === 'file') { messageType = 'file'; mediaUrl = att.payload?.url ?? null }
          else if (att.type === 'sticker') { messageType = 'sticker'; mediaUrl = att.payload?.url ?? null }
        }

        // detect ภาษาและแปล (เฉพาะ text)
        const translateApiKey = await getOrgConfig(channel.orgId, 'google_translate_api_key')
        let detectedLang = 'unknown'
        let translatedText: string | null = null
        if (hasText && text) {
          detectedLang = await detectLanguage(text, translateApiKey)
          const needsTranslation = detectedLang !== 'th' && detectedLang !== 'unknown'
          translatedText = needsTranslation ? await translateText(text, 'th', translateApiKey) : null
        }

        const message = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: 'CUSTOMER',
            messageType,
            content: text || (mediaUrl ? `[${messageType}]` : ''),
            originalContent: text || undefined,
            originalLanguage: detectedLang,
            translatedContent: translatedText ?? undefined,
            mediaUrl: mediaUrl ?? undefined,
          },
        })

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() },
        })

        // emit realtime
        await redis.publish(
          `org:${channel.orgId}:conversation:${conversation.id}`,
          JSON.stringify({ type: 'NEW_MESSAGE', message, conversation })
        )
        await redis.publish(
          `org:${channel.orgId}:conversations`,
          JSON.stringify({ type: 'CONVERSATION_UPDATED', conversationId: conversation.id })
        )
      }
    }

    return reply.send({ status: 'ok' })
  })
}
