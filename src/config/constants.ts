/**
 * Domain-level enumerations shared by the CMS, the validation layer and the UI.
 *
 * Keeping them here (instead of inline in components) means a new project
 * status or message status only has to be added in one place.
 */

export const PROJECT_STATUSES = ['completed', 'in_progress', 'archived'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const MESSAGE_STATUSES = ['unread', 'read', 'archived'] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const USER_ROLES = ['admin', 'editor'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SKILL_CATEGORIES = [
  'frontend',
  'backend',
  'database',
  'devops',
  'tools',
  'other',
] as const;
export type SkillCategorySlug = (typeof SKILL_CATEGORIES)[number];

export const PROJECT_CATEGORIES = [
  'web_app',
  'ecommerce',
  'erp',
  'saas',
  'api',
  'mobile',
  'other',
] as const;
export type ProjectCategorySlug = (typeof PROJECT_CATEGORIES)[number];

export const MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/avif',
] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 5);

/** Social platforms the owner can activate from the dashboard. */
export const SOCIAL_PLATFORMS = [
  'github',
  'linkedin',
  'facebook',
  'x',
  'instagram',
  'youtube',
  'email',
  'whatsapp',
  'telegram',
  'dribbble',
  'behance',
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
