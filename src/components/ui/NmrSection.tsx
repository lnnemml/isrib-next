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
  meta?: ReactNode; // e.g. "400 MHz · DMSO-d₆"
  batch?: ReactNode; // batch badge
  signals?: ReactNode; // key-signals footer text
}

interface DownloadItem {
  href: string;
  filename: ReactNode;
  label: ReactNode;
}

interface NmrSectionProps {
  spectra: Spectrum[];
  downloads?: DownloadItem[];
  // Optional dark "raw FID data" banner (ported from the live NMR section). When set,
  // it wraps the download links in a Card-inverse styled band.
  fidBanner?: { heading: ReactNode; body: ReactNode };
}

export function NmrSection({ spectra, downloads = [], fidBanner }: NmrSectionProps) {
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
            <figcaption className="flex items-center justify-between gap-3 border-b border-border-soft px-4 py-3">
              <span className="flex flex-col">
                <span className="font-mono text-[12px] font-medium text-text">{s.label}</span>
                {s.meta && (
                  <span className="mt-0.5 font-mono text-[10px] text-text-subtle">{s.meta}</span>
                )}
              </span>
              {s.batch ? (
                <span className="rounded-full border border-border bg-surface-soft px-2.5 py-0.5 font-mono text-[10px] font-semibold text-accent-strong">
                  {s.batch}
                </span>
              ) : (
                <span className="font-mono text-[10px] text-text-faint">{s.hint}</span>
              )}
            </figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element -- spec uses a raw img */}
            <img src={s.src} alt={s.alt} className="block w-full bg-white" />
            {s.signals && (
              <figcaption className="border-t border-border-soft px-4 py-3 font-mono text-[11px] leading-[1.6] text-text-subtle">
                {s.signals}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {downloads.length > 0 && fidBanner && (
        <div className="mt-6 flex flex-col gap-6 rounded-xl border border-slate-800 bg-surface-inverse p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-[220px] flex-1">
            <div className="mb-2.5 flex items-center gap-2.5">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-[22px] stroke-success"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <h3 className="text-[17px] font-semibold text-white">{fidBanner.heading}</h3>
            </div>
            <p className="text-small leading-[1.65] text-slate-400">{fidBanner.body}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2.5">
            {downloads.map((d, i) => (
              <a
                key={i}
                href={d.href}
                download
                className="inline-flex items-center justify-between gap-3 rounded-md border border-slate-700 bg-surface-inverse-card px-[18px] py-3 transition hover:border-accent"
              >
                <span className="font-mono text-[13px] text-slate-200">{d.filename}</span>
                <span className="font-mono text-[11px] font-semibold text-accent">{d.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {downloads.length > 0 && !fidBanner && (
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
