import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PAYOUT_CURRENCIES,
  buildAffiliateNotification,
  buildAffiliateTestNotification,
  commissionState,
  computeCommissionCents,
  computeCommissionTotals,
  computeTotalOwedCents,
  formatBpsAsPercent,
  isValidAffiliateCode,
  maskOrderNumber,
  normalizeAffiliateCode,
  parseAffiliateInput,
  parseDateInput,
  parsePayoutInput,
  parsePercentToBps,
  parseUsdToCents,
  resolveAttribution,
  type AffiliateInput,
  type AttributionAffiliate,
  type PayoutInput,
} from "./core";
import { txExplorerUrl } from "./explorer";

function affiliate(code: string, overrides: Partial<AttributionAffiliate> = {}): AttributionAffiliate {
  return {
    id: `id-${code}`,
    code,
    isActive: true,
    notifyEmail: `${code.toLowerCase()}@isrib-qa.test`,
    customerDiscountBps: 1500,
    commissionRateBps: 3500,
    ...overrides,
  };
}

const buyerEmail = "buyer@isrib-qa.test";
const alice = affiliate("ALICE");
const bob = affiliate("BOB");

describe("normalizeAffiliateCode", () => {
  it("trims and uppercases", () => {
    assert.equal(normalizeAffiliateCode("  alice_1 "), "ALICE_1");
  });

  it("returns null when empty", () => {
    assert.equal(normalizeAffiliateCode(null), null);
    assert.equal(normalizeAffiliateCode(undefined), null);
    assert.equal(normalizeAffiliateCode(""), null);
    assert.equal(normalizeAffiliateCode("   "), null);
  });
});

describe("isValidAffiliateCode", () => {
  it("accepts the ADR alphabet at both length limits", () => {
    assert.equal(isValidAffiliateCode("AB"), true);
    assert.equal(isValidAffiliateCode("A".repeat(32)), true);
    assert.equal(isValidAffiliateCode("ALICE_1-X"), true);
  });

  it("rejects bad length and characters", () => {
    assert.equal(isValidAffiliateCode("A"), false);
    assert.equal(isValidAffiliateCode("A".repeat(33)), false);
    assert.equal(isValidAffiliateCode("alice"), false);
    assert.equal(isValidAffiliateCode("AL ICE"), false);
    assert.equal(isValidAffiliateCode("ALICE\n"), false);
  });

  it("bans the REF- prefix but not REF itself", () => {
    assert.equal(isValidAffiliateCode("REF-ABC234"), false);
    assert.equal(isValidAffiliateCode("REF"), true);
    assert.equal(isValidAffiliateCode("REFERRAL"), true);
  });
});

