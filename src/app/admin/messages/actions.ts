"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function setRead(id: string, read: boolean) {
  await requireAdmin();
  await db!.message.update({ where: { id }, data: { read } });
  revalidatePath("/admin/messages"); revalidatePath("/admin");
}
export async function deleteMessage(id: string) {
  await requireAdmin();
  await db!.message.delete({ where: { id } });
  revalidatePath("/admin/messages"); revalidatePath("/admin");
}
