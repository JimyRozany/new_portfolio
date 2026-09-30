import 'server-only';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * Build the MySQL driver adapter from a connection string.
 *
 * Prisma 7 no longer accepts a `url` in `schema.prisma`; the connection details
 * are handed to the client through a driver adapter instead. The MariaDB driver
 * is used because it speaks the MySQL wire protocol and is the driver Prisma
 * ships an adapter for --- there is no `adapter-mysql` package.
 *
 * Kept in its own function so the same parsing is reusable by scripts and by
 * the seed.
 */
function createAdapter(url: string): PrismaMariaDb {
  const parsed = new URL(url);

  if (!parsed.hostname || !parsed.username || !parsed.pathname.slice(1)) {
    throw new Error(
      'DATABASE_URL is malformed. Expected: mysql://USER:PASSWORD@HOST:PORT/DATABASE',
    );
  }

  const port = parsed.port ? Number(parsed.port) : 3306;

  return new PrismaMariaDb({
    host: parsed.hostname,
    port,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    // SSL is opt-in so local development over a socket-free TCP connection
    // does not fail on certificate verification, while production can require
    // it by adding `?ssl=true` (or `sslaccept=strict`) to the URL.
    ssl: parsed.searchParams.get('ssl') === 'true' ? {} : undefined,
    connectionLimit: 5,
  });
}

/**
 * A single `PrismaClient` for the whole server process.
 *
 * Next.js hot-reloads modules in development, which would otherwise open a new
 * connection pool on every edit until MySQL refuses new connections. Caching
 * the instance on `globalThis` is the documented Prisma + Next.js pattern.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: createAdapter(process.env.DATABASE_URL ?? ''),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
