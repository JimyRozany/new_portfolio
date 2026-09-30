import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@/generated/prisma/client';

/**
 * Module augmentation for Auth.js types.
 *
 * Without this, `session.user.id` and `session.user.role` would not exist and
 * every consumer would need a cast. These are the only two pieces of
 * app-specific data that ever live in a session.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      /**
       * Auth.js types the user id as a string, so the numeric primary key is
       * stringified at the `authorize` boundary and parsed back where a query
       * needs it. Keeping the framework's contract avoids casts everywhere.
       */
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
  }
}

/**
 * In Auth.js v5 the JWT type lives in `@auth/core/jwt`, not `next-auth/jwt` ---
 * augmenting the wrong module leaves `token.role` typed as `unknown`.
 */
declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole;
  }
}

export {};
