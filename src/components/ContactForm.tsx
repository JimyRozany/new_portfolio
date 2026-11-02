"use client";
import { useActionState } from "react";
import { sendMessage, type ContactState } from "@/app/[locale]/contact-actions";
import { form as t, type L } from "@/lib/content";

export default function ContactForm({ l }: { l: L }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, {});
  if (state.ok) return <p role="status" className="form-ok">{t.ok[l]}</p>;
  return (
    <form action={action}>
      <input type="hidden" name="locale" value={l} />
      <div aria-hidden style={{ position: "absolute", insetInlineStart: "-9999px" }}>
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className="field"><span>{t.name[l]}</span><input name="name" required maxLength={100} autoComplete="name" /></label>
      <label className="field"><span>{t.email[l]}</span><input name="email" type="email" required maxLength={200} autoComplete="email" dir="ltr" /></label>
      <label className="field"><span>{t.message[l]}</span><textarea name="body" required minLength={10} maxLength={3000} rows={4} /></label>
      {state.error && <p role="alert" className="mt-4 text-sm" style={{ color: "#ff6b6b" }}>{state.error}</p>}
      <button className="btn mt-6 disabled:opacity-60" disabled={pending}>{pending ? t.sending[l] : t.send[l]}</button>
    </form>
  );
}
