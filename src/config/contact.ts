/**
 * Field limits for the public contact form.
 *
 * Kept in its own dependency-free module because two very different consumers
 * need it: the Zod schema (server) and the form itself (client, to render
 * `maxLength` and the "at least N characters" errors). A `'use server'` module
 * cannot be the home for shared values --- only async functions cross that
 * boundary, so anything else exported from one is silently stripped from the
 * client bundle and arrives as `undefined`.
 */
export const CONTACT_LIMITS = {
  name: 2,
  subject: 3,
  message: 20,
  messageMax: 5_000,
} as const;
