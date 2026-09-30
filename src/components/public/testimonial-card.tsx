import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import { UserAvatar } from '@/components/ui/avatar';
import { Prose } from '@/components/ui/prose';
import type { TestimonialItem } from '@/server/queries/portfolio';

/**
 * A single client testimonial.
 *
 * The rating is rendered as filled/empty stars *and* as a screen-reader-only
 * number, because a row of star glyphs conveys a rating visually and to nobody
 * else. `clipPath` clips the filled row over the empty one, which is cheaper
 * than two positioned rows of icons and keeps both aligned at any size.
 */
export function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  const t = useTranslations('testimonials');
  // Clamped in the schema but re-clamped here: a value edited directly in the
  // database must not render 40 stars or an empty bar.
  const rating = Math.min(5, Math.max(0, testimonial.rating));

  return (
    <Reveal offset="up" className="h-full">
      <Card className="h-full gap-5 p-6">
        <div className="flex items-center justify-between gap-3">
          <StarRow rating={rating} label={t('ratingLabel', { rating })} />

          {/* Decorative quote behind the content, anchored to the inline-start
              edge so it mirrors correctly in RTL. */}
          <span aria-hidden="true" className="font-display text-h1 text-accent/15 select-none">
            &rdquo;
          </span>
        </div>

        <Prose className="text-small flex-1">{testimonial.content}</Prose>

        <div className="border-border flex items-center gap-3 border-t pt-5">
          <UserAvatar src={testimonial.avatar} name={testimonial.name} size="sm" />
          <div className="flex min-w-0 flex-col">
            <span className="text-small truncate font-medium">{testimonial.name}</span>
            {testimonial.position || testimonial.company ? (
              <span className="text-caption text-subtle-foreground truncate">
                {[testimonial.position, testimonial.company].filter(Boolean).join(' · ')}
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </Reveal>
  );
}

function StarRow({ rating, label }: { rating: number; label: string }) {
  return (
    <div dir="ltr" className="relative shrink-0" role="img" aria-label={label}>
      {/* Empty track, then the filled row clipped to `rating` stars. */}
      <div className="text-subtle-foreground/30 flex gap-0.5">
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} className="size-4" fill="currentColor" aria-hidden="true" />
        ))}
      </div>

      <div
        aria-hidden="true"
        className="text-accent absolute inset-0 flex gap-0.5"
        style={{ clipPath: `inset(0 ${(5 - rating) * 100}% 0 0)` }}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} className="size-4" fill="currentColor" />
        ))}
      </div>
    </div>
  );
}
