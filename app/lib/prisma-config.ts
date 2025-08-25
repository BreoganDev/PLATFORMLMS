import { PrismaClient } from '@prisma/client'

// Connection pool configuration
const connectionConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  errorFormat: 'pretty' as const,
}

// Create a singleton instance
let prisma: PrismaClient

declare global {
  var __prisma: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(connectionConfig)
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient(connectionConfig)
  }
  prisma = global.__prisma
}

// Graceful shutdown handlers
const gracefulShutdown = async () => {
  await prisma.$disconnect()
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('beforeExit', gracefulShutdown)

export { prisma }
