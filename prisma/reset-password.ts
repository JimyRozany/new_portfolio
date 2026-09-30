/**
 * Set or reset the admin password.
 *
 * Run with `npm run db:reset-password -- you@example.com "NewPassword123"`, or
 * interactively with `npm run db:reset-password` and no arguments.
 *
 * The password is hashed with bcrypt at cost 12 before it ever reaches the
 * database, and it is never written to a log or to this file.
 */

// Load .env first: `tsx` does not do it automatically, and this script can be
// run directly (`npm run db:reset-password`) as well as through the Prisma CLI.
import 'dotenv/config';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { hash } from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

/** bcrypt's cost 12 is the current sensible default for a login endpoint. */
const BCRYPT_COST = 12;

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env first.');
  }

  const parsed = new URL(url);

  return new PrismaClient({
    adapter: new PrismaMariaDb({
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.slice(1),
      ssl: parsed.searchParams.get('ssl') === 'true' ? {} : undefined,
    }),
  });
}

const prisma = createPrisma();

/** Minimal readline prompt so the script needs no extra dependency. */
async function prompt(question: string): Promise<string> {
  const { createInterface } = await import('node:readline/promises');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

async function main(): Promise<void> {
  const email =
    process.argv[2] ??
    (await prompt('Email (existing user, or a new one to create): ')).toLowerCase();

  const password = process.argv[3] ?? (await prompt('New password: '));

  if (!email || !password) {
    throw new Error('Both an email and a password are required.');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const passwordHash = await hash(password, BCRYPT_COST);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({ where: { email }, data: { passwordHash } });
    console.log(`Password updated for ${email}.`);
  } else {
    await prisma.user.create({
      data: { email, name: email.split('@')[0] ?? 'Admin', passwordHash },
    });
    console.log(`User ${email} created.`);
  }
}

main()
  .catch((error: unknown) => {
    console.error('Failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
