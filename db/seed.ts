import sampleData from '@/db/sample-data'
import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  await prisma.product.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  await prisma.product.createMany({ data: sampleData.products })
  await prisma.user.createMany({ data: sampleData.users })

  console.log('Database seeded successfully')
}

main()
