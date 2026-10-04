import {
  Atom,
  Blocks,
  Box,
  Boxes,
  Braces,
  Bug,
  Building2,
  Code2,
  Container,
  Cpu,
  CreditCard,
  Database,
  FileCode2,
  Gauge,
  GitBranch,
  Globe,
  KeyRound,
  Layers,
  MonitorSmartphone,
  Network,
  Package,
  Palette,
  Plug,
  ScanBarcode,
  Server,
  ShieldCheck,
  ShoppingCart,
  Table,
  Terminal,
  TestTube2,
  Users,
  Webhook,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * The icon vocabulary a skill can carry.
 *
 * `Skill.icon` stores a *key* from this map rather than a component name, so a
 * typo or a removed icon is a validation error the owner sees instead of a blank
 * gap in the public grid. Keys are stable, the components behind them are not:
 * swapping `Code2` for something better is a one-line change here.
 *
 * Lucide is used rather than brand marks because brand logos are not in the
 * icon set, and a third-party SVG per technology would mean shipping artwork the
 * owner cannot edit. The category heading and the progress bar already carry the
 * meaning; the icon is a visual anchor, so a generic shape is the honest choice.
 */
export const SKILL_ICONS: Record<string, LucideIcon> = {
  // Languages
  code: Code2,
  braces: Braces,
  terminal: Terminal,

  // Frontend
  atom: Atom,
  layers: Layers,
  palette: Palette,
  blocks: Blocks,
  container: Container,
  monitor: MonitorSmartphone,

  // Backend
  server: Server,
  workflow: Workflow,
  network: Network,
  webhook: Webhook,
  plug: Plug,
  key: KeyRound,

  // Data
  database: Database,
  table: Table,
  box: Box,
  boxes: Boxes,
  package: Package,

  // Tooling and operations
  'git-branch': GitBranch,
  gauge: Gauge,
  cpu: Cpu,
  wrench: Wrench,
  bug: Bug,
  flask: TestTube2,
  zap: Zap,

  // Domain concepts
  cart: ShoppingCart,
  card: CreditCard,
  barcode: ScanBarcode,
  building: Building2,
  users: Users,
  shield: ShieldCheck,
  file: FileCode2,
  globe: Globe,
};

/**
 * Keys in the order the picker shows them, grouped by the concept they stand
 * for so the list reads as a set rather than an alphabetical dump.
 */
export const SKILL_ICON_GROUPS: { label: string; keys: string[] }[] = [
  { label: 'Languages', keys: ['code', 'braces', 'terminal'] },
  { label: 'Frontend', keys: ['atom', 'layers', 'palette', 'blocks', 'container', 'monitor'] },
  { label: 'Backend', keys: ['server', 'workflow', 'network', 'webhook', 'plug', 'key'] },
  { label: 'Data', keys: ['database', 'table', 'box', 'boxes', 'package'] },
  { label: 'Tooling', keys: ['git-branch', 'gauge', 'cpu', 'wrench', 'bug', 'flask', 'zap'] },
  {
    label: 'Concepts',
    keys: ['cart', 'card', 'barcode', 'building', 'users', 'shield', 'file', 'globe'],
  },
];

/** Every valid key, derived from the map so the two cannot drift apart. */
export const SKILL_ICON_KEYS: string[] = Object.keys(SKILL_ICONS);

/**
 * Icon for a stored key, or `null` when the key is unknown.
 *
 * A null fallback on purpose: a row saved before an icon was added to this map
 * must render as an ordinary skill card, not take the grid down. The admin form
 * rejects unknown keys on save, so `null` here means legacy data, not new input.
 */
export function getSkillIcon(key: string | null | undefined): LucideIcon | null {
  if (!key) return null;
  return SKILL_ICONS[key] ?? null;
}
