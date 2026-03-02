import { PrismaLibSql } from "@prisma/adapter-libsql";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@/generated/prisma/client");

type PrismaClientType = InstanceType<typeof PrismaClient>;
const globalForPrisma = globalThis as unknown as { prisma: PrismaClientType };

function createPrismaClient(): PrismaClientType {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    // Required for Turso remote databases; ignored for local file:// URLs
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClientType = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
