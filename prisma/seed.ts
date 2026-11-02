// Seeds the DB from the static CV content. Safe to re-run: it never overwrites rows
// that already exist (so admin edits survive).  Run: npm run db:seed
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ui, skills, experience, projects } from "../src/lib/content";

const prisma = new PrismaClient();

async function main() {
  // Projects: upsert by slug, but never overwrite existing rows.
  for (const [i, p] of projects.entries()) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        titleAr: p.title.ar, titleEn: p.title.en,
        descAr: p.desc.ar, descEn: p.desc.en,
        pointsAr: p.points.ar, pointsEn: p.points.en,
        tech: p.tech,
        kind: p.pro ? "professional" : "personal",
        featured: p.pro,
        published: true,
        sort: i,
      },
    });
  }

  if ((await prisma.skill.count()) === 0) {
    let sort = 0;
    await prisma.skill.createMany({
      data: Object.entries(skills).flatMap(([category, names]) => names.map((name) => ({ name, category, sort: sort++ }))),
    });
  }

  if ((await prisma.experience.count()) === 0) {
    await prisma.experience.createMany({
      data: experience.map((e, i) => ({
        company: e.company,
        roleAr: e.role.ar, roleEn: e.role.en,
        periodAr: e.period.ar, periodEn: e.period.en,
        bulletsAr: e.bullets.ar, bulletsEn: e.bullets.en,
        sort: i,
      })),
    });
  }

  for (const key of ["name", "role", "intro", "about", "edu"] as const) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, valueAr: ui[key].ar, valueEn: ui[key].en },
    });
  }
  // Admin: created only if missing (never overwrites). To change the password later: npm run admin:set
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password && password !== "change-me" && password.length >= 10) {
    if (!(await prisma.admin.findUnique({ where: { email } }))) {
      await prisma.admin.create({ data: { email, passwordHash: await bcrypt.hash(password, 12) } });
      console.log(`Admin created: ${email}`);
    }
  } else {
    console.warn("Admin NOT created: set ADMIN_EMAIL and a real ADMIN_PASSWORD (10+ chars) in .env, then rerun.");
  }
  console.log("Seed complete.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
