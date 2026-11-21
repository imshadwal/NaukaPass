"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Modal } from "@/components/Modal";
import { deleteBooking } from "@/lib/actions/bookings";

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-danger" disabled={pending}>
      {pending ? "Removing…" : "Confirm delete"}
    </button>
  );
}

export function DeleteBookingButton({ id, leaderName }: { id: string; leaderName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn-ghost button-sm text-danger"
        onClick={() => setOpen(true)}
      >
        Delete
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Delete booking">
        <p className="body-6 text-ink-muted text-pretty">
          Remove {leaderName}&apos;s group booking? This pass will no longer work when scanned.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <form action={deleteBooking}>
            <input type="hidden" name="id" value={id} />
            <ConfirmDeleteButton />
          </form>
          <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
            Keep booking
          </button>
        </div>
      </Modal>
    </>
  );
}
