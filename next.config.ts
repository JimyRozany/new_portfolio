import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// next-intl is wired as a Next.js plugin so the `[locale]` segment is handled
// by the framework itself (typed routing, automatic param handling).
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Emit `type: module` for config files so we can use native `import` syntax.
  typedRoutes: true,
  images: {
    // Every image in this project is either uploaded through the admin media
    // library (local storage) or served from a remote host, so both are
    // explicitly allow-listed instead of using the permissive wildcard.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Tree-shake barrel imports from `lucide-react` to keep the client bundle small.
    optimizePackageImports: ['lucide-react', 'motion'],
  },
};

export default withNextIntl(nextConfig);
