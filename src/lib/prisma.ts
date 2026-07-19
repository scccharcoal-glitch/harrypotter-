import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function isPlaceholderDatabaseUrl(value: string | undefined): boolean {
  return !value || value.includes("USER:PASSWORD@HOST") || value.includes("@HOST:");
}

if (isPlaceholderDatabaseUrl(process.env.DATABASE_URL) && process.env.NEON_DATABASE_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.NEON_DATABASE_DATABASE_URL;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
