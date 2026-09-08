# Session summary — 2026-09-08 · Email-campaign infra, relaunch SENT, shipping hotfix

> Long build+ops session. Started from "port the old `batch-splitter.html` / `campaign.html`
> to send the relaunch email" and ended with the **relaunch email actually sent to all 607
> customers (0 failed), landing in Gmail Important**. Along the way: built the email-campaign
> infrastructure (ADR 0017), consolidated the fragmented customer list into Neon + recovered
> opt-outs, backfilled 3 September orders + added a $10/order shipping-cost BI metric (ADR
> 0018), iterated the email to land in Important, and shipped a critical order-flow hotfix
> (admin email on shipping submit). Everything committed to `main`; deploys live.

## 1. Email-campaign infrastructure — ADR 0017
- Superseded a faithful port of the old vanilla tools with the **deliverability-correct**
  approach: **Resend + a Neon marketing list**, admin-gated. Batch-splitter retired (609 <
  Resend's 1000/batch).
- Built: **`marketing_contacts`** table (kept SEPARATE from the `customers` LTV/BI anchor so
  never-ordered leads don't pollute metrics); scripts `export-legacy-unsubscribes`,
  `consolidate-marketing-list`, `sync-resend-audience`; **`/admin/campaigns`** page (list
  health + dynamic broadcasts list + send-test/send-broadcast), gated by the existing admin
  session (ADR 0011). Verifier-APPROVE.

## 2. List consolidation + opt-out recovery
- **Fragmented list:** Neon `customers` 213 + legacy `customers.json` 555 (396 net-new) →
  **609 union**. Consolidated into `marketing_contacts`, synced **605 active** to the Resend
  "General" segment (later 607 after the September adds).
- **Opt-out forensics:** the old `unsub:*` Upstash store was EMPTY; real opt-outs lived in the
  old Neon `leads` table (newsletter leads, a different population) — Anton's call: **skip that
  list**, honor only the 1 overlapping buyer opt-out (`dave_far_away@hotmail.com`) + 5 Resend
  hard-bounces. Caught + fixed a leak where `dave` synced active (consolidate ran with an empty
  opt-out file) → re-stamped + Resend-suppressed. **Lesson saved to memory:** the sync is
  one-directional — opt-outs found after a sync need manual Resend suppression.

## 3. September orders + $10 shipping-cost BI — ADR 0018
- Backfilled 3 real Sep-2026 orders (from `~/Downloads/september.xlsx`) ADDITIVELY into
  `legacy_orders` + `customers` + `marketing_contacts` + Resend — via a new idempotent
  `import-september-orders.ts` (NOT the destructive full importer; new customers tagged
  `source="legacy-sep2026"` to dodge the `delete where source='legacy'` landmine).
  `ahim@inbox.lv` was an existing customer → promoted client→regular. legacy_orders 223→**226**.
- **$10/order shipping cost** as a computed BI metric (`SHIPPING_COST_CENTS`, `lifetimeShipping()`):
  admin panel now shows Lifetime orders / revenue / **Shipping cost** / **Net after shipping**
  across all legacy + paid-live orders. No schema change. (`amount_cents` treated as the
  profit basis — margin ≈ full price on these compounds.) Current: 226 orders · $44,767.75 ·
  −$2,260 shipping · **$42,507.75 net**. Verifier-APPROVE.

## 4. Relaunch email — REWRITTEN, deliverability-tuned, and SENT ✅
- **Copy:** rewritten to `docs/raw/winning-email-formula.md` (empirically "lands in Gmail
  Important"). First cut (6 topics) missed Important; **stripped to Email-8 density** — 3 short
  paragraphs, ONE offer (RELAUNCH10), reply-invite. Account/referral/journal deferred to Email 2.
- **Send path = Path B** (Anton's call): plain `resend.emails.send` loop
  (`scripts/send-relaunch.ts`), **no `List-Unsubscribe`** (the header reads as bulk). Built a
  signed-token **plain unsubscribe endpoint** on the new site (`/api/unsubscribe`, HMAC via
  `CUSTOMER_AUTH_SECRET`) since the old `/api/leads` is gone post-cutover. Plus **`?promo=`
  auto-apply** at checkout (`PromoCapture` → `isrib_promo` cookie). Verifier-APPROVE.
- **Deliverability iteration:** mail-tester showed all auth PASS (SPF/DKIM/DMARC — the
  isrib.shop duplicate SPF is a NON-issue, DMARC aligns via DKIM). Root bulk-signal found +
  fixed: **disabled Resend click/open tracking** (links were being rewritten through
  `resend-links.com`). Kept the protonmail reply-to (proven Important signal, Anton's call).
  → **Verified landing in Gmail Important.** Playbook saved to memory.
- **SENT (scheduled ~19:38 EEST):** pre-flight all green (deploy live, RELAUNCH10 seeded +
  validated 10%) → **607 sent / 0 skipped / 0 failed.** Two auto-mode permission stops (seed +
  send) were the safety layer; Anton seeded + explicitly authorized the send.

## 5. Shipping → admin email HOTFIX
- Gap: submitting the post-payment shipping form notified no one (Anton hand-copied from the
  DB). Fixed: `submitShipping.ts` now emails admin the **full order + full shipping + line
  items** (new `shippingReceivedAdmin` template). Best-effort (own try/catch, before redirect)
  so a mail failure never errors the customer. Verifier-APPROVE. **Deployed** (confirmed live).

## Current state (what's live / done)
- ✅ Relaunch email delivered to 607; RELAUNCH10 active (7-day window started 2026-09-08).
- ✅ `/admin/campaigns` + shipping/net BI cards + `/api/unsubscribe` + `?promo=` auto-apply +
  shipping→admin email — all committed to `main` and deployed.
- ✅ marketing_contacts = 611 (607 active); Resend segment synced; tracking off on isrib.shop.

## Next steps
1. **Monitor:** opens/replies (replies train Important + land at `isrib.shop@protonmail.com`),
   orders + `RELAUNCH10` redemptions (admin panel). Watch for unsubscribes.
2. **Email 2** (account + referral follow-up) in **~4–5 days** — drafted in
   `marketing/relaunch-announcement-email.md`; needs its own template + `data/email2-sent.json`
   resume file (the send script currently hardcodes Email 1).
3. Residual: the order that came in just before the hotfix won't have auto-emailed — pull
   manually if still needed.

## Commits (all on `main`)
`bf29307` campaign infra + marketing list (0017) + shipping BI + Sep orders (0018) ·
`4c09fd2` Path-B send + promo auto-apply + unsubscribe endpoint · `61b072f` stripped email copy ·
`a3b7c0f` Email 2 draft + pre-send checklist · `6d75b57` shipping→admin hotfix ·
`3593c5e` relaunch-sent log.

## Related
- ADRs: [0017](../decisions/0017-email-campaign-broadcasts-and-marketing-list.md) ·
  [0018](../decisions/0018-shipping-cost-and-september-orders.md)
- [`../marketing/relaunch-announcement-email.md`](../marketing/relaunch-announcement-email.md) ·
  [`../../raw/winning-email-formula.md`](../../raw/winning-email-formula.md) · [`../log.md`](../log.md)
- Memories: email-deliverability-playbook · resend-audience-sync-one-directional

## Roles run (session)
LEAD (architecture, recon, Neon/Resend probing, mail-tester + browser verify, ADRs 0017/0018,
copy, orchestration, scheduled send) → implementer ×6 → verifier ×4 (all APPROVE).
