"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { refreshPublic, lines, field } from "../refresh";

export type FormState = { error?: string };

const schema = z.object({
  company: z.string().trim().min(1, "Company is required").max(200),
  roleAr: z.string().trim().min(1, "Arabic role is required").max(200),
  roleEn: z.string().trim().min(1, "English role is required").max(200),
  periodAr: z.string().trim().min(1, "Arabic period is required").max(100),
  periodEn: z.string().trim().min(1, "English period is required").max(100),
  bulletsAr: z.string().max(5000).transform(lines),
  bulletsEn: z.string().max(5000).transform(lines),
  sort: z.coerce.number().int().min(0).max(9999),
});

export async function saveExperience(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse(field(form, ["company", "roleAr", "roleEn", "periodAr", "periodEn", "bulletsAr", "bulletsEn", "sort"]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const id = String(form.get("id") ?? "");
  try {
    if (id && id !== "new") await db!.experience.update({ where: { id }, data: parsed.data });
    else await db!.experience.create({ data: parsed.data });
  } catch (e) {
    console.error("[admin] saveExperience failed:", e);
    return { error: "Could not save. Check the server logs." };
  }
  refreshPublic();
  redirect("/admin/experience");
}

export async function deleteExperience(id: string) {
  await requireAdmin();
  await db!.experience.delete({ where: { id } });
  refreshPublic();
  redirect("/admin/experience");
}
