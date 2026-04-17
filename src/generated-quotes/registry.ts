import { ComponentType } from "react";
import { Quote } from "@/features/quotes/types";
import { QuoteContent as QuoteContent_47sJ8SiMdN } from "./Quote_47sJ8SiMdN/QuoteContent";
import { QuotePDF as QuotePDF_47sJ8SiMdN } from "./Quote_47sJ8SiMdN/QuotePDF";

/**
 * Component for rendering the quote content section.
 * Receives the quote object as a prop.
 */
export type QuoteContent = ComponentType<{ quote: Quote }>;

/**
 * Component for rendering the quote as a PDF-ready document.
 * Receives the quote object as a prop.
 */
export type QuotePDF = ComponentType<{ quote: Quote }>;

/**
 * Registry entry for a single generated quote.
 * Contains both the content view and PDF view components.
 */
export interface QuoteRegistryEntry {
  QuoteContent: QuoteContent;
  QuotePDF: QuotePDF;
}

/**
 * Global registry of AI-generated quote components.
 * Populated by the generation pipeline at build time.
 * Each quote ID maps to its corresponding entry with content and PDF components.
 */
export const quoteRegistry: Record<string, QuoteRegistryEntry> = {
  "47sJ8SiMdN": {
    QuoteContent: QuoteContent_47sJ8SiMdN,
    QuotePDF: QuotePDF_47sJ8SiMdN,
  },
};
