import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * `robots.txt`
 *
 * The whole public site is crawlable; the admin area and the auth endpoints are
 * not. Those two are also marked `noindex` in their own metadata, so a crawler
 * that ignores this file still does not index a login screen.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
