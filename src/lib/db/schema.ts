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
