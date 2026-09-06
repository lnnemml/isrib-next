# Relaunch announcement email (draft)

> **DRAFT — send only after the promo code is verified on the live site.** Customer-facing
> copy is in English (the store + customer base are international). Notes to Anton are in
> Ukrainian. Compliance: no money-back/guarantee, no medical/therapeutic/cancer/dementia
> claims, research-use framing. Audience: 500+ past customers (212 recent import + ~300 from
> the earlier site). Send via **Resend broadcast** (built-in unsubscribe — this also covers
> the old `/unsubscribe.html` gap). **Test-send to Anton's own inbox first.**

## Gating (must be true before send)
- `db:push` + `seed:promo-code` run against Neon; `RELAUNCH10` active, 10%, expires in 7 days.
- A real test order using `RELAUNCH10` on isrib.shop confirmed the 10% applies + is stored.
- ⚠ The 7-day expiry starts when the code is seeded — **seed and send on the same day**, or the
  window shrinks. If the send slips, re-seed to reset `expiresAt`.

---

## Subject line (pick one — A/B if Resend allows)
- A: "ISRIB.shop has been rebuilt — and there's 10% off to mark it"
- B: "We rebuilt the shop. Faster checkout, accounts, and 10% off this week"
- C: "Your ISRIB.shop just got an upgrade (+ a launch discount inside)"

## Preheader
"One site, one checkout, your order history in one place — plus 10% off for the next 7 days."

---

## Body

Hi {{first_name|there}},

We've rebuilt **ISRIB.shop** from the ground up. Same lab, same in-house synthesis and independent NMR/COA on every batch — but the site around it is new, and a few things are genuinely better for you.

**What's new**

- **One site, one checkout.** Everything now lives on isrib.shop — no more jumping to a separate page to pay. The checkout is faster and cleaner, on desktop and mobile.
- **Your own account.** Create an account with **the same email you've ordered with before** and your full order history — including past orders — will be waiting there. Reordering takes seconds.
- **Refer a friend.** Share your referral link: your friend gets 10% off their first order, and you earn a credit toward your next one.
- **Pay with crypto, save 10%.** BTC, ETH, USDT and XMR are supported, with an automatic 10% discount. Prefer to arrange payment manually? That still works too.
- **The Journal.** We moved our research writing to **isrib.shop/journal** — mechanism deep-dives, honest compound comparisons, and protocol notes, written by the chemist. (Newest piece: what the preclinical research actually shows on the integrated stress response and brain injury.)

**A thank-you for coming back**

Use code **RELAUNCH10** at checkout for **10% off your order** — any payment method. (Paying with crypto already gives you the 10% automatically.) The code is good for **7 days**.

[ Shop now → ] (button → https://isrib.shop/products)

As always: everything we sell is for **research use only**, quality-verified with a Certificate of Analysis per batch, and shipped discreetly worldwide.

Questions? Just reply to this email.

— The ISRIB.shop team

---

## Footer (Resend handles unsubscribe)
- "You're receiving this because you've ordered from ISRIB.shop. Research chemicals for laboratory use only."
- Unsubscribe link — **use Resend's list-managed unsubscribe** (do not hand-roll; this replaces the old `/unsubscribe.html`).

---

## Notes to Anton (UA)
- **Мова:** тіло листа — англійською (клієнти міжнародні, сайт англомовний). Якщо частина ~300 старих клієнтів переважно україно/російськомовні — скажи, зроблю двомовний або окремий сегмент.
- **`{{first_name}}`** — підстав зі списку Resend; fallback "there" якщо імені нема.
- **CTA веде на `/products`.** Можу поміняти на конкретний продукт (A15) або на головну — скажи.
- **Офер чесний до механіки:** промо не стакається з крипто (обидва 10%), тому фраза "crypto already gives you the 10% automatically" — щоб крипто-покупці не думали, що код дасть 20%.
- **Реферальний блок** — лінк у кожного свій (у кабінеті). У листі — загальний заклик; за бажанням можна вставити персональний `?ref` лінк, якщо Resend тягне його зі списку (тоді треба поле).
- **Тест:** спершу broadcast на себе (перевір інбокс-доставляність, {{first_name}}, посилання, unsubscribe), тоді на весь список.
- **Не згадуємо** конкретні хвороби/показання, money-back, назви рецептурних препаратів — свідомо.
