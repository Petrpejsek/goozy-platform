import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

console.log('🔍 [PRISMA] Initializing Prisma Client...')
console.log('🔍 [PRISMA] DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

console.log('✅ [PRISMA] Prisma Client initialized:', !!prisma)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} 