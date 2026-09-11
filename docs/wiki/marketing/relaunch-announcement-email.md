# Relaunch announcement email (draft)

> **DRAFT — rewritten to the [winning-email-formula](../../raw/winning-email-formula.md)**
> (the empirically-verified "lands in Gmail Important" pattern: Email 8 / USA15). Personal
> 1:1 voice from Danylo, not a newsletter. Customer-facing copy is English (international
> base); notes to Anton are Ukrainian. Compliance: no money-back/guarantee, no
> medical/therapeutic/cancer/dementia claims, research-use framing. Audience: 607 past
> customers. **Test-send to Anton's own inbox first.**

## ✅ RESOLVED (2026-09-08): Path B chosen — plain 1:1 send, formula-faithful

Anton chose **Path B**. Built + verifier-APPROVE: a plain `resend.emails.send` loop
(`scripts/send-relaunch.ts`, no `List-Unsubscribe` header), a signed-token unsubscribe
endpoint on the new site (`/api/unsubscribe`, HMAC via `CUSTOMER_AUTH_SECRET`), and
`?promo=RELAUNCH10` auto-apply at checkout (`PromoCapture` → `isrib_promo` cookie). The
original conflict analysis is kept below for the record.

## ⚠ Infrastructure conflict — read before sending (needs Anton's call)

The winning formula was verified on the **OLD** send path (plain `resend.emails.send`, a
plain unsubscribe link, and **deliberately NO `List-Unsubscribe` header** — that header reads
as "bulk" to Gmail and pushes mail out of Important/Primary). The infra we built this session
(ADR 0017) sends via **Resend Broadcasts**, which **always** injects `List-Unsubscribe` +
managed unsubscribe and requires `{{{RESEND_UNSUBSCRIBE_URL}}}`. So the two are at odds:

- **Path A — Resend Broadcast (what we built):** managed unsubscribe + suppression, one click
  to send to the segment. BUT adds `List-Unsubscribe` → **violates the formula** → higher risk
  of Promotions tab instead of Important.
- **Path B — plain 1:1 send (what the formula wants):** best shot at Gmail Important. BUT (1)
  no managed unsubscribe — needs a **plain unsubscribe endpoint on the NEW site** (the old
  `/api/leads?action=unsubscribe` is gone post-cutover); (2) we'd loop `resend.emails.send`
  over 607 (a small builder script). 607/day is under Gmail's 5,000/day bulk threshold, so
  `List-Unsubscribe` is not legally mandatory as long as a working unsubscribe link exists.

**LEAD recommendation:** the whole point of the formula is landing in Important, and this is a
one-time 607-person send — so **Path B** (plain send, formula-faithful) is likely worth it,
but it needs a small unsubscribe endpoint built first. If you'd rather ship now, Path A works
and stays compliant; we just accept the `List-Unsubscribe`/Promotions-tab risk. The copy below
is send-path-agnostic. **Decide the path before we create/send.**

## Gating (must be true before send)
- `seed:promo-code` run against Neon; `RELAUNCH10` active, 10%, expires in 7 days.
- A real test order using `RELAUNCH10` on isrib.shop confirmed the 10% applies + is stored.
- ⚠ The 7-day expiry starts when the code is seeded — **seed and send the same day**, or the
  window shrinks. If the send slips, re-seed to reset `expiresAt`.
- Verify the CTA link auto-applies `?promo=RELAUNCH10` on the NEW site (old site did this via
  `main.js`/localStorage; if the new site doesn't, the code is still stated in the body as a
  fallback the customer types at checkout).

---

## Sender (per formula)
```
from:    Danylo from ISRIB <noreply@isrib.shop>
replyTo: isrib.shop@protonmail.com   // real inbox — strongest Gmail-Important signal
```

## Subject line (pick one — all follow the formula: "{{firstName}}, " + lowercase, no promo words / caps / emoji)
- A (recommended): `{{firstName}}, quick update on the shop`
- B: `{{firstName}}, we rebuilt isrib.shop`
- C: `{{firstName}}, quick heads up`

