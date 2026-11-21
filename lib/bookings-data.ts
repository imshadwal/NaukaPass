import {
  localGetBooking,
  localListBookings,
} from "@/lib/local-store";
import { isSupabaseMode } from "@/lib/mode";
import {
  supabaseGetBooking,
  supabaseListBookings,
} from "@/lib/supabase-store";
import type { Booking } from "@/lib/types";

export async function listBookings(): Promise<Booking[]> {
  if (isSupabaseMode()) {
    return supabaseListBookings();
  }
  return localListBookings();
}

export async function getBooking(id: string): Promise<Booking | null> {
  if (isSupabaseMode()) {
    return supabaseGetBooking(id);
  }
  return localGetBooking(id);
}
