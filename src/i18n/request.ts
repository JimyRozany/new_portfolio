import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * Loads the translation bundle for the active locale.
 *
 * Messages are returned from this config rather than imported inside components
 * so the entire dictionary stays scoped to the request and out of the client
 * bundle (only the namespaces a Client Component actually reads are shipped).
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  // Any unknown prefix (`/fr`, a mistyped URL) falls back to the default locale
  // instead of crashing the render.
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // Default patterns for `t.rich()` / `<Time>` style helpers.
    formats: {
      dateTime: {
        short: { day: 'numeric', month: 'short', year: 'numeric' },
        long: { day: 'numeric', month: 'long', year: 'numeric' },
      },
      number: {
        precise: { maximumFractionDigits: 2 },
      },
    },
  };
});