describe("resolveAttribution", () => {
  it("lets a typed code win over the cookie", () => {
    const result = resolveAttribution({
      typedCode: "ALICE",
      cookieCode: "BOB",
      buyerEmail,
      affiliates: [alice, bob],
    });
    assert.deepEqual(result, { affiliate: alice, source: "code" });
  });

  it("attributes the cookie alone as link", () => {
    const result = resolveAttribution({
      typedCode: null,
      cookieCode: "BOB",
      buyerEmail,
      affiliates: [bob],
    });
    assert.deepEqual(result, { affiliate: bob, source: "link" });
  });

  it("attributes a typed code alone as code", () => {
    const result = resolveAttribution({
      typedCode: "ALICE",
      cookieCode: undefined,
      buyerEmail,
      affiliates: [alice],
    });
    assert.deepEqual(result, { affiliate: alice, source: "code" });
  });

  it("counts a typed code equal to the cookie as link", () => {
    const result = resolveAttribution({
      typedCode: "ALICE",
      cookieCode: "ALICE",
      buyerEmail,
      affiliates: [alice],
    });
    assert.deepEqual(result, { affiliate: alice, source: "link" });
  });

  it("compares typed and cookie after normalizing", () => {
    const result = resolveAttribution({
      typedCode: " alice ",
      cookieCode: "Alice",
      buyerEmail,
      affiliates: [alice],
    });
    assert.deepEqual(result, { affiliate: alice, source: "link" });
  });

  it("keeps the cookie when the typed code is unknown", () => {
    const result = resolveAttribution({
      typedCode: "RELAUNCH10",
      cookieCode: "BOB",
      buyerEmail,
      affiliates: [bob],
    });
    assert.deepEqual(result, { affiliate: bob, source: "link" });
  });

  it("uses the last touch, which is whatever the cookie now holds", () => {
    const result = resolveAttribution({
      typedCode: null,
      cookieCode: "BOB",
      buyerEmail,
      affiliates: [alice, bob],
    });
    assert.deepEqual(result, { affiliate: bob, source: "link" });
  });

  it("returns null when a customer referral took the last touch", () => {
    const result = resolveAttribution({
      typedCode: null,
      cookieCode: "REF-ABC234",
      buyerEmail,
      affiliates: [alice],
    });
    assert.equal(result, null);
  });

  it("returns null with no code at all", () => {
    const result = resolveAttribution({
      typedCode: "",
      cookieCode: null,
      buyerEmail,
      affiliates: [],
    });
    assert.equal(result, null);
  });

  it("ignores an inactive typed code and keeps the cookie", () => {
    const result = resolveAttribution({
      typedCode: "ALICE",
      cookieCode: "BOB",
      buyerEmail,
      affiliates: [affiliate("ALICE", { isActive: false }), bob],
    });
    assert.deepEqual(result, { affiliate: bob, source: "link" });
  });

  it("ignores an inactive cookie code", () => {
    const result = resolveAttribution({
      typedCode: null,
      cookieCode: "BOB",
      buyerEmail,
      affiliates: [affiliate("BOB", { isActive: false })],
    });
    assert.equal(result, null);
  });

  it("treats a self-purchase as no attribution, case-insensitively", () => {
    const result = resolveAttribution({
      typedCode: "ALICE",
      cookieCode: "ALICE",
      buyerEmail: "  Alice@ISRIB-QA.test ",
      affiliates: [affiliate("ALICE", { notifyEmail: "alice@isrib-qa.TEST" })],
    });
    assert.equal(result, null);
  });

  it("falls through to the cookie when the typed code is a self-purchase", () => {
    const result = resolveAttribution({
      typedCode: "ALICE",
      cookieCode: "BOB",
      buyerEmail: "ALICE@isrib-qa.test",
      affiliates: [alice, bob],
    });
    assert.deepEqual(result, { affiliate: bob, source: "link" });
  });

  it("checks the cookie for self-purchase too", () => {
    const result = resolveAttribution({
      typedCode: "ALICE",
      cookieCode: "BOB",
      buyerEmail: "both@isrib-qa.test",
      affiliates: [
        affiliate("ALICE", { notifyEmail: "both@isrib-qa.test" }),
        affiliate("BOB", { notifyEmail: "both@isrib-qa.test" }),
      ],
    });
    assert.equal(result, null);
  });

  it("does not treat a missing notify email as a self-purchase", () => {
    const noEmail = affiliate("ALICE", { notifyEmail: null });
    const result = resolveAttribution({
      typedCode: "ALICE",
      cookieCode: null,
      buyerEmail,
      affiliates: [noEmail],
    });
    assert.deepEqual(result, { affiliate: noEmail, source: "code" });
  });
});

describe("computeCommissionCents", () => {
  it("matches the ADR worked example", () => {
    assert.equal(computeCommissionCents(85000, 3500), 29750);
  });

  it("rounds to the nearest cent", () => {
    assert.equal(computeCommissionCents(1001, 3500), 350); // 350.35
    assert.equal(computeCommissionCents(1003, 3500), 351); // 351.05
    assert.equal(computeCommissionCents(1, 3333), 0); // 0.3333
    assert.equal(computeCommissionCents(2, 3333), 1); // 0.6666
  });

  it("rounds an exact half cent up", () => {
    assert.equal(computeCommissionCents(1, 5000), 1); // 0.5
    assert.equal(computeCommissionCents(3, 5000), 2); // 1.5
  });

  it("returns whole integers for every total", () => {
    for (let total = 0; total < 5000; total += 7) {
      assert.ok(Number.isInteger(computeCommissionCents(total, 3500)));
    }
  });

  it("is zero on a zero total or rate", () => {
    assert.equal(computeCommissionCents(0, 3500), 0);
    assert.equal(computeCommissionCents(85000, 0), 0);
  });
});

