// Transactional email templates (G2 Step 3). LIGHT brand identity — NOT the lander's
// dark #0D0D12 / amber #E8A427 theme (that was the diverged branch we did not adopt).
// Copy, payment blocks, and warnings are ported VERBATIM from the lander, but adapted to
// (a) our MULTI-ITEM cart and (b) the light palette below.
//
// Email-client-safe rendering rules: table-based layout, inline styles only, no external
// CSS, no flexbox for structural layout (poor Outlook support). Every order-showing
// template renders a shared ITEMS TABLE.
//
// COMPLIANCE: product-agnostic where multi-item ("your order", not "ISRIB A15"); payment
// coordination + shipping logistics copy only; no card fields / Pay-Now / Stripe; no
// efficacy / guarantee / money-back language.

import { getProduct, formatCents } from "@/lib/copy/products";

// ── Palette (light theme) ────────────────────────────────────────────────────
const C = {
  bg: "#ffffff",
  page: "#f8fafc", // subtle page backdrop behind the card
  text: "#0f172a",
  muted: "#475569",
  faint: "#94a3b8",
  brand: "#1e40af", // accent blue
  success: "#059669",
  danger: "#b91c1c", // network-mismatch warning
  hairline: "#e2e8f0",
  cardBg: "#ffffff",
  panelBg: "#f8fafc", // inset panels (payment blocks / items table shell)
} as const;

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// ── Shared line item shape (built from the recomputed order items) ────────────
export interface EmailItem {
  slug: string;
  sizeLabel: string;
  format: "powder" | "capsules";
  quantity: number;
  linePrice: number; // per-UNIT price in cents (matches orderItems.linePrice)
}

// ── Layout wrapper ────────────────────────────────────────────────────────────
// Header wordmark + footer research-use line, so individual templates don't repeat it.
// `preheader` is the hidden inbox-preview snippet.
function layout(innerHtml: string, preheader?: string): string {
  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg};font-size:1px;line-height:1px;">${preheader}</div>`
    : "";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.page};font-family:${FONT};">
  ${preheaderHtml}
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${C.page};padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:${C.cardBg};border-radius:12px;border:1px solid ${C.hairline};overflow:hidden;">
        <tr><td style="padding:28px 32px 20px;border-bottom:1px solid ${C.hairline};">
          <span style="color:${C.brand};font-size:16px;font-weight:700;letter-spacing:-0.01em;">ISRIB Shop</span>
        </td></tr>
        <tr><td style="padding:28px 32px 32px;">
          ${innerHtml}
        </td></tr>
        <tr><td style="padding:18px 32px;border-top:1px solid ${C.hairline};">
          <p style="color:${C.faint};font-size:12px;line-height:1.6;margin:0;">
            Research compounds for laboratory use only.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Money helpers ──────────────────────────────────────────────────────────────
