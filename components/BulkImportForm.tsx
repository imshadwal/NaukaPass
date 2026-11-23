"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  importBookingsCsv,
  type BulkImportResult,
} from "@/lib/actions/bookings";

const initial: BulkImportResult = { ok: false };

export function BulkImportForm() {
  const [state, action, pending] = useActionState(importBookingsCsv, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="card-surface p-6 space-y-4"
      encType="multipart/form-data"
    >
      <div>
        <h2 className="heading-6 text-accent">Import many passes</h2>
        <p className="body-6 text-ink-muted mt-1 text-pretty">
          Upload a CSV with guest name, mobile, boat type (Motor or Bajra), and
          passenger count. All valid rows are created at once.
        </p>
      </div>

      <ol className="body-6 text-ink-muted space-y-1 list-decimal pl-5">
        <li>Open your Google Sheet</li>
        <li>File → Download → Comma Separated Values (.csv)</li>
        <li>Upload that CSV here</li>
      </ol>

      <div className="flex flex-wrap gap-2">
        <a href="/naukapass-import-template.csv" className="btn-secondary button-sm" download>
          Download ready CSV from your sheet
        </a>
      </div>

      <label className="block space-y-2">
        <span className="title-4">CSV file</span>
        <input
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="field file:mr-3 file:rounded-lg file:border-0 file:bg-accent-soft file:px-3 file:py-1 file:text-accent"
        />
      </label>

      {state.message ? (
        <p
          className={`body-5 ${state.ok ? "text-success" : "text-danger"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      {state.details && state.details.length > 0 ? (
        <ul className="caption-2 text-ink-muted space-y-1">
          {state.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Importing…" : "Import all passes"}
      </button>
    </form>
  );
}
