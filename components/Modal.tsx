"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink/40 transition-opacity duration-300 no-print"
        style={{ transitionTimingFunction: "var(--ease-out-weighted)" }}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative z-10 w-full ${wide ? "max-w-lg" : "max-w-md"} max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-surface border border-border shadow-lg outline-none p-6 space-y-4 translate-y-0 opacity-100 transition-all duration-500 print:max-w-none print:border-0 print:shadow-none print:p-0 print:max-h-none`}
        style={{ transitionTimingFunction: "var(--ease-out-weighted)" }}
      >
        <div className="flex items-start justify-between gap-3 no-print">
          <h2 id={titleId} className="heading-6">
            {title}
          </h2>
          <button type="button" className="btn-ghost !p-2" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
