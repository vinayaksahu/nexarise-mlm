import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  const isSSL = Boolean(
    connectionString?.includes('sslmode=') ||
    connectionString?.includes('neon.tech') ||
    connectionString?.includes('vercel-storage')
  )

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ...(isSSL ? { ssl: { rejectUnauthorized: false } } : {}),
  })

  pool.on('error', (err) => {
    console.error('[PG Pool Error]', err)
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
