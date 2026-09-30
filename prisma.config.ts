import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/**
 * Prisma 7 configuration.
 *
 * Prisma 7 removed the `url` property from the `datasource` block in
 * `schema.prisma`. The CLI reads the connection string from here, while the
 * runtime client receives it through a driver adapter (see
 * `src/lib/prisma.ts`). Both read the same `DATABASE_URL` so there is a single
 * source of truth.
 *
 * A dedicated `shadowDatabaseUrl` is optional locally; Prisma creates a
 * temporary shadow database automatically when the server user has the
 * `CREATE DATABASE` privilege.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',

  datasource: {
    url: env('DATABASE_URL'),
  },

  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});
