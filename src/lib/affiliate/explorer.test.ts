import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { txExplorerUrl } from "./explorer";

const HASH = "a1b2c3";

describe("txExplorerUrl", () => {
  it("links the four known currencies", () => {
    assert.equal(txExplorerUrl("BTC", HASH), `https://mempool.space/tx/${HASH}`);
    assert.equal(txExplorerUrl("LTC", HASH), `https://litecoinspace.org/tx/${HASH}`);
    assert.equal(txExplorerUrl("ETH", HASH), `https://etherscan.io/tx/${HASH}`);
    assert.equal(txExplorerUrl("USDT-TRC20", HASH), `https://tronscan.org/#/transaction/${HASH}`);
  });

  it("ignores case and separators in the currency", () => {
    assert.equal(txExplorerUrl("usdt trc20", HASH), txExplorerUrl("USDT-TRC20", HASH));
  });

  it("gives no link for an unknown currency or a network-less USDT", () => {
    assert.equal(txExplorerUrl("USDT", HASH), null);
    assert.equal(txExplorerUrl("constructor", HASH), null);
  });

  it("gives no link for a hash that is not plain alphanumeric", () => {
    assert.equal(txExplorerUrl("BTC", "abc/../evil"), null);
    assert.equal(txExplorerUrl("BTC", ""), null);
  });
});
