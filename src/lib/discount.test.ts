import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeEffectiveDiscount, discountPctFromTotals } from "./discount";

const none = {
  subtotalCents: 100_000,
  isCrypto: false,
  hasValidReferral: false,
  rewardCreditAvailable: false,
  promoPct: 0,
};

describe("computeEffectiveDiscount with an affiliate rate", () => {
  it("takes affiliate 15 over crypto 10 without stacking them", () => {
    const result = computeEffectiveDiscount({ ...none, isCrypto: true, affiliatePct: 15 });
    assert.equal(result.discountPct, 15);
  });

  it("charges 85000 on a 100000 subtotal at 15%", () => {
    const result = computeEffectiveDiscount({ ...none, isCrypto: true, affiliatePct: 15 });
    assert.equal(result.totalCents, 85_000);
  });

  it("lets promo 25 beat affiliate 15", () => {
    const result = computeEffectiveDiscount({ ...none, promoPct: 25, affiliatePct: 15 });
    assert.equal(result.discountPct, 25);
    assert.equal(result.totalCents, 75_000);
  });

  it("does not consume a reward credit when an affiliate rate applies", () => {
    const result = computeEffectiveDiscount({
      ...none,
      rewardCreditAvailable: true,
      affiliatePct: 15,
    });
    assert.equal(result.usesRewardCredit, false);
  });
});

describe("computeEffectiveDiscount with affiliatePct absent", () => {
  it("gives crypto 10%", () => {
    assert.deepEqual(computeEffectiveDiscount({ ...none, isCrypto: true }), {
      discountPct: 10,
      totalCents: 90_000,
      usesRewardCredit: false,
    });
  });

  it("gives manual no discount", () => {
    assert.deepEqual(computeEffectiveDiscount(none), {
      discountPct: 0,
      totalCents: 100_000,
      usesRewardCredit: false,
    });
  });

  it("gives a referral 10%", () => {
    assert.deepEqual(computeEffectiveDiscount({ ...none, hasValidReferral: true }), {
      discountPct: 10,
      totalCents: 90_000,
      usesRewardCredit: false,
    });
  });

  it("gives a reward credit 10% and consumes it", () => {
    assert.deepEqual(computeEffectiveDiscount({ ...none, rewardCreditAvailable: true }), {
      discountPct: 10,
      totalCents: 90_000,
      usesRewardCredit: true,
    });
  });
});

describe("discountPctFromTotals", () => {
  it("recovers the affiliate percentage from an order's totals", () => {
    assert.equal(discountPctFromTotals(100_000, 85_000), 15);
  });

  it("rounds a total that was itself rounded to the cent", () => {
    assert.equal(discountPctFromTotals(3_333, 2_833), 15);
    assert.equal(discountPctFromTotals(3_333, 2_916), 12.5);
  });

  it("keeps a rate set to one decimal", () => {
    assert.equal(discountPctFromTotals(100_000, 87_500), 12.5);
    assert.equal(discountPctFromTotals(100_000, 92_700), 7.3);
  });

  it("prints a whole rate with no decimal and a tenth with one", () => {
    assert.equal(`${discountPctFromTotals(100_000, 85_000)}%`, "15%");
    assert.equal(`${discountPctFromTotals(100_000, 87_500)}%`, "12.5%");
  });

  it("returns 0 for an empty subtotal rather than dividing by zero", () => {
    assert.equal(discountPctFromTotals(0, 0), 0);
  });
});
