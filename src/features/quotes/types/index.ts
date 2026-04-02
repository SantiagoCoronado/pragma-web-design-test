export type QuoteType = "line-items" | "blueprint";

export interface Deliverable {
  id: string;
  number: number;
  title: string;
  description: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type Currency = "USD" | "EUR" | "MXN" | "COP";
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";
export type QuoteLocale = "en" | "es";

export interface Quote {
  id: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  title: string;
  description: string;
  quoteType: QuoteType;
  lineItems: LineItem[];
  currency: Currency;
  discount: number;
  notes: string;
  status: QuoteStatus;
  validUntil: string;
  locale: QuoteLocale;
  createdAt: string;
  updatedAt: string;
  // Blueprint-only fields
  problem?: string;
  opportunity?: string;
  deliverables?: Deliverable[];
  timeline?: string;
  fixedPrice?: number;
  listPrice?: number;
  preferentialNote?: string;
  paymentTerms?: string;
  nextSteps?: string[];
  scopeNote?: string;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "\u20AC",
  MXN: "$",
  COP: "$",
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: "USD ($)",
  EUR: "EUR (\u20AC)",
  MXN: "MXN ($)",
  COP: "COP ($)",
};

export function formatCurrency(
  amount: number,
  currency: Currency,
  locale: string = "en"
): string {
  return new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function calculateLineItemTotal(item: LineItem): number {
  return item.quantity * item.unitPrice;
}

export function calculateSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + calculateLineItemTotal(item), 0);
}

export function calculateTotal(items: LineItem[], discount: number): number {
  const subtotal = calculateSubtotal(items);
  return subtotal - subtotal * (discount / 100);
}
