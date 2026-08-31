"use client";

import { useState } from "react";
import type { ReactNode } from "react";

// Class strings verbatim from handoff-spec.md §4 "NMR section" (lines 278–301).
// The lightbox <img> is mounted ONLY when a real src is set (src !== null) — this is
// the exact bug the design pass caught: never render <img src={null/undefined}>, or an
// unresolved-hole fetch fires.
interface Spectrum {
  label: ReactNode;
  hint: ReactNode;
  src: string;
  alt: string;
}

interface DownloadItem {
  href: string;
  filename: ReactNode;
  label: ReactNode;
}

interface NmrSectionProps {
  spectra: Spectrum[];
  downloads?: DownloadItem[];
}

export function NmrSection({ spectra, downloads = [] }: NmrSectionProps) {
  const [src, setSrc] = useState<string | null>(null); // null = closed

  const close = () => setSrc(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {spectra.map((s, i) => (
          <figure
            key={i}
            onClick={() => setSrc(s.src)}
            className="cursor-zoom-in overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition hover:border-blue-300"
          >
            <figcaption className="flex items-center justify-between border-b border-border-soft px-4 py-3">
              <span className="font-mono text-[12px] font-medium text-text">{s.label}</span>
              <span className="font-mono text-[10px] text-text-faint">{s.hint}</span>
            </figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element -- spec uses a raw img */}
            <img src={s.src} alt={s.alt} className="block w-full bg-white" />
          </figure>
        ))}
      </div>

      {downloads.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {downloads.map((d, i) => (
            <a
              key={i}
              href={d.href}
              download
              className="flex items-center justify-between rounded-md border border-border bg-surface px-[18px] py-3.5 transition hover:border-primary hover:bg-surface-soft"
            >
              <span className="font-mono text-[13px] text-text">{d.filename}</span>
              <span className="font-mono text-[11px] font-semibold text-accent-strong">{d.label}</span>
            </a>
          ))}
        </div>
      )}

      {src !== null && (
        <div
          onClick={close}
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-slate-950/90 p-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- spec uses a raw img */}
          <img
            src={src}
            alt="NMR spectrum"
            className="max-h-[92vh] max-w-full rounded-md bg-white shadow-[0_24px_60px_rgba(0,0,0,.5)]"
          />
          <button
            onClick={close}
            className="absolute right-[26px] top-[22px] flex size-[42px] items-center justify-center rounded-full border-none bg-white/15 text-[22px] text-white"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
