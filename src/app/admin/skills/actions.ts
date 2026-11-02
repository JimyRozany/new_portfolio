"use server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { refreshPublic, field } from "../refresh";
import { revalidatePath } from "next/cache";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(60),
  sort: z.coerce.number().int().min(0).max(9999),
});
const parse = (form: FormData) => schema.safeParse(field(form, ["name", "category", "sort"]));
const done = () => { refreshPublic(); revalidatePath("/admin/skills"); };

export async function addSkill(form: FormData) {
  await requireAdmin();
  const p = parse(form);
  if (!p.success) return;
  await db!.skill.create({ data: p.data });
  done();
}
export async function updateSkill(id: string, form: FormData) {
  await requireAdmin();
  const p = parse(form);
  if (!p.success) return;
  await db!.skill.update({ where: { id }, data: p.data });
  done();
}
export async function deleteSkill(id: string) {
  await requireAdmin();
  await db!.skill.delete({ where: { id } });
  done();
}
