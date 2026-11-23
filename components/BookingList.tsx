"use client";

import { useState } from "react";
import { boatTypeLabel, type Booking } from "@/lib/types";
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

function filterBookings(bookings: Booking[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return bookings;

  const queryDigits = q.replace(/\D/g, "");

  return bookings.filter((booking) => {
    const name = booking.leader_name.toLowerCase();
    const contact = (booking.contact_number || "").toLowerCase();
    const contactDigits = contact.replace(/\D/g, "");

    return (
      name.includes(q) ||
      contact.includes(q) ||
      (queryDigits.length > 0 && contactDigits.includes(queryDigits))
    );
  });
}

export function BookingList({ bookings }: { bookings: Booking[] }) {
  const [query, setQuery] = useState("");
  const filtered = filterBookings(bookings, query);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between px-1">
        <div>
          <h2 className="heading-6">All group bookings</h2>
          <p className="caption-2 text-ink-muted mt-1">
            {filtered.length === bookings.length
              ? `${bookings.length} total`
              : `${filtered.length} of ${bookings.length} shown`}
          </p>
        </div>
        <label className="block w-full sm:w-72 space-y-2">
          <span className="title-5 text-ink-muted">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or contact number"
            className="field"
            autoComplete="off"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface p-8 text-center space-y-2">
          <p className="title-2">No bookings match</p>
          <p className="body-6 text-ink-muted">
            Try another name or contact number.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((booking) => (
            <li key={booking.id} className="card-surface p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="title-1 truncate">{booking.leader_name}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="body-6 text-ink-muted">
                    {boatTypeLabel(booking.boat_type)} ·{" "}
                    {booking.contact_number || "No contact"} · {booking.pax}{" "}
                    {booking.pax === 1 ? "passenger" : "passengers"} · Created{" "}
                    {formatWhen(booking.created_at)}
                  </p>
                  <p className="caption-5 text-ink-muted font-mono truncate">
                    ID {booking.id}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ViewQrButton booking={booking} />
                  <EditBookingForm booking={booking} />
                  <DeleteBookingButton
                    id={booking.id}
                    leaderName={booking.leader_name}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
