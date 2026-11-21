"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/types";

const initial: ActionResult = { ok: false };

export function LoginForm({
  next,
  localHint,
}: {
  next?: string;
  localHint?: { username: string; password: string } | null;
}) {
  const [state, action, pending] = useActionState(signIn, initial);

  return (
    <form action={action} className="card-warm p-6 sm:p-8 space-y-5 w-full max-w-md">
      <input type="hidden" name="next" value={next || "/dashboard"} />

      <label className="block space-y-2">
        <span className="title-4">Username</span>
        <input
          name="username"
          type="text"
          required
          autoComplete="username"
          className="field"
          defaultValue={localHint?.username}
          placeholder="admin"
        />
      </label>

      <label className="block space-y-2">
        <span className="title-4">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field"
          defaultValue={localHint?.password}
        />
      </label>

      {localHint ? (
        <p className="caption-2 text-ink-muted">
          Dev login from .env.local · {localHint.username} / {localHint.password}
        </p>
      ) : null}

      {state.message ? (
        <p className="body-5 text-danger" role="alert">
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in to NaukaPass"}
      </button>
    </form>
  );
}
