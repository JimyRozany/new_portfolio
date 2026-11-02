"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { refreshPublic } from "../refresh";

import { SETTING_KEYS } from "./keys";
const text = z.string().trim().max(2000);

export async function saveSettings(form: FormData) {
  await requireAdmin();
  for (const key of SETTING_KEYS) {
    const ar = text.safeParse(String(form.get(`${key}Ar`) ?? ""));
    const en = text.safeParse(String(form.get(`${key}En`) ?? ""));
    if (!ar.success || !en.success) continue;
    // Empty value => public site falls back to the built-in CV text for that language.
    await db!.setting.upsert({
      where: { key },
      update: { valueAr: ar.data, valueEn: en.data },
      create: { key, valueAr: ar.data, valueEn: en.data },
    });
  }
  refreshPublic();
  redirect("/admin/settings?saved=1");
}
