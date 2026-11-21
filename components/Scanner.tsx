"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { getBooking, markScanned } from "@/lib/actions/bookings";
import type { Booking } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

function extractBookingId(raw: string): string | null {
  const trimmed = raw.trim();
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRe.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const id = url.searchParams.get("id");
    if (id && uuidRe.test(id)) return id;
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && uuidRe.test(last)) return last;
  } catch {
    // not a URL
  }

  return null;
}

type ScanState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; booking: Booking; message?: string; already?: boolean }
  | { kind: "error"; message: string };

export function Scanner({ initialId }: { initialId?: string }) {
  const [state, setState] = useState<ScanState>({ kind: "idle" });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastCodeRef = useRef<string>("");
  const regionId = "naukapass-reader";

  const loadBooking = useCallback(async (id: string) => {
    setState({ kind: "loading" });
    const booking = await getBooking(id);
    if (!booking) {
      setState({ kind: "error", message: "No booking found for this QR code." });
      return;
    }
    if (booking.status === "scanned") {
      setState({
        kind: "ready",
        booking,
        already: true,
        message: "This pass was already scanned.",
      });
      return;
    }
    setState({ kind: "ready", booking });
  }, []);

  useEffect(() => {
    if (initialId) {
      void loadBooking(initialId);
    }
  }, [initialId, loadBooking]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const scanner = new Html5Qrcode(regionId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            if (decoded === lastCodeRef.current) return;
            lastCodeRef.current = decoded;
            const id = extractBookingId(decoded);
            if (!id) {
              setState({
                kind: "error",
                message: "QR code is not a NaukaPass booking.",
              });
              return;
            }
            void loadBooking(id);
          },
          () => undefined,
        );
      } catch {
        if (!cancelled) {
          setCameraError(
            "Camera could not start. Allow camera access and use HTTPS on a phone or tablet.",
          );
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner?.isScanning) {
        void scanner.stop().then(() => scanner.clear()).catch(() => undefined);
      }
    };
  }, [loadBooking]);

  function onMarkBoarded() {
    if (state.kind !== "ready") return;
    const id = state.booking.id;
    startTransition(async () => {
      const result = await markScanned(id);
      if (result.booking) {
        setState({
          kind: "ready",
          booking: result.booking,
          already: !result.ok,
          message: result.message,
        });
      } else {
        setState({
          kind: "error",
          message: result.message ?? "Could not mark as boarded.",
        });
      }
    });
  }

  function reset() {
    lastCodeRef.current = "";
    setState({ kind: "idle" });
  }

  return (
    <div className="space-y-6">
      <div className="card-surface overflow-hidden">
        <div id={regionId} className="w-full min-h-64 bg-ink" />
        {cameraError ? (
          <p className="body-5 text-danger p-4" role="alert">
            {cameraError}
          </p>
        ) : (
          <p className="caption-2 text-ink-muted p-3 text-center">
            Point the camera at a NaukaPass QR code
          </p>
        )}
      </div>

      <div className="card-surface p-5 space-y-4 min-h-40">
        {state.kind === "idle" ? (
          <p className="body-6 text-ink-muted">Waiting for a scan…</p>
        ) : null}

        {state.kind === "loading" ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-6 w-40 rounded-lg bg-background" />
            <div className="h-4 w-56 rounded-lg bg-background" />
            <div className="h-10 w-full rounded-lg bg-background" />
          </div>
        ) : null}

        {state.kind === "error" ? (
          <div className="space-y-3">
            <p className="body-5 text-danger" role="alert">
              {state.message}
            </p>
            <button type="button" className="btn-secondary" onClick={reset}>
              Scan again
            </button>
          </div>
        ) : null}

        {state.kind === "ready" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="heading-6">{state.booking.leader_name}</h2>
              <StatusBadge status={state.booking.status} />
            </div>
            <p className="body-5 text-ink-muted">
              {state.booking.contact_number || "No contact"} · {state.booking.pax}{" "}
              {state.booking.pax === 1 ? "passenger" : "passengers"}
            </p>
            <p className="caption-5 font-mono text-ink-muted break-all">
              ID {state.booking.id}
            </p>

            {state.message ? (
              <p
                className={`body-5 ${state.already ? "text-danger" : "text-success"}`}
                role="status"
              >
                {state.message}
              </p>
            ) : null}

            {state.booking.status === "pending" ? (
              <button
                type="button"
                className="btn-primary"
                onClick={onMarkBoarded}
                disabled={pending}
              >
                {pending ? "Marking…" : "Mark as boarded"}
              </button>
            ) : (
              <button type="button" className="btn-secondary" onClick={reset}>
                Scan next pass
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
