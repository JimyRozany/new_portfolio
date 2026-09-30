# Modern Developer Portfolio --- Project Specification

## 1. Project Overview

Build a modern, premium, highly polished personal portfolio website
using **Next.js**.

The project must have two main parts:

1.  **Public Portfolio Website**
    - Modern, beautiful, responsive design.
    - Optimized for desktop, tablet, and mobile.
    - Arabic and English languages.
    - Dark and light themes.
    - Smooth animations and micro-interactions.
    - SEO-friendly pages.
    - Fast loading and accessible UI.
2.  **Admin Dashboard / CMS**
    - Protected authentication.
    - Manage portfolio content without editing code.
    - Add, edit, delete, and reorder content.
    - Dashboard should use the same design system as the public
      website.
    - Responsive and usable on desktop/tablet/mobile.

The project should be designed as a real production-ready portfolio/CMS,
not as a static demo.

---

# 2. Main Goals

The final application should:

- Look modern and premium.
- Feel like a professional developer/product designer portfolio.
- Support Arabic RTL and English LTR correctly.
- Support light and dark themes.
- Have reusable components.
- Have clean architecture.
- Be easy for an AI coding agent to extend.
- Keep content separate from UI code.
- Provide a complete admin dashboard for portfolio management.
- Be responsive.
- Have good SEO.
- Have accessible UI.
- Use animations carefully without making the website slow.
- Be prepared for deployment.

---

# 3. Technology Stack

## Frontend

- Next.js
- React
- JavaScript or TypeScript
- Tailwind CSS
- shadcn/ui or a similar accessible component system
- Lucide Icons
- Framer Motion / Motion for animations
- next-intl or an equivalent internationalization solution

## Backend / Data

Preferred approach:

- Next.js full-stack application.
- Next.js Route Handlers / Server Actions where appropriate.
- MySQL 8 for production (the local and deployed database).
- Prisma ORM.

The architecture must keep database access isolated from UI components.

## Authentication

Use a secure authentication solution such as:

- Auth.js / NextAuth

The admin area must not be publicly accessible.

---

# 4. Language System

The application must support:

- English: `en`
- Arabic: `ar`

English should use:

```text
LTR
```

Arabic should use:

```text
RTL
```

The language system must affect:

- Navigation
- Hero content
- About content
- Projects
- Skills
- Experience
- Services
- Contact
- Footer
- Admin content
- Validation messages
- Buttons
- Empty states
- Error messages
- Metadata where applicable

Do not hardcode English or Arabic strings inside reusable components.

Use translation files and/or localized database fields.

Recommended route structure:

```text
/en
/ar
/en/projects
/ar/projects
/en/contact
/ar/contact
```

Admin routes can remain language-independent if appropriate:

```text
/admin
/admin/projects
/admin/experience
```

---

# 5. Theme System

The website must support:

- Light mode
- Dark mode
- System preference

Users should be able to switch between:

```text
Light
Dark
System
```

The selected theme should persist between visits.

Avoid designing the dark theme as simply an inverted light theme.

Both themes should be intentionally designed.

---

# 6. Visual Direction

The portfolio should feel:

- Modern
- Premium
- Minimal
- Professional
- Elegant
- Technical
- Creative
- Fast

Avoid:

- Generic Bootstrap-looking layouts.
- Excessive gradients.
- Excessive glassmorphism.
- Huge unnecessary animations.
- Too many colors.
- Template-like designs.
- Crowded dashboards.
- Excessive shadows.

Use:

- Strong typography.
- Clear hierarchy.
- Large whitespace.
- Carefully designed cards.
- Subtle borders.
- Soft shadows where useful.
- Elegant hover states.
- Smooth page transitions.
- Modern responsive layouts.
- High-quality project presentation.

The design should feel comparable to a premium modern developer/product
portfolio.

---

# 7. Public Website Structure

## 7.1 Home Page

The home page should contain:

### Hero

Include:

- Name
- Professional title
- Short introduction
- Primary CTA
- Secondary CTA
- Social links
- Optional profile image
- Subtle visual/animation

Example structure:

```text
Hello, I'm [Name]

Full-Stack Developer
Building modern web applications with Laravel, React and Next.js.

[View Projects] [Contact Me]
```

The exact copy should be editable from the dashboard.

---

## 7.2 About Section

Include:

- Short biography
- Longer biography
- Profile image
- Location
- Years of experience
- Main technologies
- Resume download

All content should be editable.

---

## 7.3 Skills

