import { z } from 'zod';
import { CONTACT_LIMITS } from '@/config/contact';

/**
 * Validation for the public contact form.
 *
 * Kept out of the `'use server'` action file on purpose: a server action module
 * may only export async functions, so a schema living there could never be
 * imported by a test or reused by the admin. The codes are deliberately terse
 * (`nameMin`, `messageMax`) rather than English sentences --- the form resolves
 * them against the message catalogue, which is what keeps the copy translatable.
 */

export const contactSchema = z.object({
  name: z.string().trim().min(CONTACT_LIMITS.name, 'nameMin'),
  email: z.string().trim().email('email'),
  subject: z.string().trim().min(CONTACT_LIMITS.subject, 'subjectMin'),
  message: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.message, 'messageMin')
    .max(CONTACT_LIMITS.messageMax, 'messageMax'),
});

export type ContactInput = z.infer<typeof contactSchema>;

export { CONTACT_LIMITS };
