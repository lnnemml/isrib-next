-- ADR 0025 — reverses 0025_affiliates.up.sql. Destroys all affiliate data, including the
-- attribution and commission columns on orders.
--
-- Rollback order: flag off, revert the code, THEN run this. The reverted code must be live
-- first, or its full `orders` selects will fail once the columns are gone.
--
-- Run with `npm run db:sql -- down 0025_affiliates --confirm`, which wraps this file in one
-- transaction, so it has no BEGIN/COMMIT of its own.

-- Fails fast rather than queueing for the orders lock, because anything queued behind this
-- would block checkout. SET LOCAL ends with the runner's transaction.
SET LOCAL lock_timeout = '5s';

-- orders columns first: orders.affiliate_id references affiliates, and
-- orders.attribution_source uses the enum. Dropping the column drops its FK.
DROP INDEX IF EXISTS "orders_affiliate_id_idx";

ALTER TABLE "orders" DROP COLUMN IF EXISTS "affiliate_id";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "attribution_source";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "commission_rate_snapshot_bps";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "commission_amount_cents";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "commission_earned_at";

-- tables, children before the affiliates parent
DROP TABLE IF EXISTS "affiliate_login_attempts";
DROP TABLE IF EXISTS "affiliate_sessions";
DROP TABLE IF EXISTS "affiliate_login_tokens";
DROP TABLE IF EXISTS "affiliate_payouts";
DROP TABLE IF EXISTS "affiliate_clicks";
DROP TABLE IF EXISTS "affiliates";

-- enum
DROP TYPE IF EXISTS "public"."attribution_source";
