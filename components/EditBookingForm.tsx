"use client";

import { useActionState, useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { updateBooking } from "@/lib/actions/bookings";
import type { ActionResult, Booking } from "@/lib/types";

const initial: ActionResult = { ok: false };

export function EditBookingForm({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateBooking, initial);

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state]);

  return (
    <>
      <button type="button" className="btn-secondary button-sm" onClick={() => setOpen(true)}>
        Edit
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit booking">
        <form action={action} className="space-y-4">
          <input type="hidden" name="id" value={booking.id} />
          <label className="block space-y-2">
            <span className="title-4">Group leader</span>
            <input
              name="leader_name"
              required
              defaultValue={booking.leader_name}
              className="field"
            />
          </label>
          <label className="block space-y-2">
            <span className="title-4">Contact number</span>
            <input
              name="contact_number"
              type="tel"
              required
              inputMode="tel"
              defaultValue={booking.contact_number}
              className="field"
            />
          </label>
          <label className="block space-y-2">
            <span className="title-4">Passengers</span>
            <input
              name="pax"
              type="number"
              required
              min={1}
              max={500}
              defaultValue={booking.pax}
              className="field"
            />
          </label>
          <label className="block space-y-2">
            <span className="title-4">Status</span>
            <select
              name="status"
              required
              defaultValue={booking.status}
              className="field"
            >
              <option value="pending">Pending</option>
              <option value="scanned">Scanned</option>
            </select>
          </label>
          <p className="caption-2 text-ink-muted">
            Set to Pending to allow the pass to be scanned again. Set to Scanned to
            mark boarded without scanning.
          </p>
          {state.message ? (
            <p className={`body-5 ${state.ok ? "text-success" : "text-danger"}`} role="status">
              {state.message}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
