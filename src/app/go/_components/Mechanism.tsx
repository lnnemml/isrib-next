// S3 · Mechanism (DARK · ch11 Name→Describe→Feature) [B2]. id="mechanism" is the
// hero secondary-CTA target. The 5 chips are BIOLOGY steps (explicitly NOT a "what to
// expect" results/timeframe timeline). Step-number chip fills follow the handoff-spec
// order: cyan-500 / cyan-400 / blue-400 / blue-600 / success. Copy verbatim from the
// deck's FINAL VOICED LINES + S3 chips. Server component.

const STEPS: { title: string; body: string; chip: string; ink: string }[] = [
  {
    title: "Stress hits",
    body: "Chronic pressure signals the cell that something is wrong.",
    chip: "bg-cyan-500",
    ink: "text-[#062a3d]",
  },
  {
    title: "ISR engages",
    body: "The Integrated Stress Response switches on to protect the cell.",
    chip: "bg-cyan-400",
    ink: "text-[#062a3d]",
  },
  {
    title: "Protein synthesis throttled",
    body: "New protein production slows — including proteins neurons use to think.",
    chip: "bg-blue-400",
    ink: "text-[#062a3d]",
  },
  {
    title: "eIF2B clamped",
    body: "The ISR keeps its grip on eIF2B, the master switch it clamps down on.",
    chip: "bg-blue-600",
    ink: "text-white",
  },
  {
    title: "A15 stabilizes eIF2B",
    body: "A15 holds eIF2B in its active shape — designed to release the brake.",
    chip: "bg-success",
    ink: "text-white",
  },
];

export default function Mechanism() {
  return (
    <section id="mechanism" className="scroll-mt-8 bg-surface-inverse py-24 text-white">
      <div className="mx-auto max-w-[--container-page] px-8">
        <div className="mb-14 max-w-[720px]">
          <p className="mb-4 font-mono text-mono-label font-medium uppercase tracking-[0.16em] text-cyan-400">
            The Mechanism · The Brake
          </p>
          <h2 className="mb-5 text-h2 font-bold text-white">
            Meet the brake — the Integrated Stress Response.
          </h2>
          <p className="mb-5 text-body-lg text-slate-400">
            Every cell has a built-in stress switch. Scientists call it the Integrated Stress
            Response — the ISR.
          </p>
          <p className="mb-5 text-body-lg text-slate-400">
            Under pressure, the ISR throttles protein synthesis to protect the cell. Trouble is,
            that includes the proteins your neurons use to form memories and think clearly. For a
            short crisis, that's smart. But after years of chronic stress, the brake can stay
            stuck on.
          </p>
          <p className="text-body-lg text-slate-400">
            eIF2B is the master switch the ISR clamps down on. ISRIB A15 locks onto eIF2B and
            holds it in its active shape — which is how it's designed to release the brake and let
            normal protein synthesis start back up.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-lg border border-slate-800 bg-surface-inverse-card p-6"
            >
              <div
                className={`mb-4 flex size-[34px] items-center justify-center rounded-[9px] font-mono text-[15px] font-semibold ${step.chip} ${step.ink}`}
              >
                {i + 1}
              </div>
              <h3 className="mb-2 text-[15px] font-semibold tracking-[-0.01em] text-white">
                {step.title}
              </h3>
              <p className="text-[13px] leading-[1.6] text-slate-400">{step.body}</p>
            </div>
          ))}
        </div>

        <blockquote className="mt-11 max-w-[820px] border-l-2 border-accent pl-6 text-[16px] italic leading-[1.7] text-slate-300">
          In UCSF research the aged brain was described not as lost, but as trapped — a blockage,
          not permanent damage.
        </blockquote>
      </div>
    </section>
  );
}
