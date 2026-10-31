import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { before, describe, it } from "node:test";

// Importing the module loads src/lib/db, which builds a Pool from this. Nothing here connects:
// every query is only turned into SQL. Set before the import, and over any real value, so this
// file could never reach a database even if it tried.
process.env.POSTGRES_URL = "postgres://test:test@127.0.0.1:1/test";

type AdminQueries = typeof import("./admin-queries");
type PartnerQueries = typeof import("./partner-queries");
let queries: AdminQueries;
let partner: PartnerQueries;

before(async () => {
  queries = await import("./admin-queries");
  partner = await import("./partner-queries");
});

const AFFILIATE_ID = "aff_test_123";

const FORBIDDEN_IN_SQL: readonly RegExp[] = [
  /email/i,
  /"name"/i,
  /phone/i,
  /address/i,
  /city/i,
  /postal_code/i,
  /state_region/i,
  /country/i,
  /order_items/i,
  /customers/i,
  /shipping_token/i,
];

describe("admin orders query", () => {
  it("selects exactly the allowed columns", () => {
    assert.deepEqual(Object.keys(queries.ADMIN_ORDER_COLUMNS).sort(), [
      "attributionSource",
      "commissionAmountCents",
      "createdAt",
      "id",
      "orderNumber",
      "status",
      "totalPrice",
    ]);
  });

  it("is scoped to the affiliate and reads no customer data", () => {
    const { sql, params } = queries.adminOrdersQuery(AFFILIATE_ID).toSQL();
    assert.deepEqual(params, [AFFILIATE_ID]);
    assert.match(sql, /where "orders"\."affiliate_id" = \$1/);
    for (const forbidden of FORBIDDEN_IN_SQL) assert.doesNotMatch(sql, forbidden);
  });

  it("the totals query reads only what the balance needs", () => {
    const { sql } = queries.attributedOrderTotalsQuery().toSQL();
    assert.match(sql, /^select "affiliate_id", "status", "commission_amount_cents" from "orders"/);
    for (const forbidden of FORBIDDEN_IN_SQL) assert.doesNotMatch(sql, forbidden);
  });
});

describe("admin payouts query", () => {
  it("is scoped to the affiliate", () => {
    const { sql, params } = queries.adminPayoutsQuery(AFFILIATE_ID).toSQL();
    assert.deepEqual(params, [AFFILIATE_ID]);
    assert.match(sql, /where "affiliate_payouts"\."affiliate_id" = \$1/);
  });
});

describe("admin module", () => {
  it("imports no customer table", () => {
    const source = readFileSync(new URL("./admin-queries.ts", import.meta.url), "utf8");
    const schemaImport = /import \{([^}]*)\} from "@\/lib\/db\/schema"/.exec(source);
    assert.ok(schemaImport);
    assert.deepEqual(schemaImport[1].match(/\w+/g)?.sort(), [
      "affiliateClicks",
      "affiliatePayouts",
      "affiliates",
      "orders",
      "promoCodes",
    ]);
  });
});

describe("balance", () => {
  it("matches the partner dashboard for the same rows", async () => {
    const { computeCommissionTotals } = await import("./core");

    const rows = [
      { status: "paid", commissionAmountCents: 29_750 },
      { status: "fulfilled", commissionAmountCents: 14_875 },
      { status: "cancelled", commissionAmountCents: 5_950 },
      { status: "awaiting_payment", commissionAmountCents: 11_900 },
    ];
    const payouts = [{ amountCents: 20_000 }, { amountCents: 10_000 }];

    const admin = computeCommissionTotals(rows, payouts);
    const partnerSummary = partner.summarizePartner(
      0,
      rows.map((row) =>
        partner.mapPartnerOrder({
          ...row,
          orderNumber: "ISR-AB12CD34",
          createdAt: new Date(0),
          totalPrice: 0,
        } as Parameters<PartnerQueries["mapPartnerOrder"]>[0]),
      ),
      payouts,
    );

    assert.equal(admin.earnedOrders, partnerSummary.earnedOrders);
    assert.equal(admin.earnedCents, partnerSummary.earnedCents);
    assert.equal(admin.paidOutCents, partnerSummary.paidOutCents);
    assert.equal(admin.balanceCents, partnerSummary.balanceCents);
  });
});
