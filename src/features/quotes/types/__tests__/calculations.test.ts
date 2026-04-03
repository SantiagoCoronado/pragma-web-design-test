import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  calculateLineItemTotal,
  calculateSubtotal,
  calculateTotal,
} from "../index";
import type { LineItem } from "../index";

// ─── formatCurrency ──────────────────────────────────────────────────────────

describe("formatCurrency", () => {
  it("formats USD in en locale", () => {
    expect(formatCurrency(1500, "USD", "en")).toBe("$1,500.00");
  });

  it("formats MXN in es locale", () => {
    const result = formatCurrency(35000, "MXN", "es");
    // es-MX uses $ symbol for MXN
    expect(result).toContain("35,000.00");
  });

  it("formats EUR with € symbol", () => {
    const result = formatCurrency(999.99, "EUR", "en");
    expect(result).toContain("999.99");
    expect(result).toContain("€");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0, "USD", "en")).toBe("$0.00");
  });

  it("formats large numbers with thousand separators", () => {
    expect(formatCurrency(1000000, "USD", "en")).toBe("$1,000,000.00");
  });

  it("defaults to en locale when locale is not es", () => {
    const withEn = formatCurrency(500, "USD", "en");
    const withOther = formatCurrency(500, "USD", "fr");
    expect(withEn).toBe(withOther);
  });
});

// ─── calculateLineItemTotal ───────────────────────────────────────────────────

describe("calculateLineItemTotal", () => {
  const makeItem = (quantity: number, unitPrice: number): LineItem => ({
    id: "test",
    description: "Test item",
    quantity,
    unitPrice,
  });

  it("multiplies quantity by unit price", () => {
    expect(calculateLineItemTotal(makeItem(3, 100))).toBe(300);
  });

  it("handles quantity of 1", () => {
    expect(calculateLineItemTotal(makeItem(1, 5000))).toBe(5000);
  });

  it("handles decimal unit prices", () => {
    expect(calculateLineItemTotal(makeItem(2, 99.99))).toBeCloseTo(199.98);
  });

  it("returns 0 for zero unit price", () => {
    expect(calculateLineItemTotal(makeItem(5, 0))).toBe(0);
  });
});

// ─── calculateSubtotal ───────────────────────────────────────────────────────

describe("calculateSubtotal", () => {
  it("sums all line item totals", () => {
    const items: LineItem[] = [
      { id: "a", description: "A", quantity: 2, unitPrice: 100 },
      { id: "b", description: "B", quantity: 1, unitPrice: 500 },
      { id: "c", description: "C", quantity: 3, unitPrice: 50 },
    ];
    // 200 + 500 + 150 = 850
    expect(calculateSubtotal(items)).toBe(850);
  });

  it("returns 0 for empty items array", () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it("handles a single item", () => {
    const items: LineItem[] = [
      { id: "a", description: "A", quantity: 4, unitPrice: 250 },
    ];
    expect(calculateSubtotal(items)).toBe(1000);
  });
});

// ─── calculateTotal ───────────────────────────────────────────────────────────

describe("calculateTotal", () => {
  const items: LineItem[] = [
    { id: "a", description: "A", quantity: 1, unitPrice: 1000 },
  ];

  it("returns subtotal when discount is 0", () => {
    expect(calculateTotal(items, 0)).toBe(1000);
  });

  it("applies 10% discount correctly", () => {
    expect(calculateTotal(items, 10)).toBe(900);
  });

  it("applies 100% discount (free)", () => {
    expect(calculateTotal(items, 100)).toBe(0);
  });

  it("applies 15% discount to multi-item cart", () => {
    const cart: LineItem[] = [
      { id: "a", description: "A", quantity: 2, unitPrice: 5000 },
      { id: "b", description: "B", quantity: 1, unitPrice: 2000 },
    ];
    // subtotal = 12000, 15% off = 1800, total = 10200
    expect(calculateTotal(cart, 15)).toBe(10200);
  });

  it("returns 0 for empty cart", () => {
    expect(calculateTotal([], 20)).toBe(0);
  });
});
