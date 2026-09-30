'use client';

import { getSocialIcon } from '@/components/shared/social-icon';
import { socialLabels } from '@/config/navigation';
import type { Locale } from '@/i18n/routing';

export type SocialLinkItem = { id: number; platform: string; url: string };

/**
 * Row of social profile links.
 *
 * A client component because the icon map lives behind a `'use client'` module,
 * and a server component cannot *call* a client function --- it may only render
 * one. Splitting the list out lets the page stay a server component that simply
 * passes the rows down, instead of pulling the whole page across the boundary.
 */
export function SocialLinks({
  socials,
  locale,
  title,
  className,
}: {
  socials: SocialLinkItem[];
  locale: Locale;
  /** Visually-hidden heading, so the group is announced. Pass `undefined` for none. */
  title?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-4 ${className ?? ''}`}>
      {title ? (
        <h2 className="text-caption text-subtle-foreground font-medium tracking-[0.18em] uppercase">
          {title}
        </h2>
      ) : null}

      <ul className="flex flex-wrap gap-2">
        {socials.map((social) => {
          const Icon = getSocialIcon(social.platform);
          const label = socialLabels[social.platform]?.[locale] ?? social.platform;

          return (
            <li key={social.id}>
              <a
                href={social.url}
                target="_blank"
                rel="noreferrer noopener"
                // The hostname keeps several links to the same platform
                // distinguishable in the accessibility tree.
                aria-label={`${label} — ${hostOf(social.url)}`}
                className="border-border bg-surface text-muted-foreground hover:border-foreground hover:text-foreground focus-visible:outline-ring grid size-11 place-items-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {Icon ? <Icon className="size-4.5" aria-hidden="true" /> : null}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Hostname for the accessible name, with a safe fallback for a malformed URL. */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
