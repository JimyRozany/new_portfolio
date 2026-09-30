import 'server-only';

import { compare } from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authConfig } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import type { UserRole } from '@/generated/prisma/client';

/**
 * Auth.js entry point for the Node runtime.
 *
 * Adds the credentials provider on top of the edge-safe base config. The
 * provider is the only part that needs `bcrypt` and Prisma, which is exactly
 * why it lives here and not in `auth.config.ts`.
 */

/** Credentials submitted by the sign-in form, validated before any DB work. */
const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(191),
});

/**
 * A real bcrypt hash of an unguessable value.
 *
 * `authorize` compares against this when the email is unknown, so "no such
 * user" and "wrong password" both take roughly the same time. Without it,
 * response latency alone enumerates valid admin accounts.
 */
const DUMMY_HASH = '$2b$12$Jm0kQ8B0n1Z0kHqQe4m8Yh1LwPZ7s3XvN6aJcRbTgU4mKdWyEoS1q';

/**
 * Verify the submitted credentials against the `users` table.
 *
 * Returns only the fields the session needs --- the password hash never leaves
 * the database.
 */
async function authorize(credentials: unknown) {
  const parsed = credentialsSchema.safeParse(credentials);

  if (!parsed.success) return null;

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, passwordHash: true, role: true },
  });

  const passwordMatches = await compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordMatches) return null;

  return { id: String(user.id), email: user.email, name: user.name, role: user.role };
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    /**
     * Copy the role onto the token at sign-in so later authorisation checks read
     * it locally instead of querying the database on every render.
     */
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: UserRole }).role ?? 'EDITOR';
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = token.role;
      }
      return session;
    },
  },
});
