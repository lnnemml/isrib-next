"use client";

// Access and delivery controls. A generated sign-in link lives only in this component's state: it
// is shown once, and a reload is the end of it.
import { useState, useTransition } from "react";
import {
  generateLoginLink,
  sendTestNotification,
  setAffiliateActive,
  type TestNotificationResult,
} from "../actions";
import { CopyButton } from "../CopyButton";
import { FIELD_CLASS } from "../form-styles";

const SECONDARY_BUTTON =
  "rounded border border-border bg-surface px-3 py-1.5 text-caption font-semibold text-text transition hover:bg-surface-soft disabled:opacity-50";

const DANGER_BUTTON =
  "rounded border border-danger bg-surface px-3 py-1.5 text-caption font-semibold text-danger transition hover:bg-surface-soft disabled:opacity-50";

const SUCCESS_BUTTON =
  "rounded border border-success bg-surface px-3 py-1.5 text-caption font-semibold text-success transition hover:bg-surface-soft disabled:opacity-50";

function testResultLabel(result: Extract<TestNotificationResult, { ok: true }>): string {
  if (result.channel === "telegram") return "Sent by Telegram.";
  return result.telegramError
    ? `Sent by email. Telegram failed: ${result.telegramError}`
    : "Sent by email.";
}

export function AffiliateControls({
  affiliateId,
  isActive,
}: {
  affiliateId: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);

  function run(action: () => Promise<void>) {
    setError(null);
    setNotice(null);
    startTransition(action);
  }

  function onToggleActive() {
    if (
      isActive &&
      !window.confirm(
        "Deactivate this affiliate? Their code and link stop working and they are signed out at once. Their orders and payouts stay.",
      )
    ) {
      return;
    }
    run(async () => {
      const res = await setAffiliateActive(affiliateId, !isActive);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setLoginUrl(null);
      setNotice(isActive ? "Deactivated. Partner sessions are cut." : "Activated.");
    });
  }

  function onGenerateLink() {
    run(async () => {
      const res = await generateLoginLink(affiliateId);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setLoginUrl(res.url);
    });
  }

  function onSendTest() {
    run(async () => {
      const res = await sendTestNotification(affiliateId);
      if ("error" in res) setError(res.error);
      else setNotice(testResultLabel(res));
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onGenerateLink}
          disabled={pending || !isActive}
          className={SECONDARY_BUTTON}
        >
          {"Generate login link"}
        </button>
        <button
          type="button"
          onClick={onSendTest}
          disabled={pending}
          className={SECONDARY_BUTTON}
        >
          {"Send test notification"}
        </button>
        <button
          type="button"
          onClick={onToggleActive}
          disabled={pending}
          className={isActive ? DANGER_BUTTON : SUCCESS_BUTTON}
        >
          {isActive ? "Deactivate" : "Activate"}
        </button>
      </div>

      {loginUrl && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={loginUrl}
              aria-label="Login link"
              onFocus={(e) => e.target.select()}
              className={`${FIELD_CLASS} font-mono`}
            />
            <CopyButton value={loginUrl} label="Copy login link" />
          </div>
          <span className="text-caption text-text-muted">
            {"Copy it now, it is not shown again. It works once and expires in 24 hours."}
          </span>
        </div>
      )}

      {error && <span className="text-caption text-danger">{error}</span>}
      {notice && <span className="text-caption text-success">{notice}</span>}
    </div>
  );
}
