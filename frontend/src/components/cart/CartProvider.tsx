import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product, Variant } from "../../types";

export interface CartLine {
  product: Product;
  variant: Variant;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  addItem: (product: Product, variant: Variant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

// In-memory only — no localStorage, per the no-browser-storage constraint
// for artifacts; for a real deployed site this is fine too since losing
// the cart on a hard refresh is a minor inconvenience, not data loss.
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  function addItem(product: Product, variant: Variant, quantity = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.variant.id === variant.id);
      if (existing) {
        return prev.map((l) =>
          l.variant.id === variant.id ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      return [...prev, { product, variant, quantity }];
    });
  }

  function removeItem(variantId: string) {
    setLines((prev) => prev.filter((l) => l.variant.id !== variantId));
  }

  function updateQuantity(variantId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setLines((prev) => prev.map((l) => (l.variant.id === variantId ? { ...l, quantity } : l)));
  }

  function clear() {
    setLines([]);
  }

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  return (
    <CartContext.Provider value={{ lines, addItem, removeItem, updateQuantity, clear, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
