import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export const LOCAL_SESSION_COOKIE = "naukapass_local_session";

function getSecret() {
  return (
    process.env.LOCAL_AUTH_SECRET ||
    process.env.LOCAL_ADMIN_PASSWORD ||
    "naukapass-local-dev-secret"
  );
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function getLocalCredentials() {
  return {
    username: process.env.LOCAL_ADMIN_USERNAME || "admin",
    password: process.env.LOCAL_ADMIN_PASSWORD || "admin123",
  };
}

export function verifyLocalCredentials(username: string, password: string) {
  const expected = getLocalCredentials();
  return (
    username.toLowerCase() === expected.username.toLowerCase() &&
    password === expected.password
  );
}

export function createLocalSessionToken(username: string) {
  const payload = `${username}|${Date.now()}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function readLocalSessionUser(token: string | undefined): string | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    const payload = Buffer.from(encoded, "base64url").toString("utf8");
    const expected = sign(payload);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const [username] = payload.split("|");
    return username || null;
  } catch {
    return null;
  }
}

export async function getLocalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(LOCAL_SESSION_COOKIE)?.value;
  const username = readLocalSessionUser(token);
  return username ? { username } : null;
}

export async function setLocalSession(username: string) {
  const cookieStore = await cookies();
  cookieStore.set(LOCAL_SESSION_COOKIE, createLocalSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearLocalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(LOCAL_SESSION_COOKIE);
}
