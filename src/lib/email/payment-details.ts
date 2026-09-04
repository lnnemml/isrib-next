// Anton's real payment coordinates — ported VERBATIM from the lander's
// buyer-confirmation.ts. DO NOT ALTER any address, email, or recipient name: funds sent
// to a mistyped address are unrecoverable. Manual-payment coordination only (ADR: no
// card fields / Pay-Now / Stripe).

export const PAYPAL = {
  email: "isrib.shop@protonmail.com",
  name: "Danylo Tsymbaliuk",
} as const;

export const USDT_TRC20_ADDRESS = "TDRnCaDUQQDRsZEQbBtMPKxa7MgHzuW5re";

export const BTC_ADDRESS = "bc1q4ujd2mfp6t6lcu3p2vlj4dxzs6rxhzzlcrh07m";

export const LTC_ADDRESS = "ltc1q27awh06ddvgma7pafsdk3sg5kny8f099zmewk7";