describe("commissionState", () => {
  it("is pending before payment", () => {
    assert.equal(commissionState("pending_payment_instructions"), "pending");
    assert.equal(commissionState("awaiting_payment"), "pending");
  });

  it("is earned once paid", () => {
    assert.equal(commissionState("paid"), "earned");
    assert.equal(commissionState("fulfilled"), "earned");
  });

  it("is void when cancelled", () => {
    assert.equal(commissionState("cancelled"), "void");
  });

  it("is pending for anything else", () => {
    assert.equal(commissionState("something_new"), "pending");
  });
});

describe("maskOrderNumber", () => {
  it("keeps only the prefix and the last two characters", () => {
    assert.equal(maskOrderNumber("ISR-AB12CD34"), "ISR-******34");
  });

  it("never shows a whole short number", () => {
    assert.equal(maskOrderNumber("ISR-AB"), "ISR-******");
    assert.equal(maskOrderNumber("ISR-A"), "ISR-******");
  });

  it("still masks a number with no prefix", () => {
    assert.equal(maskOrderNumber("AB12CD34"), "******34");
  });
});

describe("buildAffiliateNotification", () => {
  const input = {
    orderNumber: "ISR-AB12CD34",
    createdAt: new Date("2026-10-31T23:30:00Z"),
    orderTotalCents: 85000,
    commissionCents: 29750,
  };

  it("carries the masked number, date, order amount and commission", () => {
    const { subject, text, html } = buildAffiliateNotification(input);

    assert.equal(subject, "Commission earned: $297.50");
    assert.equal(
      text,
      "Order ISR-******34 from 2026-10-31 has been paid.\n\nOrder amount: $850.00. Your commission: $297.50.",
    );
    assert.equal(
      html,
      "<p>Order ISR-******34 from 2026-10-31 has been paid.</p>\n<p>Order amount: $850.00. Your commission: $297.50.</p>",
    );
  });

  it("never carries the full order number", () => {
    const { subject, text, html } = buildAffiliateNotification(input);
    for (const part of [subject, text, html]) {
      assert.equal(part.includes("AB12"), false);
      assert.equal(part.includes("CD34"), false);
    }
  });

  it("drops anything else on the object it is handed", () => {
    // A whole order row passed by mistake: assignable, because the extras are not a literal.
    const fullOrderRow = {
      ...input,
      name: "Qa Buyer",
      email: "buyer@isrib-qa.test",
      phone: "+15550100",
      address: "1 Test Street",
      city: "Testville",
      postalCode: "90210",
      country: "Testland",
      note: "leave at the door",
      promoCode: "RELAUNCH10",
      productSlug: "isrib-a15",
      nowpaymentsPaymentUrl: "https://example.test/pay",
      shippingToken: "secret-shipping-token",
    };

    assert.deepEqual(buildAffiliateNotification(fullOrderRow), buildAffiliateNotification(input));
  });

  it("has no bullets", () => {
    const { text, html } = buildAffiliateNotification(input);
    assert.equal(/^\s*[-*•]/m.test(text), false);
    assert.equal(/<[uo]l|<li/.test(html), false);
  });
});

