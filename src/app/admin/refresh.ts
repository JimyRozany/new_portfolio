import { revalidatePath } from "next/cache";

/** Public pages that read DB content. Plain helper (not a server action). */
export function refreshPublic() {
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath("/sitemap.xml");
}
export const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
export const field = (form: FormData, keys: readonly string[]) =>
  Object.fromEntries(keys.map((k) => [k, String(form.get(k) ?? "")]));
