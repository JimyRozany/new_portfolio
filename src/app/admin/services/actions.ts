"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { refreshPublic, field } from "../refresh";

const schema = z.object({
  titleAr: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().min(1).max(200),
  descAr: z.string().trim().min(1).max(1000),
  descEn: z.string().trim().min(1).max(1000),
  sort: z.coerce.number().int().min(0).max(9999),
});
const parse = (f: FormData) => {
  const p = schema.safeParse(field(f, ["titleAr", "titleEn", "descAr", "descEn", "sort"]));
  return p.success ? { ...p.data, published: f.get("published") === "on" } : null;
};
const done = () => { refreshPublic(); revalidatePath("/admin/services"); };

export async function addService(form: FormData) {
  await requireAdmin();
  const d = parse(form);
  if (!d) return;
  await db!.service.create({ data: d });
  done();
}
export async function updateService(id: string, form: FormData) {
  await requireAdmin();
  const d = parse(form);
  if (!d) return;
  await db!.service.update({ where: { id }, data: d });
  done();
}
export async function deleteService(id: string) {
  await requireAdmin();
  await db!.service.delete({ where: { id } });
  done();
}
