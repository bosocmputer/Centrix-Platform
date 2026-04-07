import type { FastifyInstance } from 'fastify'
import crypto from 'crypto'
import { prisma } from '../../lib/prisma.js'
import { detectLanguage, translateText } from '../../lib/translate.js'
import { redis } from '../../lib/redis.js'

export async function lineWebhookRoutes(app: FastifyInstance) {
  app.post('/api/webhooks/line', async (req, reply) => {
    // อ่าน Channel Secret จาก database
    const channel = await prisma.channel.findFirst({
      where: { type: 'LINE', isActive: true },
    })

    // Verify LINE signature
    const signature = req.headers['x-line-signature'] as string
    const channelSecret = channel?.secret ?? process.env.LINE_CHANNEL_SECRET ?? ''

    if (channelSecret) {
      const body = JSON.stringify(req.body)
      const hash = crypto
        .createHmac('sha256', channelSecret)
        .update(body)
        .digest('base64')
      if (hash !== signature) return reply.status(401).send({ error: 'Invalid signature' })
    }

    const { events } = req.body as any

    for (const event of events ?? []) {
      if (event.type !== 'message') continue

      const msgType: string = event.message.type
      // รองรับเฉพาะ type ที่ใช้งานได้
      if (!['text', 'image', 'video', 'audio', 'file', 'sticker'].includes(msgType)) continue

      const externalId = event.source.userId
      if (!channel) continue

      let customerChannel = await prisma.customerChannel.findUnique({
        where: { type_externalId: { type: 'LINE', externalId } },
        include: { customer: true },
      })

      if (!customerChannel) {
        const customer = await prisma.customer.create({
          data: { orgId: channel.orgId, name: `LINE User ${externalId.slice(-4)}` },
        })
        customerChannel = await prisma.customerChannel.create({
          data: { customerId: customer.id, type: 'LINE', externalId },
          include: { customer: true },
        })
      }

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

      const text = msgType === 'text' ? event.message.text as string : ''
      const detectedLang = msgType === 'text' ? await detectLanguage(text) : 'unknown'
      const needsTranslation = msgType === 'text' && detectedLang !== 'th' && detectedLang !== 'unknown'
      const translatedText = needsTranslation ? await translateText(text, 'th') : null

      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'CUSTOMER',
          messageType: msgType,
          content: msgType === 'text' ? text : `[${msgType}]`,
          mediaUrl: msgType !== 'text' ? event.message.id : undefined,
          originalContent: msgType === 'text' ? text : undefined,
          originalLanguage: msgType === 'text' ? detectedLang : undefined,
          translatedContent: translatedText ?? undefined,
        },
      })

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      })

      const redisChannel = `org:${channel.orgId}`
      console.log('[LINE-WH] Publishing to Redis channel:', redisChannel, 'message id:', message.id)
      const publishResult = await redis.publish(
        redisChannel,
        JSON.stringify({ type: 'NEW_MESSAGE', conversationId: conversation.id, message })
      )
      console.log('[LINE-WH] Redis publish result (subscribers received):', publishResult)
    }

    return reply.send({ status: 'ok' })
  })
}
