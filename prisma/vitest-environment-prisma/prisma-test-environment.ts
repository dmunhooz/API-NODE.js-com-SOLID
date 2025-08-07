import { prisma } from '@/lib/prisma'
import 'dotenv/config'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import type { Environment } from 'vitest/environments'

function generateDatabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL env variable')
  }

  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schema)
  return url.toString()
}

let migrationLock = Promise.resolve() // usado para evitar rodar migrate em paralelo

export default <Environment>{
  name: 'prisma',
  transformMode: 'ssr',

  async setup() {
    const schema = randomUUID()
    const databaseUrl = generateDatabaseUrl(schema)

    console.log(`\n🛠  Criando schema temporário: ${schema}`)

    process.env.DATABASE_URL = databaseUrl

    // Garante que só 1 migrate rode por vez
    await (migrationLock = migrationLock.then(async () => {
      console.log(`🚀 Rodando migrations no schema: ${schema}`)
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    }))

    return {
      async teardown() {
        console.log(`🧹 Removendo schema temporário: ${schema}`)
        try {
          await prisma.$executeRawUnsafe(
            `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
          )
        } catch (err) {
          console.error(`Erro ao apagar schema ${schema}:`, err)
        }
        await prisma.$disconnect()
      },
    }
  },
}
