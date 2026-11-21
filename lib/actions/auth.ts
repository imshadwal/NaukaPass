"use server";

import { redirect } from "next/navigation";
import {
  clearLocalSession,
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
    return {
      ok: false,
      message: "Sign in failed. Check username and password.",
    };
  }

  await setLocalSession(username);
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signOut() {
  await clearLocalSession();
  redirect("/login");
}
