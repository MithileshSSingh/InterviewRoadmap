import { PrismaLibSql } from "@prisma/adapter-libsql";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@/generated/prisma/client");

type PrismaClientType = InstanceType<typeof PrismaClient>;
const globalForPrisma = globalThis as unknown as { prisma: PrismaClientType };

function createPrismaClient(): PrismaClientType {
  const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClientType = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
