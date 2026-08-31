"use client";

// THE ONLY cart API. The localStorage key and every read/write live here — no component
// touches storage directly; they all go through useCart(). Single source of truth via
// Context + useReducer so the header badge and cart page update live from one store.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { cartLineKey, type CartFormat, type CartLine, type CartLineWithKey } from "./types";

// Bumped from the legacy "isrib_cart": the line-item shape changed (cents + sizeLabel,
// not dollars + mg), so old data is not forward-compatible.
const STORAGE_KEY = "isrib_cart_v2";

type Action =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; line: CartLine }
  | { type: "update"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "clear" };

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;
    case "add": {
      const key = cartLineKey(action.line);
      const idx = state.findIndex((l) => cartLineKey(l) === key);
      if (idx >= 0) {
        const next = state.slice();
        next[idx] = { ...next[idx], quantity: next[idx].quantity + action.line.quantity };
        return next;
      }
      return [...state, action.line];
    }
    case "update":
      return state.map((l) =>
        cartLineKey(l) === action.key ? { ...l, quantity: Math.max(1, action.quantity) } : l,
      );
    case "remove":
      return state.filter((l) => cartLineKey(l) !== action.key);
    case "clear":
      return [];
    default:
      return state;
  }
}

function isCartLine(v: unknown): v is CartLine {
  if (typeof v !== "object" || v === null) return false;
  const l = v as Record<string, unknown>;
  return (
    typeof l.productSlug === "string" &&
    (l.format === "powder" || l.format === "capsules") &&
    typeof l.quantity === "number" &&
    typeof l.sizeLabel === "string" &&
    typeof l.linePriceCents === "number"
  );
}

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Ignore anything that doesn't match the current shape (e.g. legacy data).
    return parsed.filter(isCartLine);
  } catch {
    return [];
  }
}

function saveCart(lines: CartLine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // ignore write failures (private mode, quota, etc.)
  }
}

export interface CartApi {
  lines: CartLineWithKey[];
  count: number;
  subtotalCents: number;
  addLine: (line: CartLine) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, [] as CartLine[]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from storage after mount — server + first client render stay empty (no
  // hydration mismatch).
  useEffect(() => {
    dispatch({ type: "hydrate", lines: loadCart() });
    setHydrated(true);
  }, []);

  // Persist only after hydration, so the initial empty state never clobbers storage.
  useEffect(() => {
    if (hydrated) saveCart(state);
  }, [state, hydrated]);

  const api = useMemo<CartApi>(() => {
    const lines: CartLineWithKey[] = state.map((l) => ({ ...l, key: cartLineKey(l) }));
    return {
      lines,
      count: state.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: state.reduce((n, l) => n + l.linePriceCents * l.quantity, 0),
      addLine: (line) => dispatch({ type: "add", line: { ...line, quantity: line.quantity || 1 } }),
      updateQuantity: (key, quantity) => dispatch({ type: "update", key, quantity }),
      removeLine: (key) => dispatch({ type: "remove", key }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [state]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}

export type { CartFormat, CartLine };
