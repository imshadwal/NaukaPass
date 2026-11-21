"use server";

import { redirect } from "next/navigation";
import {
  clearLocalSession,
  getLocalCredentials,
  setLocalSession,
  verifyLocalCredentials,
} from "@/lib/local-auth";
import type { ActionResult } from "@/lib/types";

export async function signIn(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!username || !password) {
    return { ok: false, message: "Enter username and password to continue." };
  }

  if (!verifyLocalCredentials(username, password)) {
    const expected = getLocalCredentials();
    return {
      ok: false,
      message: `Sign in failed. Use username "${expected.username}" and the password from Vercel env.`,
    };
  }

  try {
    await setLocalSession(username);
  } catch (error) {
    const detail =
      error instanceof Error && error.message
        ? error.message
        : "Could not create session.";
    return { ok: false, message: `Sign in failed. ${detail}` };
  }

  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signOut() {
  await clearLocalSession();
  redirect("/login");
}
