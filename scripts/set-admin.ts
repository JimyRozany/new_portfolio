// Create the admin or RESET its password from ADMIN_EMAIL / ADMIN_PASSWORD (.env).
// Run: npm run admin:set        (the seed only creates the admin if missing; this one overwrites)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
  if (password.length < 10 || password === "change-me") throw new Error("ADMIN_PASSWORD must be 10+ chars and not the placeholder");
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });
  console.log(`Admin ${email} is set.`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
