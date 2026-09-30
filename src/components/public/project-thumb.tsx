import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

/**
 * Cover image for a project, with a generated fallback.
 *
 * Projects are seeded and then added from the dashboard, and most of them will
 * not have an uploaded thumbnail for a long time. Rendering a broken image (or
 * an empty grey box) would make the grid look unfinished, so a project with no
 * artwork gets a deterministic generated cover instead: the same slug always
 * produces the same pattern, and the colour is drawn from the single volt accent
 * plus the surface tokens so it never fights the rest of the page.
 */
export function ProjectThumb({
  src,
  alt,
  slug,
  className,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  priority = false,
}: {
  /** Uploaded path, or `null` when the project has no artwork yet. */
  src: string | null;
  /** Always required: an image with no alt text is worse than no image. */
  alt: string;
  slug: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover transition-transform duration-500 ease-out', className)}
      />
    );
  }

  return <GeneratedCover slug={slug} label={alt} className={className} />;
}

/** Stable 32-bit hash so a slug always maps to the same visual variant. */
function hashSlug(slug: string): number {
  let hash = 0;

  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash << 5) - hash + slug.charCodeAt(index);
    hash |= 0; // Keep it a 32-bit integer.
  }

  return Math.abs(hash);
}

function GeneratedCover({
  slug,
  label,
  className,
}: {
  slug: string;
  label: string;
  className?: string;
}) {
  const hash = hashSlug(slug);
  const variant = hash % 4;
  const rotation = hash % 40;
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('');

  return (
    // `role="img"` + the same `label` keeps the accessibility tree identical
    // whether or not artwork exists, so the fallback is not a regression.
    <div
      role="img"
      aria-label={label}
      className={cn('bg-surface-2 absolute inset-0 overflow-hidden', className)}
    >
      <div
        aria-hidden="true"
        className="bg-grid absolute inset-0 [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)] opacity-70"
      />

      {/* One accent arc, rotated per slug so the grid is varied but stable. */}
      <div
        aria-hidden="true"
        className="border-accent/12 absolute -end-1/4 -top-1/3 size-[130%] rounded-full border-[3rem] blur-2xl"
        style={{ transform: `rotate(${rotation}deg)` }}
      />

      {/* Four layout variants, chosen by the hash. */}
      {variant === 0 ? (
        <div
          aria-hidden="true"
          className="border-accent/25 absolute -start-10 -bottom-16 size-56 rounded-[3rem] border-[1.5rem]"
        />
      ) : null}
      {variant === 1 ? (
        <div
          aria-hidden="true"
          className="bg-accent/8 absolute inset-y-8 start-1/3 w-px -skew-x-12"
        />
      ) : null}
      {variant === 2 ? (
        <>
          <div
            aria-hidden="true"
            className="border-accent/20 absolute start-8 top-8 size-24 rounded-2xl border"
          />
          <div
            aria-hidden="true"
            className="border-border absolute end-10 bottom-10 size-16 rotate-45 rounded-xl border"
          />
        </>
      ) : null}
      {variant === 3 ? (
        <div
          aria-hidden="true"
          className="border-border absolute inset-x-10 top-1/2 h-px border-t border-dashed"
        />
      ) : null}

      <span
        aria-hidden="true"
        className="font-display text-display-sm text-foreground/8 absolute start-5 bottom-4 font-semibold tracking-tight select-none"
      >
        {initials}
      </span>
    </div>
  );
}
