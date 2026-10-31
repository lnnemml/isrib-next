"use client";

// Create and edit share one form. Percentages stay strings until the server parses them, so the
// exact digits typed are what get converted to basis points.
import { useState, useTransition } from "react";
import {
  DEFAULT_COMMISSION_RATE_BPS,
  DEFAULT_CUSTOMER_DISCOUNT_BPS,
  formatBpsAsPercent,
  normalizeAffiliateCode,
  type AffiliateInput,
} from "@/lib/affiliate/core";
import { createAffiliate, updateAffiliate } from "./actions";
import { FIELD_CLASS, FIELD_LABEL_CLASS } from "./form-styles";

const NEW_AFFILIATE: AffiliateInput = {
  name: "",
  handle: "",
  code: "",
  commissionPercent: formatBpsAsPercent(DEFAULT_COMMISSION_RATE_BPS),
  discountPercent: formatBpsAsPercent(DEFAULT_CUSTOMER_DISCOUNT_BPS),
  notifyEmail: "",
  telegramChatId: "",
};

const FIELDS: readonly {
  key: keyof AffiliateInput;
  label: string;
  placeholder?: string;
  inputMode?: "decimal" | "email";
}[] = [
  { key: "name", label: "Name" },
  { key: "handle", label: "Handle", placeholder: "@handle" },
  { key: "code", label: "Code" },
  { key: "commissionPercent", label: "Commission %", inputMode: "decimal" },
  { key: "discountPercent", label: "Buyer discount %", inputMode: "decimal" },
  { key: "notifyEmail", label: "Notify email", inputMode: "email" },
  { key: "telegramChatId", label: "Telegram chat id" },
];

export function AffiliateForm({
  affiliateId,
  initial,
}: {
  affiliateId?: string;
  initial?: AffiliateInput;
}) {
  const isEdit = affiliateId !== undefined;
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<AffiliateInput>(initial ?? NEW_AFFILIATE);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = isEdit
        ? await updateAffiliate(affiliateId, values)
        : await createAffiliate(values);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setSaved(true);
      setValues(
        isEdit
          ? { ...values, code: normalizeAffiliateCode(values.code) ?? values.code }
          : NEW_AFFILIATE,
      );
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FIELDS.map((field) => {
          const id = `affiliate-${field.key}`;
          return (
            <div key={field.key} className="flex flex-col gap-1">
              <label htmlFor={id} className={FIELD_LABEL_CLASS}>
                {field.label}
              </label>
              <input
                id={id}
                value={values[field.key]}
                onChange={(e) => {
                  setValues({ ...values, [field.key]: e.target.value });
                  setSaved(false);
                }}
                placeholder={field.placeholder}
                inputMode={field.inputMode}
                disabled={pending}
                className={FIELD_CLASS}
              />
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-primary bg-surface px-3 py-1.5 text-caption font-semibold text-primary transition hover:bg-surface-soft disabled:opacity-50"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create affiliate"}
        </button>
        {error && <span className="text-caption text-danger">{error}</span>}
        {saved && (
          <span className="text-caption text-success">
            {isEdit ? "Saved." : "Affiliate created."}
          </span>
        )}
      </div>
    </form>
  );
}
