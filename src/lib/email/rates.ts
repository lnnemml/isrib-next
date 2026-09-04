// Live BTC/LTC equivalents for the manual-transfer email — ported from the lander's
// crypto-rates.ts. Best-effort only: any failure (network, non-200, bad JSON) returns
// empty strings, and the template then falls back to a "$ equivalent — check rate"
// line. Never throws to the caller.

export async function getCryptoRates(amountUsd: number): Promise<{
  btcEquivalent: string;
  ltcEquivalent: string;
}> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,litecoin&vs_currencies=usd",
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error("CoinGecko error");
    const data = (await res.json()) as {
      bitcoin: { usd: number };
      litecoin: { usd: number };
    };
    const btc = (amountUsd / data.bitcoin.usd).toFixed(6);
    const ltc = (amountUsd / data.litecoin.usd).toFixed(4);
    return { btcEquivalent: btc, ltcEquivalent: ltc };
  } catch {
    return { btcEquivalent: "", ltcEquivalent: "" };
  }
}
