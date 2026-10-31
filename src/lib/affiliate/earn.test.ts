import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, describe, it, mock } from "node:test";

// See partner-queries.test.ts: importing earn.ts loads src/lib/db, and nothing here connects. Set
// before the import, and over any real value, so this file could never reach a database.
process.env.POSTGRES_URL = "postgres://test:test@127.0.0.1:1/test";

type Earn = typeof import("./earn");
type Db = typeof import("@/lib/db");

const CUSTOMER_FIELDS = [
  "email",
  "name",
  "phone",
  "address",
  "city",
  "postalCode",
  "country",
  "note",
];

const source = readFileSync(new URL("./earn.ts", import.meta.url), "utf8");

describe("claimCommissionAndNotify", () => {
  it("returns no customer field from the claim", () => {
    const returning = source.match(/\.returning\(\{([\s\S]*?)\}\)/)?.[1];

    assert.ok(returning, "earn.ts should have a .returning({ ... }) block");
    assert.ok(returning.includes("orders.orderNumber"), "the match should be the claim's block");
    for (const field of CUSTOMER_FIELDS) {
      assert.ok(!returning.toLowerCase().includes(field.toLowerCase()), `.returning names ${field}`);
    }
  });
});

describe("claimCommissionAndNotify after a claim", () => {
  let earn: Earn;
  let db: Db["db"];
  const flagBefore = process.env.AFFILIATES_ENABLED;

  before(async () => {
    process.env.AFFILIATES_ENABLED = "true";
    earn = await import("./earn");
    ({ db } = await import("@/lib/db"));
  });

  after(() => {
    if (flagBefore === undefined) delete process.env.AFFILIATES_ENABLED;
    else process.env.AFFILIATES_ENABLED = flagBefore;
  });

  // The claim returns one row with this commission. The affiliate lookup that leads to a
  // notification finds nobody, so no version of this can send anything.
  function stubDb(commissionAmountCents: number) {
    const claimed = {
      orderNumber: "ISR-AB12CD34",
      createdAt: new Date("2026-10-31T12:00:00Z"),
      totalPrice: 85000,
      commissionAmountCents,
      affiliateId: "aff_1",
    };
    const chain = {
      set: () => chain,
      where: () => chain,
      returning: async () => [claimed],
      from: () => chain,
      limit: async () => [],
    };
    return {
      update: mock.method(db, "update", (() => chain) as unknown as typeof db.update),
      select: mock.method(db, "select", (() => chain) as unknown as typeof db.select),
    };
  }

  it("keeps the claim but looks nobody up when the commission is 0", async (t) => {
    t.after(() => mock.restoreAll());
    const { update, select } = stubDb(0);

    await earn.claimCommissionAndNotify("order_1");

    assert.equal(update.mock.callCount(), 1);
    assert.equal(select.mock.callCount(), 0);
  });

  it("goes on to the affiliate lookup when there is a commission", async (t) => {
    t.after(() => mock.restoreAll());
    const { update, select } = stubDb(1);

    await earn.claimCommissionAndNotify("order_1");

    assert.equal(update.mock.callCount(), 1);
    assert.equal(select.mock.callCount(), 1);
  });
});