Skills should support:

- Name
- Icon
- Category
- Experience level
- Sort order
- Featured status

Example categories:

```text
Frontend
Backend
Database
DevOps
Tools
Other
```

Admin should be able to:

- Add
- Edit
- Delete
- Reorder
- Enable/disable

---

# 8. Projects

Projects are one of the most important sections.

Each project should support:

```text
id
title_en
title_ar
slug
description_en
description_ar
long_description_en
long_description_ar
thumbnail
gallery
technologies
category
live_url
github_url
featured
status
sort_order
created_at
updated_at
```

Project statuses may include:

```text
Completed
In Progress
Archived
```

The public project card should show:

- Image
- Title
- Short description
- Technologies
- Links
- Hover animation

Project details page:

```text
/projects/[slug]
```

Should contain:

- Hero image
- Project title
- Description
- Technologies
- Gallery
- Features
- Challenges
- Solution
- Results
- Live demo
- GitHub repository
- Related projects

---

# 9. Experience

Experience section should support:

```text
company
position
description
start_date
end_date
current
location
technologies
sort_order
```

Support both English and Arabic descriptions.

Public UI can use:

- Timeline
- Cards
- Interactive timeline

Admin can:

- Add
- Edit
- Delete
- Reorder

---

# 10. Education

Support:

- Institution
- Degree
- Field
- Description
- Start date
- End date
- Current
- Location

All localized fields should support English and Arabic.

---

# 11. Services

Optional but recommended.

Examples:

```text
Web Development
Frontend Development
Backend Development
API Development
ERP / Business Systems
UI Development
Technical Consulting
```

Each service should contain:

- Icon
- Title EN
- Title AR
- Description EN
- Description AR
- Features
- Sort order
- Active status

---

# 12. Testimonials

Testimonials should support:

```text
name
position
company
avatar
content_en
content_ar
rating
featured
sort_order
```

Admin CRUD:

- Create
- Read
- Update
- Delete
- Reorder
- Enable/disable

---

# 13. Contact

Public contact page should include:

- Name
- Email
- Subject
- Message

The form must have:

- Validation
- Loading state
- Success state
- Error state
- Spam protection consideration

Admin should be able to view submitted messages.

Contact message fields:

```text
id
name
email
subject
message
status
created_at
```

Statuses:

```text
Unread
Read
Archived
```

---

# 14. Social Links

Manage social links from the dashboard.

Examples:

- GitHub
- LinkedIn
- Facebook
- X
- Instagram
- YouTube
- Email

Fields:

```text
platform
url
icon
sort_order
active
```

---

# 15. Resume

Admin should be able to:

- Upload resume
- Replace resume
- Delete resume
- Set active resume

Public website should have:

```text
Download Resume
```

---

# 16. Admin Dashboard

The admin dashboard is a core requirement.

Route:

```text
/admin
```

It must require authentication.

## Dashboard Overview

Show cards such as:

```text
Projects
Experience
Skills
Testimonials
Messages
Views
```

Optional charts can be added later.

---

# 17. Admin Sidebar

Recommended navigation:

```text
Dashboard

Content
  ├── Hero
  ├── About
  ├── Projects
  ├── Skills
  ├── Experience
  ├── Education
  ├── Services
  ├── Testimonials
  └── Social Links

Messages

Media

Settings
  ├── General
  ├── SEO
  ├── Language
  └── Appearance

Logout
```

---

# 18. CRUD Requirements

Every manageable entity should support:

```text
Create
Read
Update
Delete
```

Where relevant:

```text
Search
Filter
Sort
Pagination
Bulk actions
Enable/disable
Drag-and-drop ordering
```

Delete actions should require confirmation.

Use optimistic UI only where it improves UX and does not risk data loss.

---

# 19. Admin UI

The dashboard should be modern and consistent with the public website.

Required:

- Responsive sidebar
- Top navigation
- Breadcrumbs
- Tables
- Cards
- Forms
- Modals
- Drawers
- Toast notifications
- Empty states
- Loading skeletons
- Error states
- Confirmation dialogs

Forms must have:

- Client-side validation
- Server-side validation
- Clear errors
- Loading states
- Success feedback

---

# 20. Database Design

Initial entities:

```text
users
projects
project_images
skills
skill_categories
experiences
educations
services
testimonials
social_links
contact_messages
site_settings
media
```

Potential relationships:

```text
projects
  └── project_images

skills
  └── skill_categories
```

Localized content can initially be represented with:

