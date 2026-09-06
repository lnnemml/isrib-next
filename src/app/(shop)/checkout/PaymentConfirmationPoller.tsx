"use client";

// Polls via router.refresh() only while the crypto payment is confirming; the server render
// re-reads Neon and reveals the shipping link once status flips to paid — the reveal gate is
// unchanged and server-side. This client component only removes the manual-refresh/email wait.

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface PaymentConfirmationPollerProps {
  intervalMs?: number;
  maxAttempts?: number;
}

export function PaymentConfirmationPoller({
  intervalMs = 4000,
  maxAttempts = 45,
}: PaymentConfirmationPollerProps) {
  const router = useRouter();
  const attemptsRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      attemptsRef.current += 1;
      if (attemptsRef.current >= maxAttempts) {
        clearInterval(id);
        return;
      }
      router.refresh();
    }, intervalMs);

    return () => clearInterval(id);
  }, [router, intervalMs, maxAttempts]);

  return null;
}
