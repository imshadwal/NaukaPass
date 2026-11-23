"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { getBooking, markScanned } from "@/lib/actions/bookings";
import { boatTypeLabel, type Booking } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

function extractBookingId(raw: string): string | null {
  const trimmed = raw.trim();

  const direct = trimmed.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
  if (direct) return direct[0];

  try {
    const url = new URL(trimmed);
    const id = url.searchParams.get("id");
    if (id && UUID_RE.test(id)) {
      const match = id.match(UUID_RE);
      if (match) return match[0];
    }
  } catch {
    // not a URL
  }

  const embedded = trimmed.match(UUID_RE);
  return embedded ? embedded[0] : null;
}

type ScanState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; booking: Booking; message?: string; already?: boolean }
  | { kind: "error"; message: string };

async function stopScanner(scanner: Html5Qrcode | null) {
  if (!scanner) return;
  try {
    if (scanner.isScanning) {
      await scanner.stop();
    }
    scanner.clear();
  } catch {
    // ignore cleanup errors
  }
}

export function Scanner({ initialId }: { initialId?: string }) {
  const [state, setState] = useState<ScanState>(
    initialId ? { kind: "loading" } : { kind: "idle" },
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualValue, setManualValue] = useState("");
  const [session, setSession] = useState(0);
  const [pending, startTransition] = useTransition();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastCodeRef = useRef<string>("");
  const regionId = "naukapass-reader";

  const showScanner = state.kind === "idle" || state.kind === "error";

  const loadBooking = useCallback(async (id: string) => {
    setState({ kind: "loading" });
    try {
      const booking = await getBooking(id);
      if (!booking) {
        setState({
          kind: "error",
          message: "No booking found for this QR code.",
        });
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
    } catch {
      setState({
        kind: "error",
        message: "Could not look up this pass. Try again.",
      });
    }
  }, []);

  const handleDecoded = useCallback(
    (decoded: string) => {
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
    [loadBooking],
  );

  useEffect(() => {
    if (initialId) {
      void loadBooking(initialId);
    }
  }, [initialId, loadBooking]);

  useEffect(() => {
    if (!showScanner) {
      const active = scannerRef.current;
      scannerRef.current = null;
      void stopScanner(active);
      return;
    }

    let cancelled = false;

    async function start() {
      setCameraError(null);
      try {
        const scanner = new Html5Qrcode(regionId, { verbose: false });
        scannerRef.current = scanner;

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras.length) {
          throw new Error("No camera found");
        }

        const backCamera =
          cameras.find((c) => /back|rear|environment/i.test(c.label)) ||
          cameras[cameras.length - 1];

        await scanner.start(
          backCamera.id,
          {
            fps: 12,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const edge = Math.floor(
                Math.min(viewfinderWidth, viewfinderHeight) * 0.75,
              );
              return { width: edge, height: edge };
            },
            aspectRatio: 1,
            disableFlip: false,
          },
          (decoded) => {
            handleDecoded(decoded);
          },
          () => undefined,
        );
      } catch {
        if (!cancelled) {
          setCameraError(
            "Camera could not start. Allow camera permission, or use photo upload / paste id below.",
          );
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      const active = scannerRef.current;
      scannerRef.current = null;
      void stopScanner(active);
    };
  }, [showScanner, session, handleDecoded]);

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
    setManualValue("");
    setState({ kind: "idle" });
    setSession((n) => n + 1);
  }

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const id = extractBookingId(manualValue);
    if (!id) {
      setState({
        kind: "error",
        message: "Paste a NaukaPass link or booking id.",
      });
      return;
    }
    lastCodeRef.current = "";
    void loadBooking(id);
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      setState({ kind: "loading" });
      const temp = new Html5Qrcode("naukapass-file-reader");
      const decoded = await temp.scanFile(file, true);
      temp.clear();
      handleDecoded(decoded);
    } catch {
      setState({
        kind: "error",
        message:
          "Could not read QR from that image. Try a clearer photo of only the QR square, or paste the booking id.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div id="naukapass-file-reader" className="hidden" />

      {showScanner ? (
        <>
          <div className="card-surface overflow-hidden">
            <div id={regionId} className="w-full min-h-72 bg-ink" />
            {cameraError ? (
              <p className="body-5 text-danger p-4" role="alert">
                {cameraError}
              </p>
            ) : (
              <p className="caption-2 text-ink-muted p-3 text-center text-pretty">
                Fill the green box with only the QR square. Printed paper works
                better than scanning another phone screen.
              </p>
            )}
          </div>

          <div className="card-surface p-5 space-y-4">
            <p className="title-4">If camera is stuck</p>
            <label className="btn-secondary w-full cursor-pointer">
              Upload pass photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={onFileChange}
              />
            </label>
            <form onSubmit={submitManual} className="space-y-3">
              <label className="block space-y-2">
                <span className="title-4">Or paste booking link / id</span>
                <input
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  className="field"
                  placeholder="Paste scan URL or UUID"
                />
              </label>
              <button type="submit" className="btn-primary w-full">
                Look up pass
              </button>
            </form>
          </div>
        </>
      ) : null}

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
              {boatTypeLabel(state.booking.boat_type)} ·{" "}
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

            {state.booking.status === "pending" ? (
              <button type="button" className="btn-ghost" onClick={reset}>
                Scan a different pass
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
