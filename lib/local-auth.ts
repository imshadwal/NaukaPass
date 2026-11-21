import { cookies } from "next/headers";

export const LOCAL_SESSION_COOKIE = "naukapass_local_session";

function getSecret() {
  return (
    process.env.LOCAL_AUTH_SECRET?.trim() ||
    process.env.LOCAL_ADMIN_PASSWORD?.trim() ||
    "naukapass-local-dev-secret"
  );
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function sign(value: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return toHex(signature);
}

export function getLocalCredentials() {
  return {
    username: (process.env.LOCAL_ADMIN_USERNAME || "admin").trim(),
    password: (process.env.LOCAL_ADMIN_PASSWORD || "admin123").trim(),
  };
}

export function verifyLocalCredentials(username: string, password: string) {
  const expected = getLocalCredentials();
  return (
    username.trim().toLowerCase() === expected.username.toLowerCase() &&
    password === expected.password
  );
}

export async function createLocalSessionToken(username: string) {
  const payload = `${username}|${Date.now()}`;
  const signature = await sign(payload);
  return `${btoa(payload)}.${signature}`;
}

export async function readLocalSessionUser(
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    const payload = atob(encoded);
    const expected = await sign(payload);
    if (!timingSafeEqualHex(signature, expected)) return null;

    const [username] = payload.split("|");
    return username || null;
  } catch {
    return null;
  }
}

export async function getLocalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(LOCAL_SESSION_COOKIE)?.value;
  const username = await readLocalSessionUser(token);
  return username ? { username } : null;
}

export async function setLocalSession(username: string) {
  const cookieStore = await cookies();
  const token = await createLocalSessionToken(username);
  cookieStore.set(LOCAL_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearLocalSession() {
  const cookieStore = await cookies();
  cookieStore.set(LOCAL_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
