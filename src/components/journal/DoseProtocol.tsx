// Ported from the SEO hub DoseProtocol, restyled onto the locked shop design system.
// Props match the source exactly.
type DoseProtocolProps = {
  starting: string;
  standard: string;
  frequency: string;
  form: string;
  notes?: string;
};

export default function DoseProtocol({
  starting,
  standard,
  frequency,
  form,
  notes,
}: DoseProtocolProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Starting dose", value: starting },
    { label: "Standard dose", value: standard },
    { label: "Frequency", value: frequency },
    { label: "Form", value: form },
  ];

  return (
    <div className="my-8 max-w-[42rem] rounded-md border-l-[3px] border-accent bg-surface-soft p-5">
      <div className="mb-3.5 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-accent-strong">
        Dosing Protocol
      </div>

      <table className="w-full border-collapse">
        <tbody>
          {rows.map(({ label, value }) => (
            <tr key={label}>
              <td className="whitespace-nowrap pr-6 pb-1.5 align-top text-[0.875rem] text-text-muted">
                {label}
              </td>
              <td className="pb-1.5 font-mono text-[0.9375rem] text-text">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {notes && (
        <p className="mt-3 mb-0 max-w-none text-[0.8rem] text-text-muted">{notes}</p>
      )}
    </div>
  );
}
