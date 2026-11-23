"use client";

import { useActionState } from "react";
import { createBooking } from "@/lib/actions/bookings";
import type { ActionResult } from "@/lib/types";

const initial: ActionResult = { ok: false };

export function CreateBookingForm() {
  const [state, action, pending] = useActionState(createBooking, initial);

  return (
    <form action={action} className="card-warm p-6 space-y-4">
      <div>
        <h2 className="heading-6 text-lamp-deep">New group booking</h2>
        <p className="body-6 text-ink-muted mt-1">
          Add the group leader, contact, boat type, and passenger count to issue a
          boarding pass.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 sm:col-span-2">
          <span className="title-4">Group leader name</span>
          <input
            name="leader_name"
            required
            autoComplete="name"
            placeholder="e.g. Ananya Sharma"
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
            autoComplete="tel"
            placeholder="e.g. 9876543210"
            className="field"
          />
        </label>
        <label className="block space-y-2">
          <span className="title-4">Boat type</span>
          <select name="boat_type" required defaultValue="motor_boat" className="field">
            <option value="motor_boat">Motor Boat</option>
            <option value="bajra_boat">Bajra Boat</option>
          </select>
        </label>
        <label className="block space-y-2 sm:col-span-2">
          <span className="title-4">Number of passengers</span>
          <input
            name="pax"
            type="number"
            required
            min={1}
            max={500}
            defaultValue={1}
            className="field"
          />
        </label>
      </div>

      {state.message && !state.ok ? (
        <p className="body-5 text-danger" role="alert">
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Creating pass…" : "Create boarding pass"}
      </button>
    </form>
  );
}
