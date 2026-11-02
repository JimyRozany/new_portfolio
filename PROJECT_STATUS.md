# PROJECT_STATUS
UI redesign ("deep-space observatory") complete for the whole public site. Backend/admin logic untouched.
Phase: 1 (public site) complete; phase 2 (DB + admin) feature-complete except uploads; needs local verification.

## Done
- Phase 1: Next 15, Tailwind 4, AR (RTL default)/EN, theme toggle, space hero, home, project pages, sitemap/robots/hreflang.
- DB: schema + migration `init`, db.ts (null without DATABASE_URL), data.ts (DB -> content.ts fallback), idempotent seed.
- Auth: HMAC-signed httpOnly cookie (edge-safe auth.ts + server session.ts), bcrypt login, zod, in-memory throttle, middleware gate, `requireAdmin()` in every page/action, `npm run admin:set`.
- Admin CRUD (all with zod + requireAdmin + revalidatePath):
  - Projects (list, create/edit, publish/featured toggles, delete)
  - Experience (list, create/edit, delete)
  - Skills (inline add/edit/delete, grouped by category)
  - Services (inline add/edit/delete, published flag)
  - Home content / Settings (name, role, intro, about, edu; empty = built-in CV text)
  - Messages inbox (mark read/unread, delete) + dashboard cards with unread count
- Public: Services section (hidden while no published services), contact form (honeypot, zod, 3 msgs/10 min per IP in-memory) saving to Message, project pages show imageUrl / live / repo links.
- Verified in sandbox: `next build` compile + lint + type check pass (Prisma client stubbed). Fails only at page-data collection because `prisma generate` can't download engines here.

## Redesign
- Design system in globals.css: dark (near-black + one amber star) and light (warm paper "star chart", not an inversion) tokens; fonts Bricolage Grotesque (Latin display), Readex Pro (Arabic + body), JetBrains Mono (labels). Admin shares the tokens (.glass/.btn/.chip kept).
- Hero: canvas starfield + dust + rare meteor with cursor parallax (30fps cap, pauses off-screen, static for reduced motion), CSS-3D orbit system with counter-rotated planets, word-mask name reveal, magnetic CTA, scroll cue.
- Nav: active-section underline, reading-progress bar, full-screen mobile menu (Esc closes, scroll lock), language switch keeps the current page.
- Projects: varied editorial gallery, per-project CSS "Interface concept" previews from real titles (imageUrl overrides), cursor spotlight, compact rows for personal projects; detail page with numbered contributions + prev/next.
- Experience timeline with scroll progress; skills by category + marquee; services list; contact with copy-email + underline form; footer wordmark.
- No new animation dependency; everything disabled by prefers-reduced-motion.
- Verified in sandbox (headless Chromium, stubbed Prisma / fallback content): EN/AR, dark/light, desktop/mobile, no overflow or console errors, menu/Esc/scroll-lock, reduced motion. NOT verified: real DB data, contact-form submit, admin CRUD screens, tablet widths, Arabic light theme, Lighthouse.

## Not done
- Open Graph image
- Image/CV upload (Vercel Blob; BLOB_READ_WRITE_TOKEN). imageUrl is currently a pasted URL.
- Rate limits are in-memory (per instance); use a shared store (Upstash/Redis) if abuse appears
- Contact email notification (messages are only stored; check /admin/messages)
- Services not in the top nav (section appears on the home page when published)
- Project previews are generic concepts; add real screenshots via the admin imageUrl field

## Verify locally
1. `npm i && npx prisma generate && npx tsc --noEmit && npm run build`
2. `npm run db:seed` then set a 10+ char ADMIN_PASSWORD and `npm run admin:set`
3. /admin: edit each section, confirm /ar and /en update within ~60s; send a message from the contact form and see it in /admin/messages

## Next exact task
Open Graph image (src/app/[locale]/opengraph-image.tsx), then Vercel Blob upload for project images and CV, then optional email notification for new messages.
