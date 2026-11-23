"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseBoatType,
  parseContactNumber,
  parsePax,
  parseStatus,
} from "@/lib/booking-fields";
import { getBooking as fetchBooking } from "@/lib/bookings-data";
import { parseBookingsCsv } from "@/lib/csv-import";
import {
  localCreateBooking,
  localCreateBookings,
  localDeleteBooking,
  localMarkScanned,
  localUpdateBooking,
} from "@/lib/local-store";
import { isSupabaseMode } from "@/lib/mode";
import {
  supabaseCreateBooking,
  supabaseCreateBookings,
  supabaseDeleteBooking,
  supabaseMarkScanned,
  supabaseUpdateBooking,
} from "@/lib/supabase-store";
import type { ActionResult, Booking } from "@/lib/types";

export type BulkImportResult = ActionResult & {
  created?: number;
  skipped?: number;
  details?: string[];
};

export async function createBooking(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const leaderName = String(formData.get("leader_name") ?? "").trim();
  const contactNumber = parseContactNumber(formData.get("contact_number"));
  const boatType = parseBoatType(formData.get("boat_type"));
  const pax = parsePax(formData.get("pax"));

  if (!leaderName) {
    return { ok: false, message: "Enter a group leader name." };
  }
  if (!contactNumber) {
    return {
      ok: false,
      message: "Enter a valid contact number (at least 10 digits).",
    };
  }
  if (!boatType) {
    return { ok: false, message: "Choose a boat type." };
  }
  if (pax === null) {
    return { ok: false, message: "Enter a valid passenger count (1 to 500)." };
  }

  try {
    if (isSupabaseMode()) {
      await supabaseCreateBooking(leaderName, contactNumber, boatType, pax);
    } else {
      await localCreateBooking(leaderName, contactNumber, boatType, pax);
    }
  } catch (error) {
    const detail =
      error instanceof Error && error.message
        ? error.message
        : "Unknown error";
    return {
      ok: false,
      message: `Could not create booking. ${detail}`,
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function importBookingsCsv(
  _prev: BulkImportResult,
  formData: FormData,
): Promise<BulkImportResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a CSV file to import." };
  }

  const text = await file.text();
  const { rows, errors } = parseBookingsCsv(text);

  if (rows.length === 0) {
    return {
      ok: false,
      message: "No valid rows found in the CSV.",
      details: errors.slice(0, 8).map((e) => `Line ${e.line}: ${e.message}`),
    };
  }

  try {
    if (isSupabaseMode()) {
      await supabaseCreateBookings(rows);
    } else {
      await localCreateBookings(rows);
    }
  } catch (error) {
    const detail =
      error instanceof Error && error.message
        ? error.message
        : "Unknown error";
    return {
      ok: false,
      message: `Could not import bookings. ${detail}`,
    };
  }

  revalidatePath("/dashboard");
  return {
    ok: true,
    created: rows.length,
    skipped: errors.length,
    message:
      errors.length > 0
        ? `Created ${rows.length} passes. Skipped ${errors.length} invalid rows.`
        : `Created ${rows.length} passes.`,
    details: errors.slice(0, 8).map((e) => `Line ${e.line}: ${e.message}`),
  };
}

export async function updateBooking(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const leaderName = String(formData.get("leader_name") ?? "").trim();
  const contactNumber = parseContactNumber(formData.get("contact_number"));
  const boatType = parseBoatType(formData.get("boat_type"));
  const pax = parsePax(formData.get("pax"));
  const status = parseStatus(formData.get("status"));

  if (!id) {
    return { ok: false, message: "Missing booking id." };
  }
  if (!leaderName) {
    return { ok: false, message: "Enter a group leader name." };
  }
  if (!contactNumber) {
    return {
      ok: false,
      message: "Enter a valid contact number (at least 10 digits).",
    };
  }
  if (!boatType) {
    return { ok: false, message: "Choose a boat type." };
  }
  if (pax === null) {
    return { ok: false, message: "Enter a valid passenger count (1 to 500)." };
  }
  if (!status) {
    return { ok: false, message: "Choose a valid status." };
  }

  const updated = isSupabaseMode()
    ? await supabaseUpdateBooking(
        id,
        leaderName,
        contactNumber,
        boatType,
        pax,
        status,
      )
    : await localUpdateBooking(
        id,
        leaderName,
        contactNumber,
        boatType,
        pax,
        status,
      );

  if (!updated) {
    return { ok: false, message: "Could not update booking. Try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/bookings/${id}`);
  return { ok: true, message: "Booking updated.", bookingId: id };
}

export async function deleteBooking(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  if (isSupabaseMode()) {
    await supabaseDeleteBooking(id);
  } else {
    await localDeleteBooking(id);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function getBooking(id: string): Promise<Booking | null> {
  return fetchBooking(id);
}

export async function markScanned(
  id: string,
): Promise<ActionResult & { booking?: Booking }> {
  const existing = await fetchBooking(id);

  if (!existing) {
    return { ok: false, message: "No booking found for this QR code." };
  }

  if (existing.status === "scanned") {
    return {
      ok: false,
      message: "This pass was already scanned.",
      booking: existing,
    };
  }

  const data = isSupabaseMode()
    ? await supabaseMarkScanned(id)
    : await localMarkScanned(id);

  if (!data) {
    return { ok: false, message: "Could not mark as boarded. Try again." };
  }

  if (data.status === "scanned" && data.scanned_at === existing.scanned_at) {
    return {
      ok: false,
      message: "This pass was already scanned.",
      booking: data,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/bookings/${id}`);
  revalidatePath("/scan");

  return {
    ok: true,
    message: "Marked as boarded.",
    booking: data,
  };
}