```text
title_en
title_ar
description_en
description_ar
```

For a small portfolio this is intentionally simple and easy to maintain.

---

# 21. Suggested Database Schema

## users

```text
id
name
email
password
role
created_at
updated_at
```

## projects

```text
id
title_en
title_ar
slug
description_en
description_ar
long_description_en
long_description_ar
thumbnail
category
live_url
github_url
featured
status
sort_order
created_at
updated_at
```

## project_images

```text
id
project_id
image
alt_en
alt_ar
sort_order
created_at
updated_at
```

## skills

```text
id
name
icon
category_id
level
featured
sort_order
created_at
updated_at
```

## skill_categories

```text
id
name_en
name_ar
sort_order
created_at
updated_at
```

## experiences

```text
id
company
position_en
position_ar
description_en
description_ar
start_date
end_date
current
location
sort_order
created_at
updated_at
```

## educations

```text
id
institution
degree_en
degree_ar
field_en
field_ar
description_en
description_ar
start_date
end_date
current
sort_order
created_at
updated_at
```

## services

```text
id
title_en
title_ar
description_en
description_ar
icon
features_en
features_ar
active
sort_order
created_at
updated_at
```

## testimonials

```text
id
name
position_en
position_ar
company
avatar
content_en
content_ar
rating
featured
sort_order
created_at
updated_at
```

## social_links

```text
id
platform
url
icon
active
sort_order
created_at
updated_at
```

## contact_messages

```text
id
name
email
subject
message
status
created_at
updated_at
```

## site_settings

```text
id
key
value
created_at
updated_at
```

---

# 22. Media Management

Create a centralized media system.

Admin should be able to:

- Upload image
- Preview image
- Delete image
- Replace image
- Select existing image
- Use images for projects/profile/content

Recommended supported formats:

```text
jpg
jpeg
png
webp
svg
```

Images should be optimized.

Do not upload unnecessarily huge files.

---

# 23. SEO

Implement:

- Metadata
- Dynamic page titles
- Dynamic descriptions
- Open Graph
- Twitter/X cards
- Canonical URLs
- Sitemap
- Robots.txt
- Structured data where useful

Project pages should generate dynamic metadata.

Support Arabic and English metadata.

---

# 24. Performance

Performance is a major requirement.

Use:

- Next.js Image
- Server Components where appropriate
- Dynamic imports when useful
- Lazy loading
- Optimized fonts
- Minimal client-side JavaScript
- Proper caching
- Optimized images
- Avoid unnecessary libraries

Do not make every component a Client Component.

---

# 25. Accessibility

The application should follow good accessibility practices.

Requirements:

- Semantic HTML
- Keyboard navigation
- Focus states
- Accessible forms
- Proper labels
- Alt text
- Good color contrast
- Accessible dialogs
- Accessible menus
- Screen-reader-friendly navigation

Do not rely only on color to communicate state.

---

# 26. Responsive Design

Breakpoints should cover:

```text
Mobile
Tablet
Laptop
Desktop
Large Desktop
```

The website must be tested at least around:

```text
320px
375px
768px
1024px
1280px
1440px
1920px
```

Do not simply shrink desktop designs.

Mobile layouts should be intentionally designed.

---

# 27. Animation System

Use animations carefully.

Recommended:

- Fade in
- Slide in
- Scale
- Hover transitions
- Staggered lists
- Page transitions
- Scroll reveal
- Interactive project cards

Avoid:

- Constant movement
- Excessive parallax
- Long animations
- Animation on every element

Respect:

```text
prefers-reduced-motion
```

---

# 28. Component Architecture

