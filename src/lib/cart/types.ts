// Cart line-item shape (ADR 0008). Money is integer cents; `format` (powder|capsules)
// is explicit and `sizeLabel` carries the human size ("2g", "50 × 20mg") — so there is
// no mg→g conversion (the legacy `grams`-in-mg bug is designed out).
export type CartFormat = "powder" | "capsules";

export interface CartLine {
  productSlug: string;
  format: CartFormat;
  quantity: number;
  sizeLabel: string;
  linePriceCents: number; // price for ONE unit of this size/format
}

// A line as exposed to consumers, with a stable identity key.
export interface CartLineWithKey extends CartLine {
  key: string;
}

// Identity of a line: same product + format + size merges into one line.
export function cartLineKey(line: Pick<CartLine, "productSlug" | "format" | "sizeLabel">): string {
  return `${line.productSlug}::${line.format}::${line.sizeLabel}`;
}
