"use client";
import { useActionState } from "react";
import { login, type LoginState } from "../actions";

const field = "mt-1 w-full rounded-xl border bg-transparent px-4 py-2";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="glass w-full max-w-sm space-y-4 p-8">
      <h1 className="text-2xl font-black">Admin login</h1>
      <label className="block text-sm">Email
        <input name="email" type="email" autoComplete="username" required className={field} style={{ borderColor: "var(--line)" }} />
      </label>
      <label className="block text-sm">Password
        <input name="password" type="password" autoComplete="current-password" required className={field} style={{ borderColor: "var(--line)" }} />
      </label>
      {state.error && <p role="alert" className="text-sm" style={{ color: "#ff6b6b" }}>{state.error}</p>}
      <button className="btn w-full disabled:opacity-60" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
