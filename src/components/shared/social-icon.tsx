'use client';

import { Mail, type LucideIcon } from 'lucide-react';
import {
  FacebookIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  TelegramIcon,
  WhatsAppIcon,
  XIcon,
  YouTubeIcon,
} from '@/components/shared/brand-icons';
import type { SocialPlatform } from '@/config/constants';

/**
 * Maps a stored `platform` value to its icon.
 *
 * Unknown platforms return `null` so the caller can render a text fallback —
 * adding a platform to the database must never break icon rendering.
 */
export const socialIcons: Partial<Record<SocialPlatform, LucideIcon>> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  facebook: FacebookIcon,
  x: XIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  email: Mail,
  whatsapp: WhatsAppIcon,
  telegram: TelegramIcon,
};

export function getSocialIcon(platform: string): LucideIcon | null {
  return socialIcons[platform as SocialPlatform] ?? null;
}

/** One or two letters used when a platform has no bundled icon. */
export function getSocialInitials(platform: string): string {
  return platform.slice(0, 2).toUpperCase();
}
