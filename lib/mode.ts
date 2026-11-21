/** Supabase is used when URL + service role are set (Vercel / production). */
export function isSupabaseMode() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
