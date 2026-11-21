import {
  localGetBooking,
  localListBookings,
} from "@/lib/local-store";
import type { Booking } from "@/lib/types";

export async function listBookings(): Promise<Booking[]> {
  return localListBookings();
}

export async function getBooking(id: string): Promise<Booking | null> {
  return localGetBooking(id);
}
