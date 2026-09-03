import type { ReactNode } from "react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import type { UnderstandingContent } from "@/lib/copy/products";

// Bespoke "Understanding ISRIB A15" section — a faithful port of the live deep
// mechanism section (product_isrib_A15.html ~424–627). The locked MechanismSection is
// too small for this content, so this is hand-built from LOCKED design tokens only
// (success / accent / primary + neutral slate/text-* tokens). The live page's rainbow
// (amber / purple / magenta / red) is intentionally collapsed onto the locked palette.
//
// Ordering follows the live page: 4A What is → 4B ISR Window → 4C Translational →
// 4D Mechanism (the dark MechanismSection, injected via the `mechanism` slot) → 4E
// Key research applications.

// Neutral, token-only icon chip (matches the education-card idiom in page.tsx).
function IconChip({
  children,
  tone = "success",
}: {
  children: ReactNode;
  tone?: "success" | "accent" | "primary";
}) {
  const bg =
    tone === "accent" ? "bg-cyan-50" : tone === "primary" ? "bg-blue-50" : "bg-surface-soft";
  const stroke =
    tone === "accent"
      ? "stroke-accent-strong"
      : tone === "primary"
        ? "stroke-primary"
        : "stroke-success";
  return (
    <span
      aria-hidden
      className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", bg)}
    >
      <span className={cn("[&>svg]:size-3.5", stroke)}>{children}</span>
    </span>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4m0 4h.01" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M12 8v4l3 3" />
    </svg>
  );
}
function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3zM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3z" />
    </svg>
  );
}
function CheckSquareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function BlockHeader({
  icon,
  tone,
  children,
}: {
  icon: ReactNode;
  tone?: "success" | "accent" | "primary";
  children: ReactNode;
}) {
  return (
    <div className="mb-[18px] flex items-center gap-2.5">
      <IconChip tone={tone}>{icon}</IconChip>
      <h3 className="text-h3 font-semibold text-text">{children}</h3>
    </div>
  );
}

function Divider() {
  return <hr className="my-14 border-none border-t border-border-soft" />;
}

export function UnderstandingSection({
  content,
  mechanism,
}: {
  content: UnderstandingContent;
  mechanism?: ReactNode; // dark MechanismSection (block 4D), rendered in live position
}) {
  const { whatIs, isrWindow, translational, applications } = content;

  return (
    <section id="understanding" className="border-b border-border bg-surface py-20">
      <div className="mx-auto max-w-[860px] px-8">
        <p className="mb-2.5 text-center font-mono text-mono-label font-semibold uppercase tracking-[0.12em] text-success">
          {content.eyebrow}
        </p>
        <h2 className="mb-4 text-center text-h2 font-bold text-text">{content.title}</h2>
        <p className="mx-auto mb-16 max-w-[640px] text-center text-body text-text-subtle">
          {content.intro}
        </p>

        {/* 4A — What is ISRIB A15? */}
        <div>
          <BlockHeader icon={<InfoIcon />} tone="success">
            {whatIs.heading}
          </BlockHeader>
          {whatIs.paragraphs.map((p, i) => (
            <p key={i} className="mb-4 text-body text-text-muted last:mb-6">
              {p}
            </p>
          ))}
          <Card className="overflow-hidden p-0">
            <table className="w-full border-collapse text-small">
              <thead>
                <tr className="bg-surface-soft">
                  <th className="w-[38%] border-b border-border px-5 py-3 text-left font-semibold text-success">
                    {"Property"}
                  </th>
                  <th className="border-b border-border px-5 py-3 text-left font-semibold text-success">
                    {"Detail"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {whatIs.table.map((row) => (
                  <tr key={row.property} className="border-b border-border-soft last:border-0">
                    <td className="px-5 py-2.5 align-top text-text-subtle">{row.property}</td>
                    <td
                      className={cn(
                        "px-5 py-2.5 align-top",
                        row.mono ? "break-words font-mono text-[13px] text-text" : "text-text",
                        row.strong && "font-semibold text-success",
                      )}
                    >
                      {row.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <Divider />

        {/* 4B — The ISR Window */}
        <div>
          <BlockHeader icon={<ClockIcon />} tone="accent">
            {isrWindow.heading}
          </BlockHeader>
          {isrWindow.paragraphs.map((p, i) => (
            <p key={i} className="mb-4 text-body text-text-muted last:mb-6">
              {p}
            </p>
          ))}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isrWindow.cards.map((c, i) => {
              const topTone =
                i === 0 ? "border-t-accent" : i === 1 ? "border-t-success" : "border-t-primary";
              const eyebrowTone =
                i === 0 ? "text-accent-strong" : i === 1 ? "text-success" : "text-primary";
              return (
                <div
                  key={c.eyebrow}
                  className={cn(
                    "rounded-xl border border-border border-t-[3px] bg-surface p-[22px] shadow-sm",
                    topTone,
                  )}
                >
                  <p
                    className={cn(
                      "mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em]",
                      eyebrowTone,
                    )}
                  >
                    {c.eyebrow}
                  </p>
                  <p className="text-small leading-[1.75] text-text-muted">{c.body}</p>
                </div>
              );
            })}
          </div>
          <blockquote className="mt-6 rounded-r-lg border-l-2 border-success bg-surface-soft px-5 py-4 text-small italic leading-[1.7] text-success">
            {isrWindow.callout}
          </blockquote>
        </div>

        <Divider />

        {/* 4C — Translational restoration */}
        <div>
          <BlockHeader icon={<BrainIcon />} tone="primary">
            {translational.heading}
          </BlockHeader>
          {translational.paragraphs.map((p, i) => (
            <p key={i} className="mb-4 text-body text-text-muted last:mb-6">
              {p}
            </p>
          ))}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {translational.cards.map((c, i) => (
              <div
                key={c.title}
                className="rounded-xl border border-border bg-surface-soft p-[22px]"
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <IconChip tone={i === 0 ? "primary" : i === 1 ? "accent" : "success"}>
                    <InfoIcon />
                  </IconChip>
                  <strong className="text-[15px] font-semibold text-text">{c.title}</strong>
                </div>
                <p className="text-small leading-[1.75] text-text-muted">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4D — Mechanism of action (the locked dark MechanismSection, in live position) */}
      {mechanism && <div className="mt-14">{mechanism}</div>}

      <div className="mx-auto max-w-[860px] px-8">
        {mechanism && <Divider />}

        {/* 4E — Key research applications */}
        <div>
          <BlockHeader icon={<CheckSquareIcon />} tone="accent">
            {applications.heading}
          </BlockHeader>
          <p className="mb-6 text-body text-text-muted">{applications.intro}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.cards.map((c, i) => (
              <div
                key={c.title}
                className="flex items-start gap-3.5 rounded-xl border border-border bg-surface p-[22px] shadow-sm"
              >
                <IconChip tone={i % 3 === 0 ? "success" : i % 3 === 1 ? "primary" : "accent"}>
                  <BrainIcon />
                </IconChip>
                <div>
                  <strong className="mb-1.5 block text-[15px] font-semibold text-text">
                    {c.title}
                  </strong>
                  <p className="text-small leading-[1.7] text-text-subtle">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
