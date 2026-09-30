import { IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

/**
 * Typography is deliberately limited to four self-hosted faces so the site
 * stays fast and consistent:
 *
 *  - `Inter`            → Latin body copy (excellent hinting at small sizes).
 *  - `Space Grotesk`    → Latin display headings (technical, geometric).
 *  - `IBM Plex Sans Arabic` → Arabic body *and* display, so the two scripts
 *    share a voice instead of looking like two different products.
 *  - `JetBrains Mono`   → code, tech tags and small technical labels.
 *
 * Each face is exposed as a CSS variable and wired into `@theme inline` inside
 * `globals.css`; nothing else in the codebase should reference the family name
 * directly.
 */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display-face',
  display: 'swap',
  // The Arabic face is a better display face for Arabic, so Space Grotesk is
  // only preloaded on Latin-first pages.
  preload: false,
});

export const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
  // Only fetched by the browser when Arabic glyphs are actually rendered.
  preload: false,
  weight: ['300', '400', '500', '600', '700'],
});

export const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-face',
  display: 'swap',
  preload: false,
});

/** Font variables injected once on the document root. */
export const fontVariables = [
  inter.variable,
  spaceGrotesk.variable,
  ibmPlexArabic.variable,
  jetBrainsMono.variable,
].join(' ');