function usd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// ── Items table ────────────────────────────────────────────────────────────────
// One row per line: product name (via getProduct(slug).name) on top, a muted meta line
// (sizeLabel · format · ×qty) beneath, and the extended line total on the right. Then
// subtotal, optional crypto-discount row, and total. All values recomputed server-side.
function itemsTable(items: EmailItem[], subtotalUsd: number, totalUsd: number): string {
  const rows = items
    .map((it) => {
      const product = getProduct(it.slug);
      const name = product?.name ?? it.slug;
      const meta = `${it.sizeLabel} · ${it.format} · ×${it.quantity}`;
      const lineTotal = formatCents(it.linePrice * it.quantity);
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${C.hairline};vertical-align:top;">
            <div style="color:${C.text};font-size:14px;font-weight:600;">${name}</div>
            <div style="color:${C.muted};font-size:12px;margin-top:3px;">${meta}</div>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid ${C.hairline};vertical-align:top;color:${C.text};font-size:14px;font-weight:600;white-space:nowrap;">
            ${lineTotal}
          </td>
        </tr>`;
    })
    .join("");

  const discountUsd = subtotalUsd - totalUsd;
  const discountRow =
    discountUsd > 0.005
      ? `
        <tr>
          <td style="padding:8px 0 4px;color:${C.success};font-size:13px;">Crypto discount</td>
          <td align="right" style="padding:8px 0 4px;color:${C.success};font-size:13px;font-weight:600;white-space:nowrap;">− ${usd(discountUsd)}</td>
        </tr>`
      : "";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${C.panelBg};border:1px solid ${C.hairline};border-radius:8px;padding:6px 18px 14px;margin:0 0 24px;">
      <tr><td colspan="2" style="padding-top:12px;">
        <span style="color:${C.faint};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Your order</span>
      </td></tr>
      ${rows}
      <tr>
        <td style="padding:14px 0 4px;color:${C.muted};font-size:13px;">Subtotal</td>
        <td align="right" style="padding:14px 0 4px;color:${C.text};font-size:13px;font-weight:600;white-space:nowrap;">${usd(subtotalUsd)}</td>
      </tr>
      ${discountRow}
      <tr>
        <td style="padding:6px 0 0;color:${C.text};font-size:15px;font-weight:700;border-top:1px solid ${C.hairline};padding-top:12px;">Total</td>
        <td align="right" style="padding:6px 0 0;color:${C.text};font-size:15px;font-weight:700;border-top:1px solid ${C.hairline};padding-top:12px;white-space:nowrap;">${usd(totalUsd)}</td>
      </tr>
    </table>`;
}

// Reusable primary button (brand blue). Table-wrapped for Outlook.
function button(href: string, label: string): string {
  return `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:4px 0 24px;">
      <tr><td style="border-radius:8px;background:${C.brand};">
        <a href="${href}" style="display:inline-block;padding:13px 30px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;">${label}</a>
      </td></tr>
    </table>`;
}

// Small helper for the section eyebrow + H1 pattern shared by several templates.
function heading(eyebrow: string, eyebrowColor: string, title: string, orderNumber: string): string {
  return `
    <p style="color:${eyebrowColor};font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 14px;">
      ${eyebrow}
    </p>
    <h1 style="color:${C.text};font-size:22px;font-weight:700;line-height:1.3;margin:0 0 6px;">
      ${title}
    </h1>
    <p style="color:${C.muted};font-size:14px;margin:0 0 24px;">
      Order number: <span style="color:${C.text};font-family:'SFMono-Regular',Consolas,monospace;font-weight:600;">${orderNumber}</span>
    </p>`;
}

// ── One payment "block" (labelled panel with a rows table) ────────────────────
function paymentBlock(title: string, badge: string | null, rowsHtml: string, noteHtml: string): string {
  const badgeHtml = badge
    ? `<span style="color:${C.success};font-size:11px;font-weight:700;margin-left:8px;">${badge}</span>`
    : "";
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${C.panelBg};border:1px solid ${C.hairline};border-radius:8px;margin:0 0 12px;">
      <tr><td style="padding:16px 18px;">
        <div style="margin-bottom:10px;">
          <span style="color:${C.text};font-size:14px;font-weight:700;">${title}</span>${badgeHtml}
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size:13px;">
          ${rowsHtml}
        </table>
        ${noteHtml}
      </td></tr>
    </table>`;
}

function payRow(label: string, valueHtml: string, last = false): string {
  const border = last ? "" : `border-bottom:1px solid ${C.hairline};`;
  return `
    <tr>
      <td style="padding:7px 0;${border}color:${C.muted};width:120px;vertical-align:top;">${label}</td>
      <td style="padding:7px 0;${border}vertical-align:top;">${valueHtml}</td>
    </tr>`;
}

// ── Manual-payment blocks (shared) ────────────────────────────────────────────
// PayPal / USDT (TRC-20) / BTC / LTC / "other methods" panels, built once and reused
// by BOTH orderReceivedManual AND abandonedCheckout so the real payment addresses,
// recipient name, and network warnings live in exactly one place (no duplicated
// addresses — funds to a mistyped address are unrecoverable). Amounts and BTC/LTC
// equivalents are passed in; nothing here is hardcoded per-product.
function manualPaymentBlocks(
  orderNumber: string,
  amount: number,
  btcEquivalent?: string,
  ltcEquivalent?: string,
): string {
  // PayPal — RECOMMENDED
  const paypal = paymentBlock(
    "PayPal",
    "RECOMMENDED",
    payRow("Send to", `<span style="color:${C.brand};font-weight:600;">isrib.shop@protonmail.com</span>`) +
      payRow("Recipient name", `<span style="color:${C.text};">Danylo Tsymbaliuk</span>`) +
      payRow("Amount", `<span style="color:${C.text};font-weight:700;">${usd(amount)} USD</span>`) +
      payRow(
        "Note / Reference",
        `<span style="color:${C.brand};font-family:'SFMono-Regular',Consolas,monospace;font-size:12px;">${orderNumber}</span>`,
        true,
      ),
    `<p style="color:${C.muted};font-size:12px;margin:10px 0 0;line-height:1.5;">
       Important: select <strong style="color:${C.text};">"For friends and family"</strong> to avoid fees.
       Include your Order number in the note field.
     </p>`,
  );

  // USDT TRC-20
  const usdt = paymentBlock(
    "USDT (TRC-20)",
    null,
    payRow(
      "Address",
      `<code style="color:${C.brand};font-size:11px;word-break:break-all;">${"TDRnCaDUQQDRsZEQbBtMPKxa7MgHzuW5re"}</code>`,
    ) +
      payRow("Network", `<span style="color:${C.text};">TRON (TRC-20) only</span>`) +
      payRow("Amount", `<span style="color:${C.text};font-weight:700;">${amount.toFixed(2)} USDT</span>`, true),
    `<p style="color:${C.danger};font-size:12px;margin:10px 0 0;">
       ⚠ Send only on TRC-20 network. Sending on wrong network = lost funds.
     </p>`,
  );

  // BTC
  const btcValue = btcEquivalent
    ? `≈ ${btcEquivalent} BTC`
    : `≈ ${usd(amount)} USD equivalent`;
  const btcHint = btcEquivalent
    ? "(rate at time of order — verify before sending)"
    : "(check current BTC rate before sending)";
  const btc = paymentBlock(
    "Bitcoin (BTC)",
    null,
    payRow(
      "Address",
      `<code style="color:${C.brand};font-size:11px;word-break:break-all;">${"bc1q4ujd2mfp6t6lcu3p2vlj4dxzs6rxhzzlcrh07m"}</code>`,
    ) +
      payRow(
        "Amount",
        `<span style="color:${C.text};font-weight:700;">${btcValue}</span>
         <span style="color:${C.faint};font-size:11px;display:block;margin-top:2px;">${btcHint}</span>`,
        true,
      ),
    "",
  );

  // LTC
  const ltcValue = ltcEquivalent
    ? `≈ ${ltcEquivalent} LTC`
    : `≈ ${usd(amount)} USD equivalent`;
  const ltcHint = ltcEquivalent
    ? "(rate at time of order — verify before sending)"
    : "(check current LTC rate before sending)";
  const ltc = paymentBlock(
    "Litecoin (LTC)",
    null,
    payRow(
      "Address",
      `<code style="color:${C.brand};font-size:11px;word-break:break-all;">${"ltc1q27awh06ddvgma7pafsdk3sg5kny8f099zmewk7"}</code>`,
    ) +
      payRow(
        "Amount",
        `<span style="color:${C.text};font-weight:700;">${ltcValue}</span>
         <span style="color:${C.faint};font-size:11px;display:block;margin-top:2px;">${ltcHint}</span>`,
        true,
      ),
    "",
  );

  const otherMethods = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${C.panelBg};border:1px solid ${C.hairline};border-radius:8px;margin:8px 0 20px;">
      <tr><td style="padding:14px 18px;">
        <p style="color:${C.muted};font-size:13px;line-height:1.6;margin:0;">
          Prefer SEPA, SWIFT, or Western Union?
          <a href="mailto:isrib.shop@protonmail.com?subject=Payment method for ${encodeURIComponent(orderNumber)}"
             style="color:${C.brand};text-decoration:none;font-weight:600;">Reply to this email</a>
          and we will arrange the details.
        </p>
      </td></tr>
    </table>`;

  return `${paypal}${usdt}${btc}${ltc}${otherMethods}`;
}

// ════════════════════════════════════════════════════════════════════════════
// 1. orderReceivedManual — manual-transfer instructions (PayPal / USDT / BTC / LTC)
// ════════════════════════════════════════════════════════════════════════════
export function orderReceivedManual({
  firstName,
  orderNumber,
  items,
  subtotalUsd,
  totalUsd,
  btcEquivalent,
  ltcEquivalent,
}: {
  firstName: string;
  orderNumber: string;
  items: EmailItem[];
  subtotalUsd: number;
  totalUsd: number;
  btcEquivalent?: string;
  ltcEquivalent?: string;
}): { subject: string; html: string } {
  const subject = "Your ISRIB Shop order — transfer details inside";
  const amount = totalUsd; // manual path charges the (undiscounted) total

  const closing = `
    <div style="border-top:1px solid ${C.hairline};padding-top:16px;">
      <p style="color:${C.muted};font-size:13px;line-height:1.6;margin:0;">
        After sending, reply with a screenshot or transaction ID to speed up confirmation.
        We ship within 1–3 business days of confirmed payment. Typical delivery: 5–12 business days.
      </p>
    </div>`;

  const inner = `
    ${heading("Order received — awaiting payment", C.brand, `${firstName}, your order is in.`, orderNumber)}
    <p style="color:${C.muted};font-size:15px;line-height:1.7;margin:0 0 22px;">
      Send payment using one of the methods below. Once received, we will confirm and start preparing your order.
    </p>
    ${itemsTable(items, subtotalUsd, totalUsd)}
    ${manualPaymentBlocks(orderNumber, amount, btcEquivalent, ltcEquivalent)}
    ${closing}`;

  return {
    subject,
    html: layout(inner, "Transfer details for your ISRIB Shop order are inside."),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 2. orderReceivedCrypto — hosted-invoice path (send wired in Step 4)
// ════════════════════════════════════════════════════════════════════════════
export function orderReceivedCrypto({
  firstName,
  orderNumber,
  items,
  totalUsd,
  invoiceUrl,
}: {
  firstName: string;
  orderNumber: string;
  items: EmailItem[];
  totalUsd: number;
  invoiceUrl: string;
}): { subject: string; html: string } {
  const subject = "Complete your ISRIB Shop payment";

  // Crypto path total already reflects the discount; subtotal == total here so the
  // items table renders no discount row.
  const inner = `
    ${heading("Order received", C.brand, `${firstName}, your order is placed.`, orderNumber)}
    <p style="color:${C.muted};font-size:15px;line-height:1.7;margin:0 0 22px;">
      Complete your payment using the secure link below. We accept BTC, LTC, USDT and 50+ cryptocurrencies.
    </p>
    ${itemsTable(items, totalUsd, totalUsd)}
    ${button(invoiceUrl, "Complete Payment →")}
    <p style="color:${C.muted};font-size:13px;line-height:1.6;margin:0;">
      Once payment is received, we will send you a link to provide your shipping details.
      We ship within 1–3 business days of confirmed payment. Typical delivery: 5–12 business days.
    </p>`;

  return {
    subject,
    html: layout(inner, "Complete your ISRIB Shop payment."),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 3. opsAlert — internal admin notification
// ════════════════════════════════════════════════════════════════════════════
export function opsAlert({
  orderNumber,
  firstName,
  email,
  country,
  items,
  totalUsd,
  paymentMethod,
  utmSource,
  utmCampaign,
  utmContent,
}: {
  orderNumber: string;
  firstName: string;
  email: string;
  country: string;
  items: EmailItem[];
  totalUsd: number;
  paymentMethod: "crypto" | "manual";
  utmSource?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
}): { subject: string; html: string } {
  const subject = `New order: ${firstName} — $${totalUsd.toFixed(2)} — ${paymentMethod}`;

  const itemsSummary = items
    .map((it) => {
      const name = getProduct(it.slug)?.name ?? it.slug;
      return `${name} — ${it.sizeLabel} · ${it.format} · ×${it.quantity}`;
    })
    .join("<br>");

  function row(label: string, valueHtml: string): string {
    return `
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid ${C.hairline};color:${C.muted};font-size:13px;width:120px;vertical-align:top;">${label}</td>
        <td style="padding:9px 0;border-bottom:1px solid ${C.hairline};color:${C.text};font-size:13px;vertical-align:top;">${valueHtml}</td>
      </tr>`;
  }

  const inner = `
    <p style="color:${C.brand};font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">New order</p>
    <h1 style="color:${C.text};font-size:20px;font-weight:700;margin:0 0 20px;">${orderNumber}</h1>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${row("Name", firstName)}
      ${row("Email", `<a href="mailto:${email}" style="color:${C.brand};text-decoration:none;">${email}</a>`)}
      ${row("Country", country)}
      ${row("Items", itemsSummary)}
      ${row("Total", `<strong style="color:${C.success};">${usd(totalUsd)}</strong>`)}
      ${row("Payment", paymentMethod)}
      ${row("UTM source", utmSource ?? "—")}
      ${row("Campaign", utmCampaign ?? "—")}
      ${row("Creative", utmContent ?? "—")}
    </table>`;

  return {
    subject,
    html: layout(inner, `New order ${orderNumber} — ${usd(totalUsd)}`),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 4. paymentConfirmed — payment received → collect shipping (send wired Step 4)
// ════════════════════════════════════════════════════════════════════════════
export function paymentConfirmed({
  firstName,
  orderNumber,
  shippingUrl,
}: {
  firstName: string;
  orderNumber: string;
  shippingUrl: string; // our /shipping/<token> URL — NOT a mailto
}): { subject: string; html: string } {
  const subject = `${firstName}, payment confirmed — provide your shipping details`;

  const inner = `
    ${heading("✓ Payment received", C.success, `${firstName}, your payment is confirmed.`, orderNumber)}
    <p style="color:${C.muted};font-size:15px;line-height:1.7;margin:0 0 22px;">
      To ship your order, we need your delivery details. Use the secure link below to provide them.
    </p>
    ${button(shippingUrl, "Provide shipping details →")}
    <p style="color:${C.muted};font-size:13px;line-height:1.6;margin:0;">
      We will dispatch your order within 1–3 business days of receiving your shipping details.
      Typical delivery: 5–12 business days depending on your location.
    </p>`;

  return {
    subject,
    html: layout(inner, "Payment confirmed — provide your shipping details."),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 6. shipped — order dispatched, tracking number + carrier (admin saveTracking action)
// ════════════════════════════════════════════════════════════════════════════
// LIGHT theme, reuses layout() + itemsTable(). Fired by the admin panel's saveTracking
// action (ADR 0011 + admin-panel.md §6). COMPLIANCE: shipping-logistics copy only; no
// card fields / Pay-Now / Stripe; no efficacy / guarantee / money-back language.
export function shipped({
  firstName,
  orderNumber,
  items,
  trackingNumber,
  carrier,
}: {
  firstName: string;
  orderNumber: string;
  items: EmailItem[];
  trackingNumber: string;
  carrier: string;
}): { subject: string; html: string } {
  const subject = `Your order ${orderNumber} has shipped`;

  // Prominent tracking block — carrier + tracking number in monospace so the number
  // is unambiguous. Table-wrapped for Outlook.
  const trackingBlock = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${C.panelBg};border:1px solid ${C.hairline};border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:18px 20px;">
        <p style="color:${C.faint};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 12px;">
          Tracking
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size:14px;">
          <tr>
            <td style="padding:7px 0;border-bottom:1px solid ${C.hairline};color:${C.muted};width:130px;vertical-align:top;">Carrier</td>
            <td style="padding:7px 0;border-bottom:1px solid ${C.hairline};color:${C.text};font-weight:600;vertical-align:top;">${carrier}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:${C.muted};width:130px;vertical-align:top;">Tracking number</td>
            <td style="padding:7px 0;vertical-align:top;">
              <span style="color:${C.brand};font-family:'SFMono-Regular',Consolas,monospace;font-size:15px;font-weight:700;word-break:break-all;">${trackingNumber}</span>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>`;

  // Items table: recompute the order total from the line items (per-unit × qty) so the
  // subtotal/total rows are accurate. subtotal == total (no discount row) — this email is
  // post-payment and simply shows the order contents for reference.
  const orderTotalUsd =
    items.reduce((sum, it) => sum + it.linePrice * it.quantity, 0) / 100;
  const inner = `
    ${heading("✓ Shipped", C.success, `${firstName}, your order is on its way.`, orderNumber)}
    <p style="color:${C.muted};font-size:15px;line-height:1.7;margin:0 0 22px;">
      Your order has been dispatched. Use the tracking details below to follow its progress.
    </p>
    ${itemsTable(items, orderTotalUsd, orderTotalUsd)}
    ${trackingBlock}
    <p style="color:${C.muted};font-size:13px;line-height:1.6;margin:0;">
      Delivery typically 5–12 business days depending on your location.
    </p>`;

  return {
    subject,
    html: layout(inner, `Your order ${orderNumber} has shipped.`),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 5. abandonedCheckout — delayed nurture for an unpaid order (QStash T+2h / T+24h)
// ════════════════════════════════════════════════════════════════════════════
// Two variants keyed by emailNumber. Ported from the lander's abandoned-checkout.ts
// but generalized to our MULTI-ITEM cart (renders the shared itemsTable — no hardcoded
// "ISRIB A15") and re-skinned to the light theme. Reuses layout(), itemsTable() and
// the shared manualPaymentBlocks() — same addresses/warnings as the confirmation email.
// COMPLIANCE: payment-coordination copy only; no card fields / Pay-Now / Stripe; no
// efficacy / guarantee / money-back language.
export function abandonedCheckout({
  firstName,
  orderNumber,
  items,
  totalUsd,
  paymentMethod,
  invoiceUrl,
  emailNumber,
  btcEquivalent,
  ltcEquivalent,
}: {
  firstName: string;
  orderNumber: string;
  items: EmailItem[];
  totalUsd: number;
  paymentMethod: "crypto" | "manual";
  invoiceUrl?: string | null;
  emailNumber: 1 | 2;
  btcEquivalent?: string;
  ltcEquivalent?: string;
}): { subject: string; html: string } {
  const subject =
    emailNumber === 1
      ? `${firstName}, your order is still waiting`
      : `Last reminder — order ${orderNumber}`;

  const intro =
    emailNumber === 1
      ? "You placed an order a few hours ago but we haven't received payment yet."
      : "This is a final reminder about your pending order.";

  const eyebrow = emailNumber === 1 ? "Reminder — payment pending" : "Final reminder";

  // Payment section: crypto orders with a live invoice get the "Complete crypto
  // payment" button first, then the manual fallback; everyone else gets just the
  // manual blocks. Same shared blocks either way.
  const manualBlocks = manualPaymentBlocks(orderNumber, totalUsd, btcEquivalent, ltcEquivalent);
  const paymentSection =
    paymentMethod === "crypto" && invoiceUrl
      ? `
        <p style="color:${C.muted};font-size:15px;line-height:1.7;margin:0 0 16px;">
          Your crypto payment invoice is still active:
        </p>
        ${button(invoiceUrl, "Complete crypto payment →")}
        <p style="color:${C.faint};font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 12px;">
          Or pay manually — no login required
        </p>
        ${manualBlocks}`
      : `
        <p style="color:${C.muted};font-size:15px;line-height:1.7;margin:0 0 20px;">
          Send payment using any of the methods below:
        </p>
        ${manualBlocks}`;

  const closing = `
    <div style="border-top:1px solid ${C.hairline};padding-top:16px;">
      <p style="color:${C.muted};font-size:13px;line-height:1.6;margin:0;">
        Had a question or changed your mind? Just reply — we respond within a few hours.
      </p>
    </div>`;

  const inner = `
    ${heading(eyebrow, C.brand, `${firstName}, ${intro}`, orderNumber)}
    ${itemsTable(items, totalUsd, totalUsd)}
    ${paymentSection}
    ${closing}`;

  return {
    subject,
    html: layout(inner, intro),
  };
}
