import { pgTable, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment_instructions",
  "awaiting_payment",
  "paid",
  "fulfilled",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "crypto",
  "manual",
]);

export const itemFormatEnum = pgEnum("item_format", [
  "powder",
  "capsules",
]);

// ADR 0012 — regular = 2+ orders · client = 1 · lead = 0 (never purchased)
export const clientTypeEnum = pgEnum("client_type", [
  "regular",
  "client",
  "lead",
]);

// ADR 0014 — lifecycle of a referrer reward credit in the discount ledger
export const discountLedgerStatusEnum = pgEnum("discount_ledger_status", [
  "available",
  "redeemed",
  "expired",
]);

// ── orders ─────────────────────────────────────────────────────────────────

export const orders = pgTable("orders", {
  id:                       text("id").primaryKey(),          // nanoid
  createdAt:                timestamp("created_at").defaultNow().notNull(),
  status:                   orderStatusEnum("status").default("pending_payment_instructions").notNull(),

  // customer
  name:                     text("name").notNull(),
  email:                    text("email").notNull(),
  phone:                    text("phone"),                     // ADR 0010 — collected post-payment

  // shipping — address fields collected post-payment now, not at checkout (ADR 0010)
  address:                  text("address"),                   // ADR 0010 — nullable, collected post-payment
  city:                     text("city"),                      // ADR 0010 — nullable, collected post-payment
  postalCode:               text("postal_code"),               // ADR 0010 — nullable, collected post-payment
  stateRegion:              text("state_region"),
  country:                  text("country").notNull(),

  // ADR 0010 — post-payment shipping
  shippingToken:            text("shipping_token").notNull().unique(), // unguessable per-order nanoid; the /shipping/<token> link uses this, never the guessable order_number
  shippingDetailsAt:        timestamp("shipping_details_at"),   // stamped when the post-payment shipping form is submitted

  // payment
  paymentMethod:            paymentMethodEnum("payment_method").notNull(),
  cryptoDiscountPct:        integer("crypto_discount_pct"),   // 10 when crypto

  // money — integer cents
  subtotalPrice:            integer("subtotal_price").notNull(), // sum of line prices
  totalPrice:               integer("total_price").notNull(),    // after crypto discount

  // optional
  promoCode:                text("promo_code"),
  note:                     text("note"),

  // ADR 0014 — referral
  referralCodeUsed:         text("referral_code_used"),         // snapshot of the code the referee used (attribution)
  referredByCustomerId:     text("referred_by_customer_id"),    // the referrer's customer id (drives reward-on-paid)
  discountLedgerId:         text("discount_ledger_id"),         // nullable; set when a referrer credit was redeemed on THIS order

  // nowpayments (crypto path only)
  nowpaymentsInvoiceId:     text("nowpayments_invoice_id"),
  nowpaymentsPaymentUrl:    text("nowpayments_payment_url"),

  // order number — human-readable, generated server-side
  orderNumber:              text("order_number").notNull().unique(),

  // idempotency — client-generated per checkout attempt; dedupes double-submit (ADR 0009)
  idempotencyKey:           text("idempotency_key").notNull().unique(),

  // email state — actually stamped (unlike NORA; ADR 0009)
  confirmationEmailSentAt:  timestamp("confirmation_email_sent_at"),

  // nurture state machine — stamped by the QStash consumer on successful send
  abandonedEmail1SentAt:    timestamp("abandoned_email1_sent_at"),
  abandonedEmail2SentAt:    timestamp("abandoned_email2_sent_at"),
  // QStash message ids for the two nurture reminders — used to actively cancel them on payment
  qstashMessageId1:         text("qstash_message_id_1"),
  qstashMessageId2:         text("qstash_message_id_2"),

  // ADR 0011 — fulfillment / admin panel
  trackingNumber:           text("tracking_number"),
  trackingCarrier:          text("tracking_carrier"),
  shippedAt:                timestamp("shipped_at"),

  // account link — nullable, guest checkout supported.
  // Track B: FK → users.id (users table lands in Track B; no foreign key yet)
  userId:                   text("user_id"),

  // UTM tracking
  utmSource:                text("utm_source"),
  utmMedium:                text("utm_medium"),
  utmCampaign:              text("utm_campaign"),
  utmContent:               text("utm_content"),
  utmTerm:                  text("utm_term"),

  // derived from UTM — "paid" | "referral" | "direct"
  trafficType:              text("traffic_type"),

  // analytics — shared browser↔CAPI dedup id (ADR 0005). Nullable/additive: the client
  // mints it per checkout attempt and passes it to both the Pixel order_submitted and the
  // server action; the NowPayments webhook reuses it for the order_confirmed Purchase dedup.
  eventId:                  text("event_id"),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

// ── order_items ────────────────────────────────────────────────────────────

export const orderItems = pgTable("order_items", {
  id:           text("id").primaryKey(),          // nanoid
  orderId:      text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productSlug:  text("product_slug").notNull(),
  format:       itemFormatEnum("format").notNull(),
  quantity:     integer("quantity").notNull(),
  sizeLabel:    text("size_label").notNull(),     // e.g. "2g", "50 × 20mg"
  linePrice:    integer("line_price").notNull(),  // cents
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// ── customers ────────────────────────────────────────────────────────────────
// ADR 0012 — legacy import + email-keyed aggregation anchor for LTV/repeat.
// Quarantined from the live checkout path; joined to orders by email for now.

export const customers = pgTable("customers", {
  id:              text("id").primaryKey(),          // nanoid
  email:           text("email").notNull().unique(),
  name:            text("name").notNull(),
  country:         text("country"),                  // nullable — some rows lack it
  clientType:      clientTypeEnum("client_type").notNull(),
  firstOrderAt:    timestamp("first_order_at"),      // nullable
  legacySheetUrl:  text("legacy_sheet_url"),         // per-client Google Sheet link
  source:          text("source").notNull().default("legacy"),
  passwordHash:    text("password_hash"),            // ADR 0013 — nullable: legacy/guest rows have no password until they register.
  emailVerifiedAt: timestamp("email_verified_at"),   // ADR 0013 — set when the customer verifies their email; login is blocked until non-null.
  referralCode:    text("referral_code").unique(),   // ADR 0014 — personal referral code (REF-XXXXXX). Nullable until generated/backfilled; unique allows multiple NULLs in Postgres.
  createdAt:       timestamp("created_at").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

// ── marketing_contacts ─────────────────────────────────────────────────────────
// ADR 0017 — canonical newsletter/broadcast list. Deliberately SEPARATE from
// `customers` (the NOT-NULL name/clientType LTV/BI anchor, ADR 0012) so never-ordered
// marketing leads never pollute repeat/LTV metrics. Deduped union of customers + the
// legacy customers.json export; Resend mirrors this and owns unsubscribe status after send.
export const marketingContacts = pgTable("marketing_contacts", {
  id:             text("id").primaryKey(),        // nanoid
  email:          text("email").notNull().unique(),   // always stored lowercased/trimmed
  firstName:      text("first_name"),             // nullable
  source:         text("source").notNull(),       // "customers" | "legacy-json"
  unsubscribedAt: timestamp("unsubscribed_at"),   // nullable; set = opted out, never mail
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});
export type MarketingContact = typeof marketingContacts.$inferSelect;
export type NewMarketingContact = typeof marketingContacts.$inferInsert;

// ── legacy_orders ────────────────────────────────────────────────────────────
// ADR 0012 — one row per historical order; productsRaw is coarse free-text,
// NOT normalised to the typed catalog. Never touches the live orders table.

export const legacyOrders = pgTable("legacy_orders", {
  id:           text("id").primaryKey(),          // nanoid
  customerId:   text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  orderedAt:    timestamp("ordered_at"),          // nullable — some legacy dates unparseable
  productsRaw:  text("products_raw").notNull(),   // e.g. "100 mg ISRIB"
  amountCents:  integer("amount_cents").notNull(),// cents
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

export type LegacyOrder = typeof legacyOrders.$inferSelect;
export type NewLegacyOrder = typeof legacyOrders.$inferInsert;

// ── discount_ledger ────────────────────────────────────────────────────────────
// ADR 0014 — referrer reward credits. One row per earned credit, owned by the
// referrer; consumed once when redeemed on a future order.

export const discountLedger = pgTable("discount_ledger", {
  id:              text("id").primaryKey(),          // nanoid
  customerId:      text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }), // the reward OWNER (referrer)
  source:          text("source").notNull(),         // "referral_reward" for now (reserved for future "promo")
  discountPct:     integer("discount_pct").notNull(),// 10
  status:          discountLedgerStatusEnum("status").notNull().default("available"),
  redeemedOrderId: text("redeemed_order_id"),         // nullable; set when consumed
  expiresAt:       timestamp("expires_at"),           // nullable = never expires
  createdAt:       timestamp("created_at").defaultNow().notNull(),
});

export type DiscountLedgerEntry = typeof discountLedger.$inferSelect;
export type NewDiscountLedgerEntry = typeof discountLedger.$inferInsert;

// ── referrals ────────────────────────────────────────────────────────────────
// ADR 0014 — junction linking a referral code → the referred order → the reward
// credit created for the referrer once that order is paid.

export const referrals = pgTable("referrals", {
  id:                  text("id").primaryKey(),          // nanoid
  referrerCustomerId:  text("referrer_customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }), // the code owner
  // .unique() → at most one referral per referred order = DB-level idempotency guard
  // for createReferrerReward against webhook retries / concurrent paid-transitions (ADR 0014)
  referredOrderId:     text("referred_order_id").notNull().unique().references(() => orders.id, { onDelete: "cascade" }),
  referredEmail:       text("referred_email").notNull(),
  referrerRewardId:    text("referrer_reward_id").references(() => discountLedger.id), // nullable; set when the reward is created on paid
  createdAt:           timestamp("created_at").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;

// ── verification_tokens ──────────────────────────────────────────────────────
// ADR 0013 — NORA-style dual-use, one-time tokens for password reset AND email
// verification. Rows are deleted on use. Distinguished by the identifier prefix.

export const verificationTokens = pgTable("verification_tokens", {
  // password-reset tokens store the bare email; email-verification tokens store
  // "verify:"+email — the prefix is how the two flows share this one table.
  identifier:  text("identifier").notNull(),
  token:       text("token").notNull().unique(),   // unguessable nanoid
  expires:     timestamp("expires").notNull(),     // reset = 1h, verify = 24h (set by the action, not the schema)
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;

// ── promo_codes ──────────────────────────────────────────────────────────────
// ADR 0016 — launch promo codes. A checkout-applied percentage discount validated
// server-side, stored on orders.promo_code, and reflected in the total. Codes are
// stored/compared uppercase; a DB row (not env/hardcoded) so they can be disabled/
// expired and usage tracked without a redeploy. Non-stacking (best-single) with the
// crypto/referral/reward discounts — see computeEffectiveDiscount in src/lib/referral.ts.

export const promoCodes = pgTable("promo_codes", {
  id:              text("id").primaryKey(),          // nanoid
  code:            text("code").notNull().unique(),  // stored uppercase (normalizePromoCode)
  discountPct:     integer("discount_pct").notNull(),// e.g. 10
  active:          boolean("active").notNull().default(true),
  expiresAt:       timestamp("expires_at"),          // nullable = never expires
  redemptionCount: integer("redemption_count").notNull().default(0), // tracked, uncapped
  createdAt:       timestamp("created_at").defaultNow().notNull(),
});

export type PromoCode = typeof promoCodes.$inferSelect;
export type NewPromoCode = typeof promoCodes.$inferInsert;

// ── webhook_logs ─────────────────────────────────────────────────────────────
// NowPayments (and any future provider's) IPN audit log. Every VERIFIED IPN is recorded
// here best-effort, so no payment signal is ever blind again (incident 2026-09-08 — a
// deposit that never reached `finished` was invisible). Write-only from the webhook.
export const webhookLogs = pgTable("webhook_logs", {
  id:            text("id").primaryKey(),                       // nanoid, generated in the route
  provider:      text("provider").notNull().default("nowpayments"),
  orderNumber:   text("order_number"),                          // order_id from the payload; nullable
  paymentId:     text("payment_id"),                            // NowPayments payment_id (dashboard id)
  paymentStatus: text("payment_status"),
  actuallyPaid:  text("actually_paid"),                         // raw string of the deposited crypto amount (audit; avoids float precision issues)
  rawJson:       text("raw_json").notNull(),                    // full verified payload as received
  createdAt:     timestamp("created_at").defaultNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type NewWebhookLog = typeof webhookLogs.$inferInsert;
