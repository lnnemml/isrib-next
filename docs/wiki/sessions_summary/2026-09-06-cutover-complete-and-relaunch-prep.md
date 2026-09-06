# Session summary — 2026-09-06 · Cutover complete + relaunch prep

> Long multi-part session. Shipped storefront UI polish → **completed the blue-green cutover**
> (isrib.shop now serves the new app; G2 checkout verified live) → **migrated the
> isrib-research.com journal domain** (301s live; wrote the TBI article that closed the last
> /journal 404) → **built a launch promo-code feature** (ADR 0016, verifier-approved) → drafted
> the **relaunch announcement email**. Email send **deferred to 2026-09-07** (Sunday timing +
> inbox-deliverability work needed). Anton has run `db:push` (promo_codes table live in Neon);
> the promo code is **not yet seeded, committed, or deployed**.

## 1. Storefront UI polish (all committed + deployed by Anton behind the session)
- Removed the `≥98% HPLC` badge from the home ¹H NMR proof card (`HomeAbout.tsx`).
- Checkout copy: Card option → "No card checkout at this time." + removed "by design" from both
  checkout helper branches (`PaymentSelector.tsx`, `checkout/page.tsx`).
- Whole `ProductCard` is now clickable → `/products/{slug}` (onClick + `stopPropagation` guards on
  select / Add-to-cart / links).
- New home **"The Journal" teaser section** (`HomeJournal.tsx`) from `docs/raw/Premium_UI.pdf`, rebuilt
  in our light DS; curated 3 pillar cards + wide Blog card, real MDX frontmatter, links to `/journal/*`.
- **Dark blue-black footer** (`bg-surface-inverse` slate-900) so it stands out.
- **Favicon + icons** copied from the legacy site → `app/favicon.ico` + `icon.png` + `apple-icon.png`.
- **Header logo lockup** (blue→cyan hexagon + "ISRIB.shop" wordmark) from the legacy site, replacing the
  text brand (`Header.tsx`, `public/images/logo.png`).
- **Legacy isrib.shop 301 map** — 27 host-agnostic redirects in `next.config.ts` (all old `.html`,
  `product_*.html`, old vercel.json paths, checkout/buy/success → new slugs), live on prod (verified 308).

## 2. Cutover — COMPLETE ✅ (ADR 0004 blue-green)
- `isrib.shop` (apex) now serves the new Vercel project; **G2 checkout verified live E2E by Anton —
  BOTH manual and crypto** (IPN → paid → confirmation email → shipping form).
- **Crypto webhook bug found + fixed:** the NowPayments IPN POST to the non-www callback was hitting a
  **308 apex→www redirect** (Vercel had www as primary) → the webhook never ran (no paid status, no
  confirmation email, shipping form stuck). Fix: flipped the Vercel Domains canonical so **`isrib.shop`
  (apex) is primary and `www` → 308 → apex** — matches `NEXT_PUBLIC_BASE_URL`, sitemap/robots/journal
  canonical, and the old site (all non-www). No code/redeploy needed. Memory:
  [[nowpayments-ipn-callback-must-match-canonical-host]].
- Related lesson: `NEXT_PUBLIC_BASE_URL` is **build-time-inlined** — changing it in Vercel needs a
  redeploy. Memory: [[next-public-base-url-build-time-inlined]].
- Success page now **auto-reveals** the shipping link once the webhook confirms payment (added
  `PaymentConfirmationPoller`, `router.refresh()` while confirming) — security gate unchanged.

## 3. Journal domain migration — COMPLETE ✅
- `isrib-research.com` added to the Vercel project; host-gated 301s now fire and land correctly
  (`/compare/isrib-vs-modafinil` → `isrib.shop/journal/compare/isrib-vs-modafinil`, etc. — verified 308).
  `www.isrib-research.com` → 308 → apex.
- **TBI article written** (`content/journal/tbi/isrib-traumatic-brain-injury-research.mdx`) — replaced the
  placeholder stub, closing the last `/journal` 404. Sourced from real PubMed papers (Chou 2017 PNAS,
  Krukowski 2020 J Neurotrauma, Frias 2022 PNAS, Ilyin 2024 Brain Research). Honest-skeptic + research-use
  framing; no dementia/cancer/medical claims; explicitly states no human trials. `tbi` cluster card enabled.
  Verifier not needed — LEAD runtime-verified render (ResearchCallouts + CTA/Related/AuthorBio). **Uncommitted /
  undeployed → prod `isrib.shop/journal/tbi/...` still 404 until commit+deploy** (the isrib-research.com/tbi
  301 lands there).