describe("parsePercentToBps", () => {
  it("converts whole and one-decimal percentages", () => {
    assert.equal(parsePercentToBps("35"), 3500);
    assert.equal(parsePercentToBps("15"), 1500);
    assert.equal(parsePercentToBps("12.5"), 1250);
    assert.equal(parsePercentToBps(" 35 "), 3500);
    assert.equal(parsePercentToBps("35.0"), 3500);
  });

  it("accepts the ends of the range", () => {
    assert.equal(parsePercentToBps("0"), 0);
    assert.equal(parsePercentToBps("0.1"), 10);
    assert.equal(parsePercentToBps("100"), 10_000);
    assert.equal(parsePercentToBps("100.0"), 10_000);
  });

  it("gets every value right that float arithmetic gets wrong", () => {
    assert.notEqual(19.9 * 100, 1990, "the trap this test exists for");
    assert.equal(parsePercentToBps("19.9"), 1990);
    assert.notEqual(1.1 * 100, 110, "the trap this test exists for");
    assert.equal(parsePercentToBps("1.1"), 110);

    for (let tenths = 0; tenths <= 1000; tenths += 1) {
      const typed = `${Math.floor(tenths / 10)}.${tenths % 10}`;
      assert.equal(parsePercentToBps(typed), tenths * 10, typed);
    }
  });

  it("rejects anything else", () => {
    const invalid: unknown[] = [
      "",
      "   ",
      "abc",
      "-1",
      "+5",
      "100.1",
      "101",
      "12.55",
      "12.",
      ".5",
      "1e2",
      "0x10",
      "35%",
      "1,5",
      "NaN",
      "Infinity",
      35,
      null,
      undefined,
      {},
    ];
    for (const value of invalid) assert.equal(parsePercentToBps(value), null, String(value));
  });
});

describe("formatBpsAsPercent", () => {
  it("is the inverse of parsePercentToBps", () => {
    assert.equal(formatBpsAsPercent(3500), "35");
    assert.equal(formatBpsAsPercent(1250), "12.5");

    for (let tenths = 0; tenths <= 1000; tenths += 1) {
      const bps = tenths * 10;
      assert.equal(parsePercentToBps(formatBpsAsPercent(bps)), bps);
    }
  });
});

