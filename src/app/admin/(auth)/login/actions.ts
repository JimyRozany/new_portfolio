'use server';

import { headers } from 'next/headers';
import { signIn } from '@/auth';
import { z } from 'zod';
import { rateLimitKey, recordFailure, recordSuccess, retryAfterMs } from '@/server/auth/rate-limit';

/**
 * Admin sign-in and sign-out.
 *
 * Server actions rather than the client-side `signIn` helper, so validation,
 * rate limiting, the Auth.js round trip and the redirect all happen in one
 * request with no JavaScript required. The login page therefore still works if
 * the bundle fails to load.
 */

export type LoginState = {
  error?: 'invalidCredentials' | 'rateLimited' | 'invalid';
  /** Field-level messages so the form can mark the offending input. */
  fieldErrors?: { email?: string[]; password?: string[] };
};

const loginSchema = z.object({
  email: z.string().trim().min(1, 'required').email('email'),
  password: z.string().min(1, 'required'),
});

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    // The form renders the human-readable text; these codes only tell it which
    // field to mark.
    const flat = parsed.error.flatten().fieldErrors;
    return {
      error: 'invalid',
      fieldErrors: {
        ...(flat.email ? { email: ['invalid'] } : {}),
        ...(flat.password ? { password: ['required'] } : {}),
      },
    };
  }

  const requestHeaders = await headers();
  const key = rateLimitKey(requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim());

  if (retryAfterMs(key) > 0) {
    return { error: 'rateLimited' };
  }

  try {
    await signIn('credentials', {
      ...parsed.data,
      // Relative, so the redirect resolves against the current origin and the
      // action keeps working across environments.
      redirectTo: '/admin',
    });

    // `signIn` throws NEXT_REDIRECT on success, so this line is only reached
    // when it did not redirect --- which means the credentials were rejected.
    recordFailure(key);
    return { error: 'invalidCredentials' };
  } catch (error) {
    if (isRedirectError(error)) {
      recordSuccess(key);
      throw error;
    }

    recordFailure(key);

    // AuthError and CredentialsSignin both mean "the credentials did not match";
    // anything else is a genuine bug and should surface rather than be hidden
    // behind a friendly message.
    if (isCredentialsError(error)) return { error: 'invalidCredentials' };

    throw error;
  }
}

/** `next/navigation` signals a redirect by throwing a tagged error object. */
function isRedirectError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest?: unknown }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

/** Auth.js throws its errors with a `type` discriminator and no public export. */
function isCredentialsError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error as { type?: unknown }).type === 'CredentialsSignin'
  );
}
