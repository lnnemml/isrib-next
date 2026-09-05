import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

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
  createdAt:       timestamp("created_at").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

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
