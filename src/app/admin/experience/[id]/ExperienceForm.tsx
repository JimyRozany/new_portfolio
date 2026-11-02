"use client";
import { useActionState } from "react";
import { saveExperience, type FormState } from "../actions";

export type ExperienceValues = { id: string; company: string; roleAr: string; roleEn: string; periodAr: string; periodEn: string; bulletsAr: string; bulletsEn: string; sort: number };
const input = "mt-1 w-full rounded-xl border bg-transparent px-4 py-2";
const line = { borderColor: "var(--line)" };

export default function ExperienceForm({ v }: { v: ExperienceValues }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveExperience, {});
  const I = (name: string, label: string, val: string | number, dir?: "rtl", type = "text") => (
    <label className="block text-sm">{label}<input name={name} type={type} defaultValue={val} dir={dir} className={input} style={line} /></label>
  );
  const T = (name: string, label: string, val: string, dir?: "rtl") => (
    <label className="block text-sm">{label}<textarea name={name} rows={6} defaultValue={val} dir={dir} className={input} style={line} /></label>
  );
  return (
    <form action={action} className="glass mt-8 space-y-4 p-8">
      <input type="hidden" name="id" value={v.id} />
      {I("company", "Company", v.company)}
      <div className="grid gap-4 sm:grid-cols-2">
        {I("roleEn", "Role (EN)", v.roleEn)}{I("roleAr", "الوظيفة (AR)", v.roleAr, "rtl")}
        {I("periodEn", "Period (EN)", v.periodEn)}{I("periodAr", "الفترة (AR)", v.periodAr, "rtl")}
        {T("bulletsEn", "Bullets (EN) — one per line", v.bulletsEn)}{T("bulletsAr", "النقاط (AR) — نقطة في كل سطر", v.bulletsAr, "rtl")}
      </div>
      {I("sort", "Sort (lower = first)", v.sort, undefined, "number")}
      {state.error && <p role="alert" className="text-sm" style={{ color: "#ff6b6b" }}>{state.error}</p>}
      <button className="btn disabled:opacity-60" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
    </form>
  );
}
