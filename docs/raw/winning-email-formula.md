# Winning Email Formula — isrib.shop

Verified by: Email 8 (Independence Day, USA15) — landed in Gmail Important.

---

## Sender config

```javascript
from:    'Danylo from ISRIB <noreply@isrib.shop>'
replyTo: 'isrib.shop@protonmail.com'   // real inbox — strongest Gmail Important signal
```

- `replyTo` must point to a real inbox that accepts replies
- Never use `noreply@` as `replyTo`
- Never add `List-Unsubscribe` header — intentional

---

## Subject line

```
{{firstName}}, [lowercase conversational phrase]
```

**Rules:**
- Always starts with `{{firstName}},`
- Lowercase after the comma
- No exclamation marks
- No CAPS
- No emoji
- No promotional words (sale, off, discount, limited, urgent)
- Examples that work: `happy 4th` · `quick heads up` · `quick note` · `product update`

---

## HTML structure

```html
<body style="background:#ffffff;">
  <div style="max-width:600px;margin:40px auto;padding:0 20px;">

    <p>Hi {{firstName}},</p>

    <!-- 2–3 short paragraphs -->
    <!-- plain link, no button, no arrow, no bold weight -->

    <p>Danylo</p>

    <p style="margin-top:48px;">
      <a href="unsubscribe URL">Unsubscribe</a>
    </p>

  </div>
</body>
```

---

## Body copy rules

**Do:**
- 3–4 short paragraphs max
- One plain hyperlink for the CTA — no button, no `→`, no `font-weight:600`
- End with a personal question that invites a reply — this is the highest-leverage Gmail Important signal
- Reference "your last order" or similar — signals 1:1 not broadcast
- Promo code mentioned in plain text inline, not in `<strong>` tags

**Don't:**
- No branded footer ("Research compounds • Verified COA • Worldwide shipping") — newsletter pattern
- No `<strong>` on promo codes or deadlines
- No "valid through [date]" phrasing — promotional signal
- No "Shop [product name]" as link text — use plain URL or short verb
- No social icons, product images, or decorative elements
- No multiple CTAs

---

## The reply-invite line

Always include a line at the end that opens a door for reply:

```
How's everything been going since your last order? Happy to answer anything — just reply here.
```

Adapt the wording per campaign but keep the pattern:
- Reference past interaction ("since your last order", "since you tried it")
- Express genuine availability ("happy to answer anything")
- Explicit reply invitation ("just reply here")

Gmail trains on replies. One reply from this list = that sender gets promoted to Important for that recipient permanently.

---

## Promo code CTA format

```html
<p>
  <a href="https://isrib.shop/products.html?promo=USA15&utm_source=email&utm_campaign=CAMPAIGN_ID&utm_content={{firstName}}"
     style="color:#0ea5e9;text-decoration:none;">isrib.shop</a>
</p>
```

- `?promo=CODE` triggers auto-apply in `main.js` via `localStorage`
- UTM always: `utm_source=email`, `utm_campaign=slug`, `utm_content={{firstName}}`
- Link text: plain domain or short phrase — never "Shop X" or "Buy now"

---

## Placeholder syntax

| Placeholder | Used for |
|---|---|
| `{{firstName}}` | Personalized name in subject + body |
| `{{email}}` | Unsubscribe URL only |

`firstName === 'subscriber'` → replaced with `'there'` by `personalizeEmail()` automatically.

---

## Unsubscribe

```html
<p style="color:#94a3b8;font-size:12px;margin:0;margin-top:48px;">
  <a href="https://isrib.shop/api/leads?action=unsubscribe&email={{email}}"
     style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a>
</p>
```

- Plain text link only, never a button
- `margin-top:48px` — visually separated from signature
- No surrounding footer block, no other text around it

---

## Adding a new campaign

**3 files to touch, in this order:**

1. `api/send-campaign.js` — add new key to `TEMPLATES` + add ID to validation array
2. `js/main.js` — add promo code to `PROMO_CODES` (if new code)
3. `api/checkout.js` — add same promo code to `PROMO_CODES` in `validatePromoCode()`
4. `campaign.html` — add `<option>` to dropdown + entry to `templateDescriptions`

**Never forget:** bump `?v=N` cache buster on all HTML files that load `main.js` after any change to it.

---

## Gmail Important checklist

```
✅ replyTo set to isrib.shop@protonmail.com
✅ Subject: conversational, no promo words, no caps
✅ No branded footer
✅ No <strong> on promo/deadline
✅ No newsletter formatting (→ arrow, bold CTA, button)
✅ Reply-invite line in body
✅ No List-Unsubscribe header
✅ Send time: 8–11am ET for US-heavy list
```
