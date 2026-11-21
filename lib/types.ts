export type BookingStatus = "pending" | "scanned";

export type Booking = {
  id: string;
  leader_name: string;
  contact_number: string;
  pax: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  scanned_at: string | null;
};

export type ActionResult = {
  ok: boolean;
  message?: string;
  bookingId?: string;
};
