import {
  Boxes,
  Cloud,
  Code2,
  type LucideIcon,
  Database,
  Gauge,
  Layout,
  Layers,
  Monitor,
  Server,
  Settings2,
  ShoppingCart,
  Smartphone,
  Workflow,
} from 'lucide-react';

/**
 * Maps a stored `service.icon` value to a Lucide glyph.
 *
 * The database holds a *name*, not a component, so the admin can pick an icon
 * from a dropdown without shipping component references to the client. An
 * unknown name returns `null` and the caller falls back to a neutral glyph, so
 * a stale or hand-edited value degrades instead of throwing.
 */
const serviceIcons: Record<string, LucideIcon> = {
  code: Code2,
  layout: Layout,
  layers: Layers,
  'shopping-cart': ShoppingCart,
  server: Server,
  database: Database,
  cloud: Cloud,
  monitor: Monitor,
  smartphone: Smartphone,
  workflow: Workflow,
  settings: Settings2,
  gauge: Gauge,
  boxes: Boxes,
};

/** Icon options offered by the admin form, derived from the same map. */
export const serviceIconOptions = Object.keys(serviceIcons).sort();

/**
 * Renders the icon for a stored `service.icon` name.
 *
 * The lookup happens inside this component rather than in each card: a component
 * value assigned during another component's render is flagged by the React
 * Compiler lint rule as "created during render", because a new component type on
 * every render would reset its state. Keeping it here gives every caller a
 * stable element.
 */
export function ServiceIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = (name ? serviceIcons[name] : null) ?? Boxes;

  return <Icon className={className} aria-hidden="true" />;
}

export function getServiceIcon(name: string | null): LucideIcon {
  return (name ? serviceIcons[name] : null) ?? Boxes;
}
