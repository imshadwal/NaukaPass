"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseContactNumber,
  parsePax,
  parseStatus,
} from "@/lib/booking-fields";
import { getBooking as fetchBooking } from "@/lib/bookings-data";
import {
  localCreateBooking,
  localDeleteBooking,
  localMarkScanned,
  localUpdateBooking,
} from "@/lib/local-store";
import type { ActionResult, Booking } from "@/lib/types";

export async function createBooking(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const leaderName = String(formData.get("leader_name") ?? "").trim();
  const contactNumber = parseContactNumber(formData.get("contact_number"));
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
  if (pax === null) {
    return { ok: false, message: "Enter a valid passenger count (1 to 500)." };
  }

  await localCreateBooking(leaderName, contactNumber, pax);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateBooking(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const leaderName = String(formData.get("leader_name") ?? "").trim();
  const contactNumber = parseContactNumber(formData.get("contact_number"));
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
  if (pax === null) {
    return { ok: false, message: "Enter a valid passenger count (1 to 500)." };
  }
  if (!status) {
    return { ok: false, message: "Choose a valid status." };
  }

  const updated = await localUpdateBooking(
    id,
    leaderName,
    contactNumber,
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

  await localDeleteBooking(id);
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

  const data = await localMarkScanned(id);
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