describe("parseUsdToCents", () => {
  it("converts dollars and cents", () => {
    assert.equal(parseUsdToCents("297.50"), 29_750);
    assert.equal(parseUsdToCents("297.5"), 29_750);
    assert.equal(parseUsdToCents("100"), 10_000);
    assert.equal(parseUsdToCents("0.01"), 1);
    assert.equal(parseUsdToCents(" 12.34 "), 1234);
  });

  it("gets every value right that float arithmetic gets wrong", () => {
    assert.notEqual(0.1 + 0.2, 0.3, "the trap this test exists for");
    assert.equal(parseUsdToCents("0.3"), 30);
    assert.notEqual(19.99 * 100, 1999, "the trap this test exists for");
    assert.equal(parseUsdToCents("19.99"), 1999);
    assert.notEqual(1.15 * 100, 115, "the trap this test exists for");
    assert.equal(parseUsdToCents("1.15"), 115);
    assert.notEqual(4.35 * 100, 435, "the trap this test exists for");
    assert.equal(parseUsdToCents("4.35"), 435);

    for (let cents = 1; cents <= 100_000; cents += 1) {
      const typed = `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
      assert.equal(parseUsdToCents(typed), cents, typed);
    }
  });

  it("holds the largest amount the column can store, and nothing above it", () => {
    assert.equal(parseUsdToCents("21474836.47"), 2_147_483_647);
    assert.equal(parseUsdToCents("21474836.48"), null);
    assert.equal(parseUsdToCents("99999999"), null);
  });

  it("rejects zero and anything else", () => {
    const invalid: unknown[] = [
      "0",
      "0.00",
      "",
      "   ",
      "abc",
      "-5",
      "+5",
      "1.234",
      "1.",
      ".5",
      "1e3",
      "$5",
      "1,000",
      "1,5",
      "NaN",
      "Infinity",
      "999999999999999999999",
      5,
      null,
      undefined,
    ];
    for (const value of invalid) assert.equal(parseUsdToCents(value), null, String(value));
  });
});

describe("parseDateInput", () => {
  it("reads a date input value as UTC midnight", () => {
    assert.equal(parseDateInput("2026-10-31")?.toISOString(), "2026-10-31T00:00:00.000Z");
    assert.equal(parseDateInput("2028-02-29")?.toISOString(), "2028-02-29T00:00:00.000Z");
  });

  it("rejects a day that does not exist instead of rolling over", () => {
    assert.equal(parseDateInput("2026-02-31"), null);
    assert.equal(parseDateInput("2026-02-29"), null);
    assert.equal(parseDateInput("2026-13-01"), null);
  });

  it("rejects other formats", () => {
    for (const value of ["", "31/10/2026", "2026-10-31T10:00:00Z", "yesterday", null, 20261031]) {
      assert.equal(parseDateInput(value), null, String(value));
    }
  });
});

const validAffiliate: AffiliateInput = {
  name: " QA Partner ",
  handle: "",
  code: " qa_partner ",
  commissionPercent: "35",
  discountPercent: "12.5",
  notifyEmail: " Partner@isrib-qa.test ",
  telegramChatId: "",
};

describe("parseAffiliateInput", () => {
  it("normalises the code, trims text and stores rates as bps", () => {
    assert.deepEqual(parseAffiliateInput(validAffiliate), {
      values: {
        name: "QA Partner",
        handle: null,
        code: "QA_PARTNER",
        commissionRateBps: 3500,
        customerDiscountBps: 1250,
        notifyEmail: "Partner@isrib-qa.test",
        notifyTelegramChatId: null,
      },
    });
  });

  it("allows both contact fields to be blank", () => {
    const parsed = parseAffiliateInput({ ...validAffiliate, notifyEmail: "  " });
    assert.ok("values" in parsed);
    assert.equal(parsed.values.notifyEmail, null);
  });

  it("rejects a bad field with a message", () => {
    const bad: Partial<AffiliateInput>[] = [
      { name: "  " },
      { code: "" },
      { code: "a" },
      { code: "has space" },
      { code: "ref-abc123" },
      { commissionPercent: "abc" },
      { commissionPercent: "101" },
      { discountPercent: "12.55" },
      { notifyEmail: "not-an-email" },
      { notifyEmail: `${"a".repeat(250)}@b.co` },
    ];
    for (const change of bad) {
      assert.ok("error" in parseAffiliateInput({ ...validAffiliate, ...change }), `${JSON.stringify(change)}`);
    }
  });
});

const validPayout: PayoutInput = {
  amountUsd: "297.50",
  currency: "USDT-TRC20",
  cryptoAmount: " 297.500000 ",
  txHash: " abc123 ",
  periodStart: "2026-10-01",
  periodEnd: "2026-10-15",
  paidAt: "2026-10-16",
};

const NOW = new Date("2026-10-31T22:30:00.000Z");

describe("parsePayoutInput", () => {
  it("trims, keeps the crypto amount as typed, and parses the rest", () => {
    assert.deepEqual(parsePayoutInput(validPayout, NOW), {
      values: {
        amountCents: 29_750,
        cryptoCurrency: "USDT-TRC20",
        cryptoAmount: "297.500000",
        txHash: "abc123",
        periodStart: new Date("2026-10-01T00:00:00.000Z"),
        periodEnd: new Date("2026-10-15T00:00:00.000Z"),
        paidAt: new Date("2026-10-16T00:00:00.000Z"),
      },
    });
  });

  it("defaults a blank paid date to today", () => {
    const parsed = parsePayoutInput({ ...validPayout, paidAt: "" }, NOW);
    assert.ok("values" in parsed);
    assert.equal(parsed.values.paidAt.toISOString(), "2026-10-31T00:00:00.000Z");
  });

  it("allows a one-day period", () => {
    const parsed = parsePayoutInput({ ...validPayout, periodEnd: validPayout.periodStart }, NOW);
    assert.ok("values" in parsed);
  });

  it("rejects a bad field with a message", () => {
    const bad: Partial<PayoutInput>[] = [
      { amountUsd: "0" },
      { amountUsd: "abc" },
      { currency: "USDT" },
      { currency: "" },
      { currency: "usdt-trc20" },
      { cryptoAmount: "" },
      { cryptoAmount: "0.000" },
      { cryptoAmount: "0,0015" },
      { cryptoAmount: "1e5" },
      { txHash: "   " },
      { periodStart: "" },
      { periodEnd: "2026-02-31" },
      { periodEnd: "2026-09-30" },
      { paidAt: "soon" },
    ];
    for (const change of bad) {
      assert.ok("error" in parsePayoutInput({ ...validPayout, ...change }, NOW), JSON.stringify(change));
    }
  });
});

describe("PAYOUT_CURRENCIES", () => {
  it("are the four exact strings, and each gets a block-explorer link", () => {
    assert.deepEqual([...PAYOUT_CURRENCIES], ["BTC", "LTC", "ETH", "USDT-TRC20"]);
    for (const currency of PAYOUT_CURRENCIES) {
      assert.ok(txExplorerUrl(currency, "abc123"), currency);
    }
  });
});

describe("computeCommissionTotals", () => {
  const paid = { status: "paid", commissionAmountCents: 10_000 };
  const fulfilled = { status: "fulfilled", commissionAmountCents: 5_000 };
  const cancelled = { status: "cancelled", commissionAmountCents: 7_000 };
  const pending = { status: "awaiting_payment", commissionAmountCents: 3_000 };

  it("counts paid and fulfilled only", () => {
    assert.deepEqual(computeCommissionTotals([paid, fulfilled, cancelled, pending], []), {
      earnedOrders: 2,
      earnedCents: 15_000,
      paidOutCents: 0,
      balanceCents: 15_000,
    });
  });

  it("recording a payout reduces the balance by exactly that amount", () => {
    const before = computeCommissionTotals([paid, fulfilled], []);
    const after = computeCommissionTotals([paid, fulfilled], [{ amountCents: 12_345 }]);

    assert.equal(before.balanceCents - after.balanceCents, 12_345);
    assert.equal(after.earnedCents, before.earnedCents);
    assert.equal(after.paidOutCents, 12_345);
  });

  it("goes negative when an order is cancelled after its payout", () => {
    const payouts = [{ amountCents: 10_000 }];
    assert.equal(computeCommissionTotals([paid], payouts).balanceCents, 0);

    const afterCancel = computeCommissionTotals([{ ...paid, status: "cancelled" }], payouts);
    assert.equal(afterCancel.earnedCents, 0);
    assert.equal(afterCancel.balanceCents, -10_000);
  });

  it("goes negative on a payout above the balance", () => {
    assert.equal(computeCommissionTotals([paid], [{ amountCents: 10_001 }]).balanceCents, -1);
  });

  it("treats a missing commission as zero", () => {
    const totals = computeCommissionTotals([{ status: "paid", commissionAmountCents: null }], []);
    assert.equal(totals.earnedOrders, 1);
    assert.equal(totals.earnedCents, 0);
  });
});

describe("computeTotalOwedCents", () => {
  it("adds positive balances and does not net off a negative one", () => {
    assert.equal(computeTotalOwedCents([10_000, -4_000, 2_500, 0]), 12_500);
  });

  it("is zero with nothing owed", () => {
    assert.equal(computeTotalOwedCents([]), 0);
    assert.equal(computeTotalOwedCents([-1]), 0);
  });
});

describe("buildAffiliateTestNotification", () => {
  const message = buildAffiliateTestNotification(new Date("2026-10-31T10:00:00.000Z"));

  it("is labelled as a test in every form it is sent in", () => {
    assert.match(message.subject, /^\[TEST\]/);
    assert.match(message.text, /^TEST MESSAGE/);
    assert.match(message.html, /TEST MESSAGE/);
  });

  it("uses the real format with a masked number that belongs to no order", () => {
    assert.match(message.text, /ISR-\*{6}00 /);
    assert.match(message.text, /\$35\.00/);
    assert.doesNotMatch(message.text, /ISR-TEST/);
  });
});
