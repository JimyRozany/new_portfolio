import type { ReactNode } from 'react';

/**
 * Root layout.
 *
 * `<html>` and `<body>` intentionally live in `app/[locale]/layout.tsx` because
 * the document language and direction depend on the active locale. This layout
 * only exists to satisfy the App Router for routes that sit outside the locale
 * segment (`/admin`, `/api/*`).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
