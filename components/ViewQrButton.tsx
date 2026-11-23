"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { QrDisplay } from "@/components/QrDisplay";
import { StatusBadge } from "@/components/StatusBadge";
import { boatTypeLabel, type Booking } from "@/lib/types";

function qrValueFor(id: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  return siteUrl ? `${siteUrl}/scan?id=${id}` : id;
}

export function ViewQrButton({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const boatLabel = boatTypeLabel(booking.boat_type);

  return (
    <>
      <button type="button" className="btn-primary button-sm" onClick={() => setOpen(true)}>
        View QR
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Boarding pass" wide>
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <p className="title-3">{booking.leader_name}</p>
          <StatusBadge status={booking.status} />
        </div>
        <p className="caption-2 text-ink-muted no-print">
          {boatLabel} · {booking.contact_number || "No contact number"} · {booking.pax}{" "}
          {booking.pax === 1 ? "passenger" : "passengers"}
        </p>
        <QrDisplay
          value={qrValueFor(booking.id)}
          leaderName={booking.leader_name}
          contactNumber={booking.contact_number}
          boatTypeLabel={boatLabel}
          pax={booking.pax}
          bookingId={booking.id}
        />
      </Modal>
    </>
  );
}
