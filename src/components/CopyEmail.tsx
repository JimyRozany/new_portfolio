"use client";
import { useState } from "react";

export default function CopyEmail({ email, copy, copied }: { email: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="mail">
      <a className="addr" href={`mailto:${email}`} dir="ltr">{email}</a>
      <button type="button" className="chip" onClick={async () => {
        try { await navigator.clipboard.writeText(email); setDone(true); setTimeout(() => setDone(false), 1800); } catch {}
      }}>{done ? copied : copy}<span className="sr-only" aria-live="polite">{done ? copied : ""}</span></button>
    </div>
  );
}
