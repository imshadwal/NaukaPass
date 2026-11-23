export type BookingStatus = "pending" | "scanned";

export type BoatType = "motor_boat" | "bajra_boat";

export const BOAT_TYPE_LABELS: Record<BoatType, string> = {
  motor_boat: "Motor Boat",
  bajra_boat: "Bajra Boat",
};

export type Booking = {
  id: string;
  leader_name: string;
  contact_number: string;
  boat_type: BoatType;
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

export function boatTypeLabel(boatType: BoatType | string | null | undefined) {
  if (boatType === "motor_boat" || boatType === "bajra_boat") {
    return BOAT_TYPE_LABELS[boatType];
  }
  return "Boat not set";
}