No preheader (the verified emails used none — keep it looking 1:1, not designed).

---

## Body

Hi {{firstName}},

Quick note — I've rebuilt ISRIB.shop from the ground up. Same lab, same compounds and same independent NMR and COA on every batch; the site's just faster now, and everything including checkout is in one place.

If you've been meaning to reorder, RELAUNCH10 takes 10% off this week — any payment method (crypto already gives you the 10% automatically). Everything's in stock at isrib.shop.

How's everything been since your last order? Happy to talk through anything for your work — just reply here.

Danylo

Unsubscribe

---

## Structural notes (so it matches the formula exactly when built into HTML)
- **One plain hyperlink only:** the words `isrib.shop` →
  `https://isrib.shop/products?promo=RELAUNCH10&utm_source=email&utm_campaign=relaunch_2026&utm_content={{firstName}}`.
  Link style `color:#0ea5e9;text-decoration:none;` — **no button, no `→`, no `font-weight:600`**.
  "the journal" is mentioned in plain text (NOT a second link — single CTA rule).
- **`RELAUNCH10` stays plain text** — never `<strong>`. "this week" (soft), never "valid through <date>".
- **No branded footer** ("Research compounds • Verified COA • Worldwide shipping" etc.). The
  research-use framing is carried lightly by "for your work" in the reply line — no formal
  disclaimer block (that reads as newsletter and hurts Important placement).
- **Reply-invite line** ("How have things been since your last order? … just reply here.") is
  the highest-leverage Important signal — keep it last, before the signature.
- **Unsubscribe:** plain text link, `margin-top:48px`, no surrounding footer. Endpoint depends
  on the send path (see the conflict box): Path A → Resend's `{{{RESEND_UNSUBSCRIBE_URL}}}`;
  Path B → a new-site plain unsubscribe URL with `?email={{email}}`.
- **Placeholders:** copy above uses the formula's `{{firstName}}` / `{{email}}`. If sent via
  Resend Broadcast (Path A), map to `{{{FIRST_NAME|there}}}` and `{{{RESEND_UNSUBSCRIBE_URL}}}`.

---

## Notes to Anton (UA)
- **Ключовий конфлікт** — див. блок "Infrastructure conflict" вгорі: формула вимагає НЕ додавати
  `List-Unsubscribe` (щоб лист виглядав як 1:1 і потрапляв у Important), а Resend Broadcasts його
  додає завжди. Обери шлях **до** створення розсилки. Моя рекомендація — Path B (звичайна
  розсилка `resend.emails.send` по списку, як на старому сайті), але спершу треба зробити просту
  сторінку/endpoint відписки на новому сайті.
- **Мова:** тіло — англійською. Якщо ~частина списку російсько/україномовна — скажи, зроблю окремий сегмент.
- **`{{firstName}}`** fallback "there" (у Resend — `{{{FIRST_NAME|there}}}`).
- **Одне посилання** (isrib.shop із `?promo=RELAUNCH10`), журнал — просто текстом (правило single-CTA).
- **Офер чесний до механіки:** крипто дає 10% автоматично, RELAUNCH10 — ті самі 10% іншим способом
  оплати (не стакається, щоб не думали про 20%).
- **Компресія (v2, 2026-09-08):** тестовий лист (4 абзаци, 6 тем) НЕ потрапив у Important. Стиснув до
  щільності Email 8 (доведений winner): 3 короткі абзаци, ОДНА пропозиція (RELAUNCH10 10%). **Викинув**
  акаунт/історію, реферал, журнал, деталі крипто — це піде окремим листом пізніше (одна ідея на лист = те,
  що спрацювало в Email 8). Одне посилання (isrib.shop із `?promo=RELAUNCH10`), UTM залишив (Email 8 їх мав
  і все одно потрапив у Important → щільність, а не UTM, була проблемою).