## 4. Launch promo-code feature — BUILT + verifier-APPROVE (ADR 0016)
- The relaunch email needed a real incentive; the `orders.promo_code` column was dormant. Built it
  end-to-end: `promo_codes` table, `src/lib/promo.ts`, `computeEffectiveDiscount` generalised to
  `max()` (byte-identical when no promo), `/api/promo/validate`, checkout promo field + preview,
  `submitOrder` server-validates + stores + atomically increments redemption in the tx,
  `scripts/seed-promo-code.ts` + `seed:promo-code`.
- **Decisions (Anton):** 10% off, 7-day expiry, unlimited redemptions (tracked); **non-stacking = best
  single discount** (max of crypto/referral/reward/promo). Neutral for crypto orders (both 10%); real
  benefit is manual-pay buyers. Default code `RELAUNCH10`.
- **Verifier APPROVE** — no-promo path byte-identical; **normal checkout never queries `promo_codes`**
  (null short-circuits before SQL → safe pre-deploy); server-authoritative; non-stacking correct; atomic
  increment; compliant/additive. `tsc` + `next build` green.

## 5. Relaunch email — DRAFTED, send deferred to 2026-09-07
- Draft: [`../marketing/relaunch-announcement-email.md`](../marketing/relaunch-announcement-email.md).
  English body (international customers), 3 subject options, highlights (one-site/checkout, account+history,
  referral, crypto+code, journal), `RELAUNCH10` offer, Resend-managed unsubscribe. Audience: 500+ (212
  recent import + ~300 from the earlier site).
- **Deferred because:** Sunday (low engagement) + the email needs deliverability work to reliably land in
  the primary/important inbox (Anton's call).

## Current gate state (what's done vs pending)
- ✅ `db:push` run — `promo_codes` table exists in Neon (Anton, this session).
- ⏳ **NOT yet:** `seed:promo-code` (do it tomorrow right before send — the 7-day window starts at seed);
  commit + deploy the promo feature + TBI article; a real test order with `RELAUNCH10` on live; email test-send
  → send.

## Ordered next steps (for 2026-09-07)
1. Work on email deliverability (SPF/DKIM/DMARC, warm-up, content, Resend broadcast setup) — get into the
   primary inbox.
2. **Commit scoping:** commit the promo feature + TBI article + docs SEPARATELY from Anton's in-progress
   `PasswordInput` WIP (login/register/reset forms + `AccountWidget` + `ui/index.ts` are uncommitted, half-done).
3. Deploy (with `db:push` already done — correct order).
4. `seed:promo-code` (RELAUNCH10, 10%, +7d) → **real test order with the code** on isrib.shop (confirm 10% +
   stored + non-stacking).
5. Resend: test-send to Anton → send to the 500+ list.
6. Residual post-cutover ops: monitor orders/emails/analytics; keep old deploy ≥7 days as rollback; confirm
   `isrib-a15.com` → 301 to isrib.shop; un-pause ads after 3–4 day stabilisation.

## Uncommitted at session end
- Mine (commit together): `content/journal/tbi/*`, `src/app/(journal)/journal/page.tsx`, promo-feature files
  (`schema.ts`, `promo.ts`, `referral.ts`, `api/promo/validate/route.ts`, `checkout/page.tsx`,
  `submitOrder.ts`, `scripts/seed-promo-code.ts`, `package.json`), `docs/wiki/*` (log, index, ADR 0016,
  email draft, this summary).
- **Anton's WIP (do NOT bundle):** `PasswordInput.tsx` + login/register/reset forms + `AccountWidget.tsx` +
  `ui/index.ts` — half-done password-input work.

## Related
- ADRs: [0004](../decisions/0004-blue-green-cutover.md) · [0014](../decisions/0014-referral-discount.md) ·
  [0015](../decisions/0015-journal-migration-and-organic-growth.md) · [0016](../decisions/0016-launch-promo-codes.md)
- [`../architecture/track-a-runbook.md`](../architecture/track-a-runbook.md) (cutover checklist) ·
  [`../marketing/relaunch-announcement-email.md`](../marketing/relaunch-announcement-email.md) · [`../log.md`](../log.md)
