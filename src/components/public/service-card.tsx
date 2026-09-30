import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import { ServiceIcon } from '@/components/shared/service-icon';
import type { ServiceItem } from '@/server/queries/portfolio';

/**
 * A single service offering.
 *
 * The icon is resolved from a name stored in the database through the shared
 * icon map, and falls back to a neutral glyph when the stored name is unknown
 * --- a typo in the CMS should degrade to a blank-looking card, not crash the
 * page or log a server error.
 */
export function ServiceCard({ service }: { service: ServiceItem }) {
  const t = useTranslations('services');
  const features = service.features ?? [];

  return (
    <Reveal offset="up" className="h-full">
      <Card className="group hover:border-border-strong h-full gap-5 p-6 transition-[border-color,box-shadow] duration-300 hover:shadow-md">
        <span
          aria-hidden="true"
          className="bg-accent-soft text-accent-foreground border-accent/20 grid size-12 place-items-center rounded-xl border transition-transform duration-300 group-hover:scale-105"
        >
          <ServiceIcon name={service.icon} className="size-5" />
        </span>

        <div className="flex flex-col gap-2">
          <h3 className="text-h4 font-semibold">{service.title}</h3>
          <p className="text-small text-muted-foreground">{service.description}</p>
        </div>

        {features.length > 0 ? (
          <>
            <p className="text-caption text-subtle-foreground">{t('includes')}</p>
            <ul className="flex flex-col gap-2">
              {features.map((feature) => (
                <li key={feature} className="text-small flex items-start gap-2.5">
                  <Check
                    className="text-accent mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                    strokeWidth={2.5}
                  />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Card>
    </Reveal>
  );
}
