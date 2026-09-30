'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { clientKey, recordMessage, throttle } from '@/server/contact/throttle';
import { CONTACT_LIMITS } from '@/config/contact';
import { contactSchema } from '@/server/contact/schema';

/**
 * Public contact form submission.
 *
 * A server action rather than an API route so the form keeps working without
 * client JavaScript, and so validation, throttling and the insert all happen in
 * one round trip. It returns a *code* rather than prose, because the copy is
 * translated by the client from the message catalogue; the action must never
 * invent user-facing English.
 *
 * Spam is handled with two cheap, dependency-free measures: a honeypot field
 * that a human never sees, and a per-client throttle. A captcha is deliberately
 * avoided --- it pushes the cost onto real visitors and adds a third-party
 * script for a portfolio that receives a handful of messages a week.
 */

export type ContactField = 'name' | 'email' | 'subject' | 'message';

export type ContactState = {
  status: 'idle' | 'success' | 'error';
  /** Which field to mark, mapped to a message key by the form. */
  error?: 'rateLimit' | 'generic';
  fieldErrors?: Partial<
    Record<ContactField, 'nameMin' | 'email' | 'subjectMin' | 'messageMin' | 'messageMax'>
  >;
  /** Echoed back so a failure does not clear what the visitor typed. */
  values?: { name?: string; email?: string; subject?: string; message?: string };
};

export async function submitContactAction(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

  // Honeypot: hidden from humans, tempting to bots. Report success so a bot
  // gets no signal that it was detected.
  if (typeof formData.get('company') === 'string' && formData.get('company') !== '') {
    return { status: 'success' };
  }

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;

    return {
      status: 'error',
      fieldErrors: {
        ...(flat.name?.[0] ? { name: flat.name[0] as 'nameMin' } : {}),
        ...(flat.email?.[0] ? { email: flat.email[0] as 'email' } : {}),
        ...(flat.subject?.[0] ? { subject: flat.subject[0] as 'subjectMin' } : {}),
        ...(flat.message?.[0] ? { message: flat.message[0] as 'messageMin' | 'messageMax' } : {}),
      },
      // Validation is the most common failure by far, so the visitor's words
      // are echoed back rather than making them retype the message.
      values: echo(raw),
    };
  }

  const requestHeaders = await headers();
  const key = clientKey(requestHeaders.get('x-forwarded-for'));

  if (throttle(key) > 0) {
    return { status: 'error', error: 'rateLimit', values: echo(raw) };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
    });

    recordMessage(key);

    return { status: 'success' };
  } catch (error) {
    // Log server-side, show a neutral message: a database error must not leak
    // its shape to an anonymous visitor.
    console.error('contact form: failed to store message', error);

    return { status: 'error', error: 'generic', values: echo(raw) };
  }
}

/** Trim and cap the echoed values so a huge payload cannot be reflected back. */
function echo(raw: Record<string, unknown>): ContactState['values'] {
  const clip = (value: unknown) =>
    typeof value === 'string' ? value.slice(0, CONTACT_LIMITS.messageMax) : undefined;

  return {
    name: clip(raw.name),
    email: clip(raw.email),
    subject: clip(raw.subject),
    message: clip(raw.message),
  };
}
