import type { Booking } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { EditBookingForm } from "@/components/EditBookingForm";
import { DeleteBookingButton } from "@/components/DeleteBookingButton";
import { ViewQrButton } from "@/components/ViewQrButton";

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function BookingList({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="card-surface p-8 text-center space-y-2">
        <p className="title-2">Add the first group booking</p>
        <p className="body-6 text-ink-muted max-w-md mx-auto text-pretty">
          Create a pass above. It will show here with QR, edit, and delete actions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h2 className="heading-6">All group bookings</h2>
        <p className="caption-2 text-ink-muted">{bookings.length} total</p>
      </div>

      <ul className="space-y-3">
        {bookings.map((booking) => (
          <li key={booking.id} className="card-surface p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="title-1 truncate">{booking.leader_name}</p>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="body-6 text-ink-muted">
                  {booking.contact_number || "No contact"} · {booking.pax}{" "}
                  {booking.pax === 1 ? "passenger" : "passengers"} · Created{" "}
                  {formatWhen(booking.created_at)}
                </p>
                <p className="caption-5 text-ink-muted font-mono truncate">ID {booking.id}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ViewQrButton booking={booking} />
                <EditBookingForm booking={booking} />
                <DeleteBookingButton id={booking.id} leaderName={booking.leader_name} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
