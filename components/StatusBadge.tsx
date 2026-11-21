import type { BookingStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: BookingStatus }) {
  if (status === "scanned") {
    return (
      <span className="inline-flex items-center rounded-lg bg-success-soft px-2 py-1 caption-3 text-success border border-success/20">
        Scanned
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-lg bg-lamp-soft px-2 py-1 caption-3 text-lamp-deep border border-lamp/25">
      Pending
    </span>
  );
}
