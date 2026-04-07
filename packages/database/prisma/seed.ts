import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // สร้าง demo organization
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-shop' },
    update: {},
    create: {
      name: 'Demo Shop',
      slug: 'demo-shop',
    },
  })

  // สร้าง super admin
  const hashedPassword = await bcrypt.hash('admin1234', 10)
  await prisma.user.upsert({
    where: { orgId_email: { orgId: org.id, email: 'admin@demo.com' } },
    update: {},
    create: {
      orgId: org.id,
      email: 'admin@demo.com',
      name: 'Admin',
      role: 'SUPER_ADMIN',
      language: 'th',
      mode: 'MANUAL',
      password: hashedPassword,
    },
  })

  console.log('Seed completed — org:', org.slug)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
