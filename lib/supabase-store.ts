import { createAdminClient } from "@/lib/supabase/admin";
import type { Booking, BookingStatus } from "@/lib/types";

function normalize(booking: Booking): Booking {
  return {
    ...booking,
    contact_number: booking.contact_number ?? "",
  };
}

export async function supabaseListBookings(): Promise<Booking[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as Booking[]).map(normalize);
}

export async function supabaseGetBooking(id: string): Promise<Booking | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return normalize(data as Booking);
}

export async function supabaseCreateBooking(
  leaderName: string,
  contactNumber: string,
  pax: number,
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      leader_name: leaderName,
      contact_number: contactNumber,
      pax,
      status: "pending",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Could not create booking");
  }

  return normalize(data as Booking);
}

export async function supabaseUpdateBooking(
  id: string,
  leaderName: string,
  contactNumber: string,
  pax: number,
  status: BookingStatus,
) {
  const existing = await supabaseGetBooking(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  let scannedAt = existing.scanned_at;

  if (status === "scanned") {
    scannedAt =
      existing.status === "scanned" && existing.scanned_at
        ? existing.scanned_at
        : now;
  } else {
    scannedAt = null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({
      leader_name: leaderName,
      contact_number: contactNumber,
      pax,
      status,
      scanned_at: scannedAt,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return normalize(data as Booking);
}

export async function supabaseDeleteBooking(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function supabaseMarkScanned(id: string): Promise<Booking | null> {
  const existing = await supabaseGetBooking(id);
  if (!existing) return null;
  if (existing.status === "scanned") return existing;

  const now = new Date().toISOString();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "scanned",
      scanned_at: now,
      updated_at: now,
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error) return null;
  if (!data) {
    return supabaseGetBooking(id);
  }
  return normalize(data as Booking);
}
