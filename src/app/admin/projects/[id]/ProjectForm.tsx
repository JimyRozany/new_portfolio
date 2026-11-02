"use client";
import { useActionState } from "react";
import { saveProject, type ProjectState } from "../actions";

export type ProjectValues = {
  id: string; slug: string; titleAr: string; titleEn: string; descAr: string; descEn: string;
  pointsAr: string; pointsEn: string; tech: string; imageUrl: string; liveUrl: string; repoUrl: string;
  kind: string; sort: number; featured: boolean; published: boolean;
};

const input = "mt-1 w-full rounded-xl border bg-transparent px-4 py-2";
const line = { borderColor: "var(--line)" };

function T({ name, label, v, rows = 3, dir }: { name: string; label: string; v: string; rows?: number; dir?: "rtl" }) {
  return (
    <label className="block text-sm">{label}
      <textarea name={name} defaultValue={v} rows={rows} dir={dir} className={input} style={line} />
    </label>
  );
}
function I({ name, label, v, dir, type = "text" }: { name: string; label: string; v: string | number; dir?: "rtl"; type?: string }) {
  return (
    <label className="block text-sm">{label}
      <input name={name} type={type} defaultValue={v} dir={dir} className={input} style={line} />
    </label>
  );
}

export default function ProjectForm({ v }: { v: ProjectValues }) {
  const [state, action, pending] = useActionState<ProjectState, FormData>(saveProject, {});
  return (
    <form action={action} className="glass mt-8 space-y-4 p-8">
      <input type="hidden" name="id" value={v.id} />
      <I name="slug" label="Slug (URL)" v={v.slug} />
      <div className="grid gap-4 sm:grid-cols-2">
        <I name="titleEn" label="Title (EN)" v={v.titleEn} />
        <I name="titleAr" label="العنوان (AR)" v={v.titleAr} dir="rtl" />
        <T name="descEn" label="Description (EN)" v={v.descEn} />
        <T name="descAr" label="الوصف (AR)" v={v.descAr} dir="rtl" />
        <T name="pointsEn" label="Points (EN) — one per line" v={v.pointsEn} rows={6} />
        <T name="pointsAr" label="النقاط (AR) — نقطة في كل سطر" v={v.pointsAr} rows={6} dir="rtl" />
      </div>
      <I name="tech" label="Tech (comma-separated)" v={v.tech} />
      <div className="grid gap-4 sm:grid-cols-3">
        <I name="imageUrl" label="Image URL" v={v.imageUrl} />
        <I name="liveUrl" label="Live URL" v={v.liveUrl} />
        <I name="repoUrl" label="Repo URL" v={v.repoUrl} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">Kind
          <select name="kind" defaultValue={v.kind} className={input} style={line}>
            <option value="professional">professional</option>
            <option value="personal">personal</option>
          </select>
        </label>
        <I name="sort" label="Sort (lower = first)" v={v.sort} type="number" />
      </div>
      <div className="flex gap-6 text-sm">
        <label><input type="checkbox" name="published" defaultChecked={v.published} /> Published</label>
        <label><input type="checkbox" name="featured" defaultChecked={v.featured} /> Featured</label>
      </div>
      {state.error && <p role="alert" className="text-sm" style={{ color: "#ff6b6b" }}>{state.error}</p>}
      <button className="btn disabled:opacity-60" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
    </form>
  );
}