- **Технічний фікс (Anton, DNS):** у `isrib.shop` було ДВА SPF-записи → `permerror` (SPF повністю падає).
  Об'єднати в один: `v=spf1 include:amazonses.com include:_spf.resend.com include:spf.efwd.registrar-servers.com ~all`.
  DKIM (Resend) ок, DMARC `p=none` ок. Це головний технічний важіль для доставляльності.
- **Important — це поведінковий, per-recipient сигнал:** холодний self-test погано його показує. Найсильніший
  сигнал — **відповідь** на лист (reply тренує Gmail). Тестувати на 2–3 адреси + відповісти з іншого акаунта.
- **Тест:** спершу на себе (інбокс-таб, {{firstName}}, посилання, відписка), тоді на весь список.
- **Send time:** 8–11am ET (US-heavy list), per formula checklist.
- **Не згадуємо** money-back, конкретні хвороби/показання, назви рецептурних препаратів — свідомо.

---

## Email 2 — follow-up (account + referral) — ✅ SENT 2026-09-11 (Variant B), 599/599, 0 failed

Purpose: surface the **account + referral** that Email 1 deliberately omitted (cramming them
in kept Email 1 out of Important — see log 2026-09-08). Same rules: plain send, tracking OFF,
no `List-Unsubscribe`, reply-invite last. Rides the Important reputation Email 1 built.
Recipients auto-exclude anyone who unsubscribed (`marketing_contacts WHERE unsubscribed_at IS NULL`).

**Send mechanism (built):** `scripts/send-email2.ts` — a Path-B sibling of `send-relaunch.ts`,
SEPARATE resume file `data/email2-sent.json`, single CTA link "an account" → `/account/register`
(UTM `relaunch_email2_2026`). Run: `NEXT_PUBLIC_BASE_URL=https://isrib.shop node --env-file=.env.local
--import tsx scripts/send-email2.ts [--test <addr> | --commit]`.

### Deliverability A/B (2026-09-11) — Variant B won
- **Variant A** (styled HTML, subject "…your account on the new site", copy mentioned "10% off"): cold
  self-test landed **inbox but NOT Important**. (Consistent with [[email-deliverability-playbook]]: Important
  is behavioral/per-recipient — a cold self-test under-shows it; Email 1's Important landing was reply-trained.)
- **Variant B (SHIPPED):** plainer, hand-typed look (dropped the max-width container / background / colored
  CTA → a plain underlined link), subject **"{{firstName}}, one more thing"**, **dropped the "10% off" number**
  (soft referral mention only) to cut the promo-classifier signal. → **3/3 Gmail Important** across three cold
  test addresses. Lesson: for the account/referral follow-up, plainer markup + no promo number beats the styled
  discount version on placement.

**Subject (SENT):** {{firstName}}, one more thing

Hi {{firstName}},

One more thing since I rebuilt the site — there's already an account under the email you ordered with, and your full order history is in it. Set a password once and it's yours.

It's also got a referral link you can pass on if that's ever useful.

How's your work going? Happy to help with anything — just reply.

Danylo

Unsubscribe

- **One link:** the words "an account" → `https://isrib.shop/account/register?...` (register = the "claim your
  waiting account" action for legacy customers; `customerAuth.ts` links their order history + mints a referral code).
- **Landing-page polish (deployed 2026-09-11):** `/account/register` subtitle now reassures returning customers
  their order history will already be there (was a generic "Create account" form).
- **Result:** 599 active · 599 sent · 0 failed (~23 min, throttled, resumable).
- **Possible Email 3:** if we want a single-idea promo push, referral (+ its 10%/credit numbers) could go on its own.

---

## Pre-send checklist for Email 1 (run when sending, evening = US morning, 8–11am ET)
1. `npm run seed:promo-code` (RELAUNCH10, 10%, +7d) — **right before sending** (7-day clock starts at seed).
2. (Recommended, ADR 0016) one real test order on isrib.shop with `RELAUNCH10` → confirm 10% applies + the
   `?promo=RELAUNCH10` auto-apply link works + it's stored.
3. `NEXT_PUBLIC_BASE_URL=https://isrib.shop npm run send:relaunch -- --commit` (607, ~20 min, resumable).
