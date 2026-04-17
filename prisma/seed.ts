import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const existingAdmin = await prisma.admin.findUnique({
    where: { username: 'admin' },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    })
    console.log('Admin created: admin / admin123')
  } else {
    console.log('Admin already exists')
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
