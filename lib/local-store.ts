import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { BoatType, Booking, BookingStatus } from "@/lib/types";

const dataDir = path.join(process.cwd(), ".data");
const storePath = path.join(dataDir, "bookings.json");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, "[]", "utf8");
  }
}

function normalize(booking: Booking): Booking {
  return {
    ...booking,
    contact_number: booking.contact_number ?? "",
    boat_type:
      booking.boat_type === "bajra_boat" || booking.boat_type === "motor_boat"
        ? booking.boat_type
        : "motor_boat",
  };
}

async function readAll(): Promise<Booking[]> {
  await ensureStore();
  const raw = await fs.readFile(storePath, "utf8");
  try {
    const parsed = JSON.parse(raw) as Booking[];
    return parsed.map(normalize);
  } catch {
    return [];
  }
}

async function writeAll(bookings: Booking[]) {
  await ensureStore();
  await fs.writeFile(storePath, JSON.stringify(bookings, null, 2), "utf8");
}

export async function localListBookings(): Promise<Booking[]> {
  const bookings = await readAll();
  return bookings.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function localGetBooking(id: string): Promise<Booking | null> {
  const bookings = await readAll();
  return bookings.find((b) => b.id === id) ?? null;
}

export async function localCreateBooking(
  leaderName: string,
  contactNumber: string,
  boatType: BoatType,
  pax: number,
) {
  const [booking] = await localCreateBookings([
    {
      leader_name: leaderName,
      contact_number: contactNumber,
      boat_type: boatType,
      pax,
    },
  ]);
  return booking;
}

export async function localCreateBookings(
  rows: Array<{
    leader_name: string;
    contact_number: string;
    boat_type: BoatType;
    pax: number;
  }>,
) {
  const bookings = await readAll();
  const now = new Date().toISOString();
  const created: Booking[] = rows.map((row) => ({
    id: randomUUID(),
    leader_name: row.leader_name,
    contact_number: row.contact_number,
    boat_type: row.boat_type,
    pax: row.pax,
    status: "pending" as const,
    created_at: now,
    updated_at: now,
    scanned_at: null,
  }));
  bookings.push(...created);
  await writeAll(bookings);
  return created;
}

export async function localUpdateBooking(
  id: string,
  leaderName: string,
  contactNumber: string,
  boatType: BoatType,
  pax: number,
  status: BookingStatus,
): Promise<Booking | null> {
  const bookings = await readAll();
  const index = bookings.findIndex((b) => b.id === id);
  if (index < 0) return null;

  const current = bookings[index];
  const now = new Date().toISOString();
  let scannedAt = current.scanned_at;

  if (status === "scanned") {
    scannedAt =
      current.status === "scanned" && current.scanned_at
        ? current.scanned_at
        : now;
  } else {
    scannedAt = null;
  }

  bookings[index] = {
    ...current,
    leader_name: leaderName,
    contact_number: contactNumber,
    boat_type: boatType,
    pax,
    status,
    scanned_at: scannedAt,
    updated_at: now,
  };
  await writeAll(bookings);
  return bookings[index];
}

export async function localDeleteBooking(id: string) {
  const bookings = await readAll();
  await writeAll(bookings.filter((b) => b.id !== id));
}

export async function localMarkScanned(id: string): Promise<Booking | null> {
  const bookings = await readAll();
  const index = bookings.findIndex((b) => b.id === id);
  if (index < 0) return null;

  const current = bookings[index];
  if (current.status === "scanned") return current;

  const now = new Date().toISOString();
  bookings[index] = {
    ...current,
    status: "scanned",
    scanned_at: now,
    updated_at: now,
  };
  await writeAll(bookings);
  return bookings[index];
}
