import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { before, describe, it } from "node:test";

// Importing the module loads src/lib/db, which builds a Pool from this. Nothing here connects:
// every query is only turned into SQL. Set before the import, and over any real value, so this
// file could never reach a database even if it tried.
process.env.POSTGRES_URL = "postgres://test:test@127.0.0.1:1/test";

type PartnerQueries = typeof import("./partner-queries");
let queries: PartnerQueries;

before(async () => {
  queries = await import("./partner-queries");
});

const AFFILIATE_ID = "aff_test_123";

const ORDER_WHITELIST = ["commissionAmountCents", "createdAt", "orderNumber", "status", "totalPrice"];

const FORBIDDEN_IN_SQL: readonly RegExp[] = [
  /email/i,
  /"name"/i,
  /phone/i,
  /address/i,
  /city/i,
  /postal_code/i,
  /state_region/i,
  /country/i,
  /note/i,
  /user_id/i,
  /order_items/i,
  /customers/i,
  /nowpayments/i,
  /shipping_token/i,
  /utm_/i,
  /tracking_/i,
];

function builders(q: PartnerQueries) {
  return {
    partnerOrdersQuery: q.partnerOrdersQuery(AFFILIATE_ID),
    partnerPayoutsQuery: q.partnerPayoutsQuery(AFFILIATE_ID),
    partnerClickCountQuery: q.partnerClickCountQuery(AFFILIATE_ID),
  };
}

const rawOrder = {
  orderNumber: "ISR-AB12CD34",
  createdAt: new Date("2026-10-31T12:00:00Z"),
  totalPrice: 85000,
  commissionAmountCents: 29750,
  status: "paid" as const,
};

function partnerOrder(status: "earned" | "void" | "pending", commissionAmountCents: number) {
  return {
    orderNumber: "ISR-******34",
    createdAt: new Date("2026-10-31T12:00:00Z"),
    totalPrice: 10000,
    commissionAmountCents,
    status,
  };
}

describe("PARTNER_ORDER_COLUMNS", () => {
  it("is exactly the whitelist", () => {
    assert.deepEqual(Object.keys(queries.PARTNER_ORDER_COLUMNS).sort(), ORDER_WHITELIST);
  });
});

describe("query builders", () => {
  it("read no customer or payment column or table", () => {
    for (const [name, query] of Object.entries(builders(queries))) {
      const { sql } = query.toSQL();
      for (const forbidden of FORBIDDEN_IN_SQL) {
        assert.doesNotMatch(sql, forbidden, name);
      }
    }
  });

  it("all filter on the given affiliate id", () => {
    for (const [name, query] of Object.entries(builders(queries))) {
      const { sql, params } = query.toSQL();
      assert.match(sql, /where "[a-z_]+"\."affiliate_id" = \$1/, name);
      assert.deepEqual(params, [AFFILIATE_ID], name);
    }
  });
});

describe("mapPartnerOrder", () => {
  it("masks the number and returns exactly the whitelisted keys", () => {
    const mapped = queries.mapPartnerOrder(rawOrder);
    assert.equal(mapped.orderNumber, "ISR-******34");
    assert.equal(JSON.stringify(mapped).includes("AB12"), false);
    assert.equal(JSON.stringify(mapped).includes("CD34"), false);
    assert.deepEqual(Object.keys(mapped).sort(), ORDER_WHITELIST);
  });

  it("drops anything extra on the row", () => {
    const row = { ...rawOrder, email: "buyer@isrib-qa.test", name: "Buyer" };
    const mapped = queries.mapPartnerOrder(row);
    assert.deepEqual(Object.keys(mapped).sort(), ORDER_WHITELIST);
    assert.equal(JSON.stringify(mapped).includes("isrib-qa"), false);
  });

  it("reports the commission state, not the raw order status", () => {
    const stateOf = (status: Parameters<PartnerQueries["mapPartnerOrder"]>[0]["status"]) =>
      queries.mapPartnerOrder({ ...rawOrder, status }).status;

    assert.equal(stateOf("paid"), "earned");
    assert.equal(stateOf("fulfilled"), "earned");
    assert.equal(stateOf("cancelled"), "void");
    assert.equal(stateOf("pending_payment_instructions"), "pending");
    assert.equal(stateOf("awaiting_payment"), "pending");
  });
});

describe("summarizePartner", () => {
  it("earns on earned orders only, and subtracts payouts", () => {
    const summary = queries.summarizePartner(
      10,
      [
        partnerOrder("earned", 1000),
        partnerOrder("earned", 500),
        partnerOrder("void", 9000),
        partnerOrder("pending", 7000),
      ],
      [{ amountCents: 1200 }],
    );

    assert.deepEqual(summary, {
      clicks: 10,
      attributedOrders: 4,
      earnedOrders: 2,
      conversionRate: 0.2,
      earnedCents: 1500,
      paidOutCents: 1200,
      balanceCents: 300,
    });
  });

  it("lets a balance go negative after a payout on a cancelled order", () => {
    const summary = queries.summarizePartner(1, [partnerOrder("void", 1000)], [{ amountCents: 1000 }]);
    assert.equal(summary.balanceCents, -1000);
  });

  it("has no conversion rate at zero clicks", () => {
    assert.equal(queries.summarizePartner(0, [partnerOrder("earned", 1)], []).conversionRate, null);
  });
});

describe("partnerOrdersCsv", () => {
  it("writes a header and one row per order, masked, with a label for the state", () => {
    const csv = queries.partnerOrdersCsv([queries.mapPartnerOrder(rawOrder)]);
    assert.equal(
      csv,
      "Order,Date (UTC),Amount (USD),Commission (USD),Status\r\n" +
        "ISR-******34,2026-10-31,850.00,297.50,Earned\r\n",
    );
  });

  it("quotes commas, quotes and line breaks", () => {
    const csv = queries.partnerOrdersCsv([
      { ...partnerOrder("void", 1), orderNumber: 'a,"b"\nc' },
    ]);
    assert.ok(csv.includes('"a,""b""\nc",2026-10-31,100.00,0.01,Void\r\n'));
  });
});

describe("partner-queries.ts source", () => {
  const source = readFileSync(new URL("./partner-queries.ts", import.meta.url), "utf8");
  const code = source.replace(/^\s*\/\/.*$/gm, "");

  it("never calls .select() with no argument", () => {
    assert.doesNotMatch(code, /\.select\(\s*\)/);
  });

  it("imports no customer table", () => {
    const imports = code.match(/^import[\s\S]*?;$/gm)?.join("\n") ?? "";
    assert.ok(imports.includes("@/lib/db/schema"), "the match should cover the schema import");
    for (const table of ["customers", "orderItems", "discountLedger", "referrals"]) {
      assert.equal(imports.includes(table), false, table);
    }
  });
});
