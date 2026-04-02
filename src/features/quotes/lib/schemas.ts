import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Price must be positive"),
});

export const deliverableSchema = z.object({
  id: z.string(),
  number: z.number().min(1),
  title: z.string().min(1, "Deliverable title is required"),
  description: z.string().min(1, "Deliverable description is required"),
});

export const quoteFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Valid email is required"),
  clientCompany: z.string().default(""),
  title: z.string().min(1, "Quote title is required"),
  description: z.string().default(""),
  quoteType: z.enum(["line-items", "blueprint"]).default("line-items"),
  lineItems: z.array(lineItemSchema).default([]),
  currency: z.enum(["USD", "EUR", "MXN", "COP"]),
  discount: z.number().min(0).max(100).default(0),
  notes: z.string().default(""),
  validUntil: z.string().default(""),
  locale: z.enum(["en", "es"]).default("en"),
  status: z.enum(["draft", "sent", "accepted", "rejected"]).default("draft"),
  // Blueprint-only fields
  problem: z.string().optional(),
  opportunity: z.string().optional(),
  deliverables: z.array(deliverableSchema).optional(),
  timeline: z.string().optional(),
  fixedPrice: z.number().optional(),
  listPrice: z.number().optional(),
  preferentialNote: z.string().optional(),
  paymentTerms: z.string().optional(),
  nextSteps: z.array(z.string()).optional(),
  scopeNote: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;
