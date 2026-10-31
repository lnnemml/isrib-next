-- ADR 0025 — affiliate program. Additive only, and safe to re-run.
--
-- Deploy order is mandatory: run this BEFORE deploying code that has these columns in
-- schema.ts, because checkout and admin select full `orders` rows.
--
-- Mirrors src/lib/db/schema.ts exactly, using the names drizzle generates, so `db:push`
-- shows no diff for these objects.
--
-- Run with `npm run db:sql -- up 0025_affiliates`, which wraps this file in one
-- transaction, so it has no BEGIN/COMMIT of its own.

-- Fails fast rather than queueing for the orders lock, because anything queued behind this
-- would block checkout. SET LOCAL ends with the runner's transaction.
SET LOCAL lock_timeout = '5s';

-- enum: CREATE TYPE has no IF NOT EXISTS
DO $$ BEGIN
  CREATE TYPE "public"."attribution_source" AS ENUM('link', 'code');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- affiliates
CREATE TABLE IF NOT EXISTS "affiliates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"handle" text,
	"code" text NOT NULL,
	"commission_rate_bps" integer DEFAULT 3500 NOT NULL,
	"customer_discount_bps" integer DEFAULT 1500 NOT NULL,
	"notify_email" text,
	"notify_telegram_chat_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliates_code_unique" UNIQUE("code")
);

-- affiliate_clicks
CREATE TABLE IF NOT EXISTS "affiliate_clicks" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"landing_path" text,
	"visitor_hash" text NOT NULL,
	CONSTRAINT "affiliate_clicks_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action
);

CREATE UNIQUE INDEX IF NOT EXISTS "affiliate_clicks_affiliate_id_visitor_hash_idx" ON "affiliate_clicks" USING btree ("affiliate_id","visitor_hash");

-- affiliate_payouts
CREATE TABLE IF NOT EXISTS "affiliate_payouts" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"crypto_currency" text NOT NULL,
	"crypto_amount" text NOT NULL,
	"tx_hash" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"paid_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_payouts_tx_hash_unique" UNIQUE("tx_hash"),
	CONSTRAINT "affiliate_payouts_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action
);

-- affiliate_login_tokens
CREATE TABLE IF NOT EXISTS "affiliate_login_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_login_tokens_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "affiliate_login_tokens_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action
);

-- affiliate_sessions
CREATE TABLE IF NOT EXISTS "affiliate_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_sessions_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "affiliate_sessions_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action
);

-- affiliate_login_attempts
CREATE TABLE IF NOT EXISTS "affiliate_login_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"visitor_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- orders: every new column is nullable, so existing rows are untouched
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "affiliate_id" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "attribution_source" "attribution_source";
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "commission_rate_snapshot_bps" integer;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "commission_amount_cents" integer;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "commission_earned_at" timestamp;

-- FK: ADD CONSTRAINT has no IF NOT EXISTS
DO $$ BEGIN
  ALTER TABLE "orders" ADD CONSTRAINT "orders_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "orders_affiliate_id_idx" ON "orders" USING btree ("affiliate_id");
