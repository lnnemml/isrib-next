import { Client } from "@upstash/qstash";

// Best-effort cancellation of the abandoned-checkout nurture messages once an order is
// paid. Only pending (not-yet-delivered) messages can be cancelled; already-delivered or
// unknown ids reject, so each cancel is isolated in Promise.allSettled and never throws.
// The consumer's status==="paid" guard remains the backstop.
export async function cancelAbandonedNurture(
  messageIds: (string | null | undefined)[],
): Promise<void> {
  const ids = messageIds.filter((id): id is string => Boolean(id));
  if (ids.length === 0) return;
  const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
  await Promise.allSettled(ids.map((id) => qstash.messages.cancel(id)));
}
