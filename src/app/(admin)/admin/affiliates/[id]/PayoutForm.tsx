"use client";

// Records a payout already sent. A payout cannot be edited or deleted afterwards, so going over
// the balance warns but stays allowed: the amount is what really left the wallet.
import { useState, useTransition } from "react";
import {
  PAYOUT_CURRENCIES,
  parseUsdToCents,
  type PayoutInput,
} from "@/lib/affiliate/core";
import { recordPayout } from "../actions";
import { FIELD_CLASS, FIELD_LABEL_CLASS } from "../form-styles";

export function PayoutForm({
  affiliateId,
  balanceCents,
  balanceLabel,
  today,
}: {
  affiliateId: string;
  balanceCents: number;
  balanceLabel: string;
  today: string;
}) {
  const blank: PayoutInput = {
    amountUsd: "",
    currency: PAYOUT_CURRENCIES[0],
    cryptoAmount: "",
    txHash: "",
    periodStart: "",
    periodEnd: "",
    paidAt: today,
  };

  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<PayoutInput>(blank);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const amountCents = parseUsdToCents(values.amountUsd);
  const overBalance = amountCents !== null && amountCents > balanceCents;

  function update(key: keyof PayoutInput, value: string) {
    setValues({ ...values, [key]: value });
    setSaved(false);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await recordPayout(affiliateId, values);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setValues(blank);
      setSaved(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="payout-amount" className={FIELD_LABEL_CLASS}>
            {"Amount (USD)"}
          </label>
          <input
            id="payout-amount"
            value={values.amountUsd}
            onChange={(e) => update("amountUsd", e.target.value)}
            inputMode="decimal"
            disabled={pending}
            className={FIELD_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="payout-currency" className={FIELD_LABEL_CLASS}>
            {"Currency"}
          </label>
          <select
            id="payout-currency"
            value={values.currency}
            onChange={(e) => update("currency", e.target.value)}
            disabled={pending}
            className={FIELD_CLASS}
          >
            {PAYOUT_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="payout-crypto-amount" className={FIELD_LABEL_CLASS}>
            {"Crypto amount"}
          </label>
          <input
            id="payout-crypto-amount"
            value={values.cryptoAmount}
            onChange={(e) => update("cryptoAmount", e.target.value)}
            inputMode="decimal"
            disabled={pending}
            className={`${FIELD_CLASS} font-mono`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="payout-paid-at" className={FIELD_LABEL_CLASS}>
            {"Paid on (UTC)"}
          </label>
          <input
            id="payout-paid-at"
            type="date"
            value={values.paidAt}
            onChange={(e) => update("paidAt", e.target.value)}
            disabled={pending}
            className={FIELD_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="payout-tx-hash" className={FIELD_LABEL_CLASS}>
            {"Tx hash"}
          </label>
          <input
            id="payout-tx-hash"
            value={values.txHash}
            onChange={(e) => update("txHash", e.target.value)}
            disabled={pending}
            className={`${FIELD_CLASS} font-mono`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="payout-period-start" className={FIELD_LABEL_CLASS}>
            {"Period start"}
          </label>
          <input
            id="payout-period-start"
            type="date"
            value={values.periodStart}
            onChange={(e) => update("periodStart", e.target.value)}
            disabled={pending}
            className={FIELD_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="payout-period-end" className={FIELD_LABEL_CLASS}>
            {"Period end"}
          </label>
          <input
            id="payout-period-end"
            type="date"
            value={values.periodEnd}
            onChange={(e) => update("periodEnd", e.target.value)}
            disabled={pending}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      {overBalance && (
        <span className="text-caption text-warning">
          {`This is more than the current balance of ${balanceLabel}. You can still record it, and the balance will go negative.`}
        </span>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-primary bg-surface px-3 py-1.5 text-caption font-semibold text-primary transition hover:bg-surface-soft disabled:opacity-50"
        >
          {pending ? "Recording…" : "Record payout"}
        </button>
        {error && <span className="text-caption text-danger">{error}</span>}
        {saved && <span className="text-caption text-success">{"Payout recorded."}</span>}
      </div>
    </form>
  );
}
