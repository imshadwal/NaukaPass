import type { BookingStatus } from "@/lib/types";

export function parsePax(value: FormDataEntryValue | null) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 500) {
    return null;
  }
  return n;
}

export function parseContactNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    return null;
  }

  return raw;
}

export function parseStatus(value: FormDataEntryValue | null): BookingStatus | null {
  const status = String(value ?? "").trim();
  if (status === "pending" || status === "scanned") return status;
  return null;
}
