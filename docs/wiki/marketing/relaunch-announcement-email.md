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

Quick update — I've spent the last while rebuilding ISRIB.shop from the ground up. Same lab, same in-house synthesis, same independent NMR and COA on every batch. The site around it is just faster and cleaner now, and everything, checkout included, lives in one place.

A couple of things that might be handy: you can make an account with the same email you've ordered with before, and your full order history is already sitting there. Paying with crypto now takes 10% off automatically, and if you'd rather pay another way, RELAUNCH10 gets you the same 10% this week. Your account also has a referral link — your friend gets a discount on their first order, and you earn a credit toward your next.

Everything's in stock at isrib.shop, and the journal there now collects my research writing — mechanism notes and honest compound comparisons.

How have things been since your last order? Happy to talk through anything for your work — just reply here.

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
- **Компресія:** свідомо викинув марковані списки/кнопку/футер зі старого драфту — формула вимагає
  короткий особистий лист (3–4 абзаци), а не newsletter. Реферал — одне коротке речення в абзаці про
  акаунт (без окремого CTA/лінка, щоб зберегти правило single-CTA). Тон стерильний: прибрав
  "written by me rather than a marketer".
- **Тест:** спершу на себе (інбокс-таб, {{firstName}}, посилання, відписка), тоді на весь список.
- **Send time:** 8–11am ET (US-heavy list), per formula checklist.
- **Не згадуємо** money-back, конкретні хвороби/показання, назви рецептурних препаратів — свідомо.
