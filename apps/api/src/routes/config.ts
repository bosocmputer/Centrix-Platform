import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

// Config keys ที่จัดการผ่าน UI ได้
export const CONFIG_KEYS = [
  'external_url',
  'google_translate_api_key',
  'facebook_app_id',
  'facebook_app_secret',
  'facebook_verify_token',
] as const

export type ConfigKey = typeof CONFIG_KEYS[number]

// Helper อ่าน config จาก DB (ใช้ใน routes อื่น)
export async function getOrgConfig(orgId: string, key: ConfigKey): Promise<string | null> {
  const row = await prisma.orgConfig.findUnique({ where: { orgId_key: { orgId, key } } })
  return row?.value ?? null
}

// Helper อ่านหลาย key พร้อมกัน
export async function getOrgConfigs(orgId: string): Promise<Record<string, string>> {
  const rows = await prisma.orgConfig.findMany({ where: { orgId } })
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

export async function configRoutes(app: FastifyInstance) {
  // GET /api/config — ดึง config ทั้งหมดของ org (mask sensitive values)
  app.get('/api/config', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { orgId } = req.user as { orgId: string }
    const rows = await prisma.orgConfig.findMany({ where: { orgId } })
    const result: Record<string, string> = {}
    for (const row of rows) {
      // mask sensitive keys
      if (['google_translate_api_key', 'facebook_app_secret'].includes(row.key)) {
        result[row.key] = row.value ? '••••••••' + row.value.slice(-4) : ''
      } else {
        result[row.key] = row.value
      }
    }
    return reply.send({ config: result })
  })

  // PUT /api/config — บันทึก config (upsert)
  app.put('/api/config', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { orgId, role } = req.user as { orgId: string; role: string }
    if (role !== 'SUPER_ADMIN') return reply.status(403).send({ error: 'Forbidden' })

    const updates = req.body as Record<string, string>

    for (const [key, value] of Object.entries(updates)) {
      if (!CONFIG_KEYS.includes(key as ConfigKey)) continue
      if (value === '••••••••' + (value.slice(-4))) continue // skip masked (unchanged)

      if (value === '') {
        await prisma.orgConfig.deleteMany({ where: { orgId, key } })
      } else {
        await prisma.orgConfig.upsert({
          where: { orgId_key: { orgId, key } },
          update: { value, updatedAt: new Date() },
          create: { orgId, key, value, updatedAt: new Date() },
        })
      }
    }

    return reply.send({ ok: true })
  })
}
