# Mohamed Gamal --- Portfolio

A bilingual (English / Arabic) developer portfolio and content-management
dashboard, built with Next.js 16, React 19 and Tailwind CSS v4.

The repository contains two products:

- a **public portfolio** that is statically generated and fully bilingual, and
- an **admin dashboard** that lets the site owner manage every piece of
  portfolio content without touching the source code.

> **Status:** the project foundation (Phase 1), the database layer (Phase 2),
> authentication (Phase 3) and the public portfolio (Phase 5) are complete ---
> 13 tables migrated and seeded, and a bilingual, RTL-aware public site with all
> six content pages, a working contact form and generated SEO routes. The admin
> dashboard (Phase 4) has its shell, navigation and read-only overview but not
> yet its CRUD screens ---
> see [Project Status](#project-status) below.

---

## Table of Contents

- [Highlights](#highlights)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Internationalization](#internationalization)
- [Project Status](#project-status)
- [License](#license)

---

## Highlights

- **Bilingual by construction** --- every string lives in a message catalogue and
  no reusable component contains hard-coded copy, so English and Arabic can
  never drift apart.
- **True RTL support** --- logical CSS properties throughout, with motion offsets
  mirrored automatically in Arabic so animations always slide in from the
  reading edge.
- **Accessible by default** --- Radix primitives, visible focus rings, state that
  is never communicated by colour alone, and a live region for toast messages.
- **Animation system** --- reusable reveal, stagger, counter and text-reveal
  primitives built on `motion`, all of which respect
  `prefers-reduced-motion`.
- **Strict TypeScript** --- `strict`, `noUncheckedIndexedAccess` and
  `noUnusedLocals` are on, and the build fails on any type error.
- **Zero known vulnerabilities** --- `npm audit` is clean, including an
  override that pulls the MariaDB driver past an unpatched advisory.
- **Real content in the database** --- the seed loads the owner's CV, so the
  public pages render actual projects, roles and skills rather than lorem ipsum.

## Tech Stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                            |
| UI         | React 19, TypeScript 5.9                                      |
| Styling    | Tailwind CSS v4, `@tailwindcss/typography`                    |
| i18n       | `next-intl` (English / Arabic, `localePrefix: 'always'`)      |
| Theming    | `next-themes` (light / dark / system)                         |
| Animation  | `motion` (Framer Motion)                                      |
| Components | Radix UI primitives, `lucide-react` icons, custom brand icons |
| Data       | Prisma 7 + PostgreSQL                                         |
| Auth       | Auth.js with credentials, `bcryptjs` hashed passwords         |
| Forms      | `react-hook-form` + `zod`                                     |
| Tooling    | ESLint 9 (flat config), Prettier 3, `tailwindcss` plugin      |

## Getting Started

### Requirements

- Node.js 20.9 or newer (developed against Node 26)
- npm 10 or newer
- MySQL 8.0 or newer

### Installation

```bash
npm install
cp .env.example .env           # set DATABASE_URL to your MySQL instance
mysql -u root -p -e "CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Generate a real signing secret --- the placeholder in .env.example will not work.
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

npm run db:generate            # build the Prisma client
npm run db:migrate             # create the tables
npm run db:seed                # load the CV content + create the admin user
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root URL redirects to
your best-matching locale, so you will land on `/en` or `/ar` automatically.

The dashboard lives at **`/admin`** and is English-only. Sign in with
`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. To change the password later:

```bash
npm run db:reset-password -- rozny@yahoo.com "YourNewPassword"
```

`db:seed` only sets the password when it _creates_ the user, so re-seeding will
never reset a password you have since changed.

### Environment variables

Copy `.env.example` to `.env` and fill it in. The full list is documented in the
[project specification](./portfolio-project-README.md#32-environment-variables).

Two values must be changed before anything works:

| Variable                              | Why                                                     |
| ------------------------------------- | ------------------------------------------------------- |
| `DATABASE_URL`                        | Points Prisma and the seed at your MySQL instance.      |
| `AUTH_SECRET` (and `NEXTAUTH_SECRET`) | Signs the session JWT. Generate a random 32-byte value. |

## Available Scripts

| Script                 | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Start the development server                              |
| `npm run build`        | Create a production build                                 |
| `npm start`            | Serve the production build                                |
| `npm run lint`         | Run ESLint (flat config, zero warnings enforced)          |
| `npm run lint:fix`     | Auto-fix lintable problems                                |
| `npm run format`       | Format the codebase with Prettier                         |
| `npm run format:check` | Verify formatting without writing                         |
| `npm run typecheck`    | Type-check without emitting output                        |
| `npm run validate`     | Type-check + lint + production build (run before pushing) |
| `npm run db:generate`  | Generate the Prisma client                                |
| `npm run db:migrate`   | Create and apply a database migration                     |
| `npm run db:seed`      | Seed the database with initial content                    |
| `npm run db:studio`    | Open Prisma Studio                                        |

## Project Structure

```text
src/
├── app/
│   ├── [locale]/          # Public site (every page is locale-prefixed)
│   ├── globals.css        # Design tokens and base styles
│   └── layout.tsx         # Root layout -- <html>/<body> live in [locale]
├── components/
│   ├── layout/            # Navbar, mobile nav, footer, switchers
│   ├── motion/            # Reveal, stagger, counter, marquee, ...
│   ├── providers/         # Theme, motion and toast providers
│   ├── public/            # Public page sections
│   ├── shared/            # Logo and iconography
│   └── ui/                # Reusable UI primitives
├── config/                # Site metadata, constants, navigation
├── hooks/                 # use-direction, use-mounted
├── i18n/                  # Routing, navigation, request, direction
├── lib/                   # Fonts, utilities, the Prisma client
└── messages/              # en.json, ar.json

prisma/
├── schema.prisma          # 13 tables, generated client
├── migrations/            # Versioned SQL, applied in order
└── seed.ts                # Idempotent seed from the owner's CV
```

The Prisma client is generated into `src/generated/prisma` and is **not**
committed --- run `npm run db:generate` after cloning. `prisma.config.ts` holds
the connection string for Prisma 7, and the runtime client connects through the
`@prisma/adapter-mariadb` driver adapter.

`src/app/layout.tsx` intentionally renders only `{children}`. The `<html>` and
`<body>` elements are defined in `src/app/[locale]/layout.tsx` because they need
the active locale to set `lang` and `dir` correctly.

## Design System

The visual direction is **Editorial Technical**: near-monochrome surfaces, one
high-energy "volt" accent, generous whitespace, and a strict typographic scale.

All colour tokens are defined as OKLCH in `src/app/globals.css`, which means
perceptually even light/dark pairs and predictable contrast in both themes.

| Token group                 | Purpose                              |
| --------------------------- | ------------------------------------ |
| `background` / `foreground` | Page canvas and primary text         |
| `surface` / `surface-2`     | Cards, panels and elevated regions   |
| `border`                    | Hairline separators and outlines     |
| `muted-foreground`          | Secondary text                       |
| `accent`                    | Volt --- the single highlight colour |
| `ring`                      | Focus indicator                      |

## Internationalization

- Locales: `en` (default) and `ar`.
- Every public URL carries its locale prefix, so each language has a unique,
  indexable address: `/en/projects` and `/ar/projects`.
- The visitor's choice is stored in a cookie and reused on the next visit.
- `src/proxy.ts` (Next.js 16's renamed middleware convention) performs the
  locale redirect and bypasses i18n for `/admin` and `/api`.
- Adding a locale means adding it to `src/i18n/routing.ts` and adding a matching
  `src/messages/<locale>.json`.

## Project Status

| Phase | Scope                | Status      |
| ----- | -------------------- | ----------- |
| 1     | Project Foundation   | Complete    |
| 2     | Database             | Complete    |
| 3     | Authentication       | Complete    |
| 4     | Admin Dashboard      | In Progress |
| 5     | Public Portfolio     | Complete    |
| 6     | Internationalization | Complete    |
| 7     | Theme                | Complete    |
| 8     | Animation and Polish | Partial     |
| 9     | SEO                  | Partial     |
| 10    | Testing              | Not Started |
| 11    | Deployment           | Not Started |

The complete specification, design brief and progress tracker live in
[`portfolio-project-README.md`](./portfolio-project-README.md).

## License

Private project. All rights reserved.

---

Built with Next.js, Tailwind CSS and a lot of attention to detail.