Suggested structure:

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── page.jsx
│   │   ├── about/
│   │   ├── projects/
│   │   ├── experience/
│   │   └── contact/
│   │
│   ├── admin/
│   │   ├── page.jsx
│   │   ├── projects/
│   │   ├── skills/
│   │   ├── experience/
│   │   └── settings/
│   │
│   └── api/
│
├── components/
│   ├── ui/
│   ├── public/
│   ├── admin/
│   ├── layout/
│   └── shared/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── validation/
│   ├── utils/
│   └── i18n/
│
├── hooks/
├── services/
├── types/
└── config/
```

Keep components small and reusable.

---

# 29. Design System

Create a centralized design system.

Define:

- Colors
- Typography
- Spacing
- Border radius
- Shadows
- Breakpoints
- Animation durations
- Component variants

Do not scatter design values throughout the project.

Use CSS variables / Tailwind theme tokens where appropriate.

---

# 30. Typography

Choose a modern font supporting both:

- Latin
- Arabic

The Arabic font must look professional and match the English typography.

Typography hierarchy:

```text
Display
H1
H2
H3
Body
Small
Caption
```

Do not use too many font families.

---

# 31. Security

Admin functionality must be secure.

Requirements:

- Authentication
- Authorization
- Protected routes
- Server-side authorization checks
- Secure password handling
- Input validation
- CSRF protection where applicable
- Rate limiting for public forms
- File upload validation
- Prevent unauthorized CRUD operations
- Never expose secrets to the client

Never trust client-side authorization.

---

# 32. Environment Variables

Use:

```text
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
```

Add additional variables only when required.

Create:

```text
.env.example
```

Never commit:

```text
.env
```

---

# 33. Error Handling

Implement:

- Global error page
- Not found page
- API error handling
- Form errors
- Database error handling
- Loading states
- Empty states

Errors shown to users should be friendly.

Do not expose database errors or secrets.

---

# 34. Seed Data

Create realistic development seed data.

The seed should contain:

- Admin user
- Example projects
- Example skills
- Example experience
- Example education
- Example services
- Example testimonials
- Social links
- Site settings

The seed content should look professional enough to demonstrate the
design.

---

# 35. Authentication Flow

Admin login:

```text
/admin/login
```

After successful authentication:

```text
/admin
```

Unauthenticated access:

```text
/admin/*
```

should redirect to:

```text
/admin/login
```

Admin logout must invalidate the session.

---

# 36. Admin Content Workflow

Example:

```text
Login
  ↓
Dashboard
  ↓
Projects
  ↓
Create Project
  ↓
Enter EN content
  ↓
Enter AR content
  ↓
Upload images
  ↓
Select technologies
  ↓
Set featured/status
  ↓
Save
  ↓
Preview
  ↓
Publish
```

---

# 37. Preview System

Where practical, admin should be able to preview content before
publishing.

Example:

```text
Save Draft
Preview
Publish
```

For the first version, a simpler approach is acceptable:

```text
Save
View on Website
```

---

# 38. Homepage Sections

Homepage should be configurable.

Recommended order:

```text
Navbar
Hero
Trusted Technologies / Skills
About
Featured Projects
Experience
Services
Testimonials
CTA
Contact
Footer
```

The admin should eventually be able to enable/disable sections.

---

# 39. Navbar

Desktop:

```text
Logo
Home
About
Projects
Experience
Services
Contact

Language
Theme
```

Mobile:

```text
Logo
Menu
```

Mobile menu should include language and theme controls.

---

# 40. Footer

Include:

- Name/logo
- Short description
- Navigation
- Social links
- Email
- Copyright
- Language switcher
- Theme switcher where appropriate

---

# 41. Project Filtering

Projects should support categories.

Example:

```text
All
Web Apps
E-commerce
ERP
SaaS
Mobile
Other
```

Filtering should work smoothly without unnecessary page reloads.

---

# 42. Project Search

Optional but recommended for the project listing page.

Search should support:

- Project title
- Technology
- Category

---

# 43. Dashboard UX Rules

The admin dashboard must prioritize productivity.

For every CRUD page:

```text
Page title
Description
Primary action
Search/filter
Content list
Pagination
Empty state
```

Example:

```text
Projects

Manage your portfolio projects.

[+ Add Project]

Search projects...
Filter: All

Project list/table
```

---

# 44. Forms

Forms should be divided into logical sections.

Example project form:

```text
Basic Information

English
  Title
  Short Description
  Long Description

Arabic
  Title
  Short Description
  Long Description

Project Details
  Category
  Status
  Technologies
  Live URL
  GitHub URL

Media
  Thumbnail
  Gallery

Publishing
  Featured
  Sort Order
```

---

# 45. Validation

Use a schema validation library such as Zod.

Validation must exist on:

- Client
- Server

Examples:

```text
Title required
Valid URL
Valid email
Required image where necessary
Maximum lengths
Allowed file types
Allowed file sizes
```

---

# 46. API / Server Architecture

Do not place database queries directly inside UI components.

Preferred:

```text
UI
 ↓
Server Action / Route Handler
 ↓
Service / Data Layer
 ↓
Prisma
 ↓
Database
```

Keep business logic reusable.

---

# 47. State Management

Do not introduce global state management unless necessary.

Prefer:

- Server Components
- URL state
- React state
- Server Actions
- React Query only where it provides clear value

Avoid Redux for simple CMS functionality unless a real requirement
appears.

---

# 48. Code Quality

The AI coding agent must:

- Keep functions small.
- Use meaningful names.
- Avoid duplicate code.
- Create reusable components.
- Avoid unnecessary abstractions.
- Avoid premature optimization.
- Keep business logic out of UI.
- Keep secrets server-side.
- Add comments only where they provide real value.

---

# 49. Git Strategy

Recommended branches:

```text
main
develop
feature/*
fix/*
```

Suggested commits:

```text
feat: initialize portfolio project
feat: add authentication
feat: add project management
feat: add bilingual content
feat: add theme system
feat: add public portfolio
fix: ...
refactor: ...
```

---

# 50. Development Phases

## Phase 1 --- Project Foundation

Tasks:

- Initialize Next.js
- Configure Tailwind
- Configure UI system
- Configure fonts
- Configure ESLint
- Configure formatting
- Create folder structure
- Create theme system
- Create language system
- Create base layout
- Create reusable UI components

Status:

```text
[x] Complete
```

Delivered:

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript 5.9 with
  `strict`, `noUncheckedIndexedAccess` and `noUnusedLocals`.
- Tailwind CSS v4 with an `Editorial Technical` design system expressed as
  OKLCH tokens, a single "volt" accent, and full dark-mode support.
- Fonts wired through `next/font` --- Inter (body), Space Grotesk (display),
  IBM Plex Sans Arabic, JetBrains Mono.
- Language system: `next-intl` with `en` / `ar`, `localePrefix: 'always'`,
  locale cookie persistence, RTL detection, and translated metadata.
- Base layout: root layout, locale layout, `not-found`, `error`, and a
  single client provider boundary (theme + motion + toasts).
- 18 reusable UI primitives and 8 motion primitives, all free of hard-coded
  copy so they can be reused by the public site and the admin dashboard.
- `npm run validate` (typecheck + lint + build) passes, and `npm audit`
  reports 0 vulnerabilities.

---

## Phase 2 --- Database

Tasks:

- Configure MySQL
- Configure Prisma
- Create schema
- Create migrations
- Create seed
- Test database connection

Status:

```text
[x] Complete
```

Delivered:

- MySQL 8 database `portfolio_db` (utf8mb4 / utf8mb4_unicode_ci) --- the
  engine that was actually available, so migrations and the seed are verified
  end to end instead of written blind.
- 13 tables plus `_prisma_migrations`: `users`, `projects`, `project_images`,
  `skills`, `skill_categories`, `experiences`, `educations`, `services`,
  `testimonials`, `social_links`, `contact_messages`, `media`,
  `site_settings`.
- Real enums for `role`, project `status` and message `status`, so state is
  validated by the database rather than by free-text strings.
- Composite indexes on every column the public site filters or sorts by
  (`status + sort_order`, `featured + sort_order`, `category`, `created_at`).
- `prisma.config.ts` for Prisma 7 --- the `url` was removed from the
  `datasource` block, so the connection string is read here and handed to the
  client through `@prisma/adapter-mariadb`. `mariadb` is pinned to `^3.5.4` via
  an npm override because the version Prisma depends on has an unpatched
  high-severity advisory.
- `src/lib/prisma.ts` --- a single cached client, isolated from UI code with
  `server-only`, so the connection pool survives hot reloads.
- Idempotent seed populated from the owner's CV: 1 admin, 3 skill categories,
  22 skills, 11 projects, 3 roles, 1 degree, 4 services, 4 social links and
  13 site settings. Re-running it refreshes content instead of duplicating it.
- `npm run db:reset-password` to set a bcrypt (cost 12) hashed password.

Note --- the specification originally asked for PostgreSQL. MySQL was used
because it is the engine available on the development machine, which unblocked
migrations and seeding; the schema deliberately sticks to portable constructs so
switching providers later is a `provider` change plus a fresh migration.

---

## Phase 3 --- Authentication

Tasks:

- Configure authentication
- Admin user
- Login page
- Logout
- Protected admin routes
- Server-side authorization

Status:

```text
[x] Complete
```

Implementation notes:

- Auth.js v5 (`next-auth@5.0.0-beta.32`) with a credentials provider and a
  **JWT** session, so authorisation costs no database round trip.
- The config is split: `src/auth.config.ts` is edge-safe (no Prisma, no bcrypt)
  and is what the proxy reads; `src/auth.ts` adds the credentials provider,
  bcrypt verification and the session callbacks.
- Rate limiting lives in `src/server/auth/rate-limit.ts` (5 attempts per 15
  minutes, keyed on IP + email).
- Two independent checks guard the dashboard:
  1. `src/proxy.ts` redirects anonymous visitors to `/admin/login` and keeps the
     deep link in `callbackUrl`.
  2. `requireUser()` on every admin render path --- the real boundary, since a
     proxy matcher can be bypassed by posting straight to a Server Action.
- The `authorized` Auth.js callback is deliberately **not** used. Because the
  proxy supplies its own handler, Auth.js skips the `!authorized` fallback and a
  `false` return would be silently ignored; the guard therefore lives in the
  proxy, checked against `request.auth`.
- The dashboard sits outside the `[locale]` segment, is English-only, and gets
  its own `NextIntlClientProvider` with only the `common` and `admin`
  namespaces.
- `prisma/seed.ts` hashes `ADMIN_PASSWORD` at seed time (bcrypt cost 12) and
  only applies it on **create**, so re-seeding never resets a changed password.
  `npm run db:reset-password` is the explicit way to change it.

---

Status:

```text
[~] In Progress
```

Implementation notes:

Done so far:

- Dashboard layout: `src/app/admin/layout.tsx` (document shell, English/LTR)
  and `src/app/admin/(dashboard)/layout.tsx` (guarded shell).
- Sidebar (`src/components/admin/sidebar.tsx`) driven by
  `src/config/admin-navigation.ts`, with a collapsed icon rail persisted to
  `localStorage` and an unread-messages badge.
- Header with breadcrumb trail derived from the pathname, theme switcher and a
  sign-out control posting to a server action.
- Overview screen with stat cards, recently updated projects and latest
  messages.
- Read layer for every entity in `src/server/queries/admin.ts` (search, filter,
  pagination, counts, media-usage lookups).

Still to do: the CRUD screens, message triage, settings, media uploads.

---

## Phase 5 --- Public Portfolio

Tasks:

- [x] Navbar
- [x] Hero
- [x] About
- [x] Skills
- [x] Projects
- [x] Project details
- [x] Experience
- [x] Education
- [x] Services
- [x] Testimonials
- [x] Contact
- [x] Footer

Status:

```text
[x] Complete
```

---

## Phase 6 --- Internationalization

Tasks:

- [x] English
- [x] Arabic
- [x] RTL
- [x] LTR
- [x] Language switcher
- [x] Localized database content
- [x] Localized metadata
- [x] Localized validation messages

Status:

```text
[x] Complete
```

Both locales are prerendered at build time. `dir="rtl"` is set on `<html>` for
Arabic, so RTL is a real browser-level direction (caret behaviour, screen-reader
voice, text selection) rather than a CSS approximation. Layout uses logical CSS
properties throughout, so mirroring needs no RTL-specific stylesheet.

---

## Phase 7 --- Theme

Tasks:

- Light mode
- Dark mode
- System mode
- Persistent preference
- Theme-aware components

Status:

```text
[ ] Not Started
```

---

## Phase 8 --- Animation and Polish

Tasks:

- Page transitions
- Scroll animations
- Hover effects
- Loading animations
- Skeletons
- Micro-interactions
- Reduced motion support

Status:

```text
[ ] Not Started
```

---

## Phase 9 --- SEO

Tasks:

- [x] Metadata
- [x] Open Graph
- [x] Sitemap
- [x] Robots
- [x] Canonical URLs
- [ ] Structured data
- [x] Localized SEO

Status:

```text
[~] In Progress --- everything except JSON-LD
```

---

## Phase 10 --- Testing

Test:

- Authentication
- CRUD
- Validation
- RTL
- LTR
- Dark mode
- Light mode
- Mobile
- Tablet
- Desktop
- SEO
- Accessibility
- Image uploads
- Error states

Status:

```text
[ ] Not Started
```

---

## Phase 11 --- Deployment

Prepare:

- Production database
- Environment variables
- Build
- Database migration
- Seed strategy
- Image storage
- Domain
- HTTPS
- Monitoring

Status:

```text
[ ] Not Started
```

---

# 51. AI Agent Rules

The AI coding agent MUST follow these rules.

## Rule 1

Do not rebuild existing functionality without checking the current
implementation.

## Rule 2

Do not introduce a new library when the existing stack can solve the
problem.

## Rule 3

Do not change the database schema without considering existing
relationships.

## Rule 4

Do not create duplicated components.

## Rule 5

Do not put database logic in presentation components.

## Rule 6

Do not expose secrets.

## Rule 7

Every new feature must support both languages where applicable.

## Rule 8

Every UI feature must support light and dark themes.

## Rule 9

RTL must be tested whenever Arabic UI is changed.

## Rule 10

Do not sacrifice accessibility for visual design.

## Rule 11

Do not sacrifice performance for animations.

## Rule 12

Before implementing a major feature, inspect the existing architecture.

## Rule 13

Do not modify unrelated files.

## Rule 14

After implementing a feature:

1.  Run lint.
2.  Run type checking if TypeScript is used.
3.  Run tests where available.
4.  Check build errors.
5.  Check responsive behavior.
6.  Check Arabic RTL.
7.  Check light/dark mode.

---

# 52. Definition of Done

A feature is considered complete only when:

```text
[ ] UI implemented
[ ] Responsive
[ ] Dark mode
[ ] Light mode
[ ] English
[ ] Arabic
[ ] RTL tested
[ ] Validation implemented
[ ] Error states implemented
[ ] Loading states implemented
[ ] Accessibility considered
[ ] Database integration complete
[ ] Authentication/authorization considered
[ ] No console errors
[ ] Lint passes
[ ] Build passes
```

---

# 53. Final Product Structure

The final application should conceptually look like:

```text
                 ┌──────────────────────┐
                 │      Next.js App     │
                 └──────────┬───────────┘
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
     Public Portfolio                Admin Dashboard
             │                             │
     ┌───────┼────────┐             ┌──────┼─────────┐
     │       │        │             │      │         │
   Home   Projects  Contact       CRUD   Media    Settings
     │       │        │             │      │         │
     └───────┴────────┘             └──────┴─────────┘
             │                             │
             └──────────────┬──────────────┘
                            ▼
                       Server Layer
                            │
                            ▼
                         Prisma
                            │
                            ▼
                       MySQL 8
```

---

# 54. Initial MVP

Do NOT attempt to build everything simultaneously.

The first working version should contain:

### Public

```text
Home
About
Skills
Projects
Experience
Contact
Navbar
Footer
```

### Admin

```text
Login
Dashboard
Projects CRUD
Skills CRUD
Experience CRUD
Messages
Settings
```

### Global

```text
English
Arabic
RTL
LTR
Dark
Light
Responsive
SEO foundation
```

After MVP works correctly, implement:

```text
Education
Services
Testimonials
Media Library
Advanced SEO
Preview
Analytics
Advanced settings
```

---

# 55. Recommended Implementation Order

The AI agent should follow this order:

```text
1. Project setup
2. Design system
3. Theme system
4. i18n
5. Database
6. Authentication
7. Admin layout
8. Projects CRUD
9. Skills CRUD
10. Experience CRUD
11. Public homepage
12. Public projects
13. Contact
14. Remaining CRUD modules
15. SEO
16. Animations
17. Accessibility
18. Testing
19. Performance optimization
20. Production preparation
```

Do not jump directly into advanced animations before the core
architecture works.

---

# 56. First Task For The AI Agent

Before writing a large amount of code, the agent should:

1.  Inspect the repository.
2.  Identify whether the project is empty or already initialized.
3.  Confirm Next.js version.
4.  Confirm package manager.
5.  Confirm JavaScript/TypeScript.
6.  Create the architecture.
7.  Install only required dependencies.
8.  Create the base design system.
9.  Create the initial layout.
10. Create the database schema.
11. Create the first migration.
12. Create seed data.
13. Verify the project builds successfully.

After that, implement the project phase-by-phase.

---

# 57. Project Status

Use this section as the single source of truth for progress.

```text
## Foundation
[x] Next.js setup
[x] Tailwind
[x] UI system
[x] Fonts
[x] Theme
[x] i18n

## Database
[x] Prisma
[x] MySQL
[x] Schema
[x] Migrations
[x] Seed

## Authentication
[ ] Admin login
[ ] Protected routes
[ ] Logout
[ ] Authorization

## Admin
[ ] Dashboard
[ ] Projects
[ ] Skills
[ ] Experience
[ ] Education
[ ] Services
[ ] Testimonials
[ ] Social Links
[ ] Messages
[ ] Media
[ ] Settings

## Public
[ ] Home
[ ] About
[ ] Skills
[ ] Projects
[ ] Project details
[ ] Experience
[ ] Education
[ ] Services
[ ] Testimonials
[ ] Contact
[x] Footer

## Quality
[ ] Responsive
[x] RTL
[ ] Accessibility
[ ] SEO
[ ] Performance
[ ] Testing
[x] Production build
[ ] Deployment
```

### Phase log

| Phase  | Scope                                  | Status      |
| ------ | -------------------------------------- | ----------- |
| Phase 1 | Project Foundation                     | Complete    |
| Phase 2 | Database (Prisma + MySQL 8)            | Complete    |
| Phase 3 | Authentication                         | Complete    |
| Phase 4 | Admin Dashboard                        | In Progress |
| Phase 5 | Public Portfolio                       | Complete    |
| Phase 6 | Internationalization                   | Complete    |
| Phase 7 | Theme                                  | Complete    |
| Phase 8 | Animation and Polish                   | Partial     |
| Phase 9 | SEO                                    | Partial     |
| Phase 10 | Testing                               | Not Started |
| Phase 11 | Deployment                            | Not Started |

Notes:

- **Phase 5** --- all six public routes are built and statically generated in
  both locales, and project detail pages come from the database. The homepage
  is a single composition of the same components, so the content is edited in one
  place. Every band hides itself when its collection is empty, so a fresh install
  renders a shorter page rather than a row of empty headings.
- **Phase 6** --- routing, message catalogues, RTL and translated metadata are
  complete. No user-facing string is hardcoded: nav labels, section headings,
  validation errors and metadata all resolve from `src/messages/`.
- **Phase 8** --- the motion primitives and the Hero animations exist, and every
  content section is built on top of them. `prefers-reduced-motion` is respected
  throughout.
- **Phase 9** --- `generateMetadata` resolves title / description / keywords /
  Open Graph / Twitter cards / canonical per locale, and `src/app/sitemap.ts` and
  `src/app/robots.ts` are generated from the live project table with `hreflang`
  alternates. JSON-LD structured data is the only item still open.
- **Phase 4** --- the dashboard shell, navigation and read-only overview are
  done, and **projects** now have a full CRUD slice (list with URL-driven search,
  status and category filters and pagination; create and edit forms; delete behind
  a confirmation). That slice is the template for the remaining collections
  (skills, experience, education, services, testimonials, social links, messages,
  media, settings), which have their read queries in place and still need their
  mutations and screens.
- **Admin cache invalidation** --- the admin read layer is deliberately uncached
  but the public query layer is not, so a project write calls `updateTag` (data,
  immediate) *and* `revalidatePath` (rendered routes, since the public pages are
  static). Skipping the `revalidatePath` leaves the site showing markup built
  before the edit --- which is why both are called, rather than the one that looks
  sufficient.
- **Database engine** --- MySQL 8 rather than the PostgreSQL named in the
  original brief, because MySQL is what the development machine runs. Every
  construct used in the schema is portable, so switching is cheap.
- **Build-time database access** --- the original plan was to keep the build
  independent of the database. In practice `generateStaticParams` reads the
  published project slugs so all 11 detail pages are prerendered rather than
  rendered on first request, which means **`npm run build` requires MySQL to be
  reachable.** That is the right trade-off for a portfolio whose whole value is
  fast, crawlable pages; if that ever needs to change, drop
  `generateStaticParams` from `src/app/[locale]/projects/[slug]/page.tsx` and the
  page renders on demand instead.
- **Project `technologies`** --- stored as a JSON array on `Project` and
  `Experience` rather than a many-to-many join table. The array is always read
  whole for display and never queried by element, so a join table would add
  queries and a pivot model without buying anything.
- **Project thumbnails** --- the column exists and the UI prefers it, but the
  seeded projects have none, so `ProjectThumb` draws a deterministic generated
  cover from the slug until real images are uploaded through the dashboard.


---

# 58. Important Product Principle

This is a **portfolio CMS**, not only a portfolio website.

The final result must allow the owner to change the majority of visible
portfolio content from the dashboard without modifying source code.

The frontend should be presentation-focused.

The dashboard should be content-focused.

The database should be the source of truth for dynamic portfolio
content.

The architecture should remain simple enough for one developer to
maintain while being structured enough to grow later.

---

# 59. Expected Final Experience

The visitor should experience:

```text
Fast
↓
Beautiful
↓
Clear
↓
Interactive
↓
Professional
↓
Easy to navigate
```

The administrator should experience:

```text
Login
↓
Dashboard
↓
Manage content
↓
Save
↓
Immediately reflected on portfolio
```

The final project should feel like a premium custom-built developer
portfolio rather than a generic template.
