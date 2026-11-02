# Mohamed Gamal — Portfolio
Next.js 15 · TypeScript · Tailwind 4 · Prisma/PostgreSQL · Zod.
## Setup
1. `cp .env.example .env` and fill values (managed Postgres URL required).
2. `npm install`
3. `npx prisma migrate dev --name init` (production: `npm run db:deploy`)
4. `npm run dev` → http://localhost:3000 (redirects to /ar)
## Structure
`src/app/[locale]` pages · `src/lib/content.ts` CV content · `prisma/schema.prisma` · see PROJECT_STATUS.md for progress and next task.
## Deploy
Vercel + managed Postgres; set env vars from `.env.example`.
