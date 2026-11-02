import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { prisma?: PrismaClient };

/** Returns null when DATABASE_URL is missing so callers can fall back to content.ts. */
export const db: PrismaClient | null = process.env.DATABASE_URL
  ? (g.prisma ??= new PrismaClient())
  : null;
