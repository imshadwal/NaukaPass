"use client";

import { useEffect, useState } from "react";
import { buildPassImageDataUrl } from "@/lib/pass-image";

export function QrDisplay({
  value,
  leaderName,
  contactNumber,
  boatTypeLabel,
  pax,
  bookingId,
}: {
  value: string;
  leaderName: string;
  contactNumber: string;
  boatTypeLabel: string;
  pax: number;
  bookingId: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    setError(null);

    buildPassImageDataUrl({
      value,
      leaderName,
      contactNumber,
      boatTypeLabel,
      pax,
      bookingId,
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError("Could not generate boarding pass image.");
      });

    return () => {
      cancelled = true;
    };
  }, [value, leaderName, contactNumber, boatTypeLabel, pax, bookingId]);

  async function download() {
    setDownloading(true);
    try {
      const url =
        dataUrl ??
        (await buildPassImageDataUrl({
          value,
          leaderName,
          contactNumber,
          boatTypeLabel,
          pax,
          bookingId,
        }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `naukapass-${leaderName.replace(/\s+/g, "_").toLowerCase()}.png`;
      a.click();
    } catch {
      setError("Could not download boarding pass image.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="print-pass max-w-md mx-auto text-center space-y-4">
        {error ? (
          <p className="body-5 text-danger">{error}</p>
        ) : dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={`Boarding pass for ${leaderName}`}
            className="mx-auto w-full rounded-xl border border-border bg-white"
          />
        ) : (
          <div className="mx-auto aspect-[720/1040] w-full rounded-xl bg-background animate-pulse" />
        )}
      </div>

      <div className="no-print flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={download}
          disabled={!dataUrl || downloading}
        >
          {downloading ? "Preparing…" : "Download pass"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => window.print()}>
          Print pass
        </button>
      </div>
    </div>
  );
}
