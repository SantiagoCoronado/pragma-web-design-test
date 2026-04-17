"use server";

import { revalidatePath } from "next/cache";
import { quoteFormSchema } from "../lib/schemas";
import {
  createQuote,
  updateQuote,
  deleteQuote,
  updateQuoteStatus,
  getQuoteById,
} from "../lib/queries";
import { sendQuoteToClient } from "@/shared/lib/email";
import { isAuthenticated } from "@/features/auth/lib/auth";

function extractBlueprintFields(formData: FormData) {
  const deliverablesRaw = formData.get("deliverables") as string;
  const nextStepsRaw = formData.get("nextSteps") as string;
  const fixedPriceRaw = formData.get("fixedPrice") as string;
  const listPriceRaw = formData.get("listPrice") as string;

  return {
    problem: (formData.get("problem") as string) || undefined,
    opportunity: (formData.get("opportunity") as string) || undefined,
    deliverables: deliverablesRaw ? JSON.parse(deliverablesRaw) : undefined,
    timeline: (formData.get("timeline") as string) || undefined,
    fixedPrice: fixedPriceRaw ? parseFloat(fixedPriceRaw) : undefined,
    listPrice: listPriceRaw ? parseFloat(listPriceRaw) : undefined,
    preferentialNote: (formData.get("preferentialNote") as string) || undefined,
    paymentTerms: (formData.get("paymentTerms") as string) || undefined,
    nextSteps: nextStepsRaw ? JSON.parse(nextStepsRaw) : undefined,
    scopeNote: (formData.get("scopeNote") as string) || undefined,
  };
}

export async function createQuoteAction(formData: FormData) {
  if (!(await isAuthenticated())) return { error: "Unauthorized" };
  const raw = {
    clientName: formData.get("clientName") as string,
    clientEmail: formData.get("clientEmail") as string,
    clientCompany: (formData.get("clientCompany") as string) || "",
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || "",
    quoteType: (formData.get("quoteType") as string) || "line-items",
    lineItems: JSON.parse((formData.get("lineItems") as string) || "[]"),
    currency: (formData.get("currency") as string) || "MXN",
    discount: parseFloat((formData.get("discount") as string) || "0"),
    notes: (formData.get("notes") as string) || "",
    validUntil: (formData.get("validUntil") as string) || "",
    locale: (formData.get("locale") as string) || "en",
    status: (formData.get("status") as string) || "draft",
    ...extractBlueprintFields(formData),
  };

  const parsed = quoteFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const quote = await createQuote(parsed.data);
  revalidatePath("/[locale]/admin", "page");
  return { id: quote.id };
}

export async function updateQuoteAction(id: string, formData: FormData) {
  if (!(await isAuthenticated())) return { error: "Unauthorized" };
  const raw = {
    clientName: formData.get("clientName") as string,
    clientEmail: formData.get("clientEmail") as string,
    clientCompany: (formData.get("clientCompany") as string) || "",
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || "",
    quoteType: (formData.get("quoteType") as string) || "line-items",
    lineItems: JSON.parse((formData.get("lineItems") as string) || "[]"),
    currency: (formData.get("currency") as string) || "MXN",
    discount: parseFloat((formData.get("discount") as string) || "0"),
    notes: (formData.get("notes") as string) || "",
    validUntil: (formData.get("validUntil") as string) || "",
    locale: (formData.get("locale") as string) || "en",
    status: (formData.get("status") as string) || "draft",
    ...extractBlueprintFields(formData),
  };

  const parsed = quoteFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await updateQuote(id, parsed.data);
  revalidatePath("/[locale]/admin", "page");
  return { success: true };
}

export async function deleteQuoteAction(id: string) {
  if (!(await isAuthenticated())) return { error: "Unauthorized" };
  await deleteQuote(id);
  revalidatePath("/[locale]/admin", "page");
  return { success: true };
}

export async function acceptQuoteAction(id: string) {
  const quote = await getQuoteById(id);
  if (!quote) return { error: "Quote not found" };
  if (quote.status !== "sent") return { error: "Invalid state" };

  await updateQuoteStatus(id, "accepted");
  revalidatePath("/[locale]/quote/[id]", "page");
  return { success: true };
}

export async function sendQuoteAction(id: string, locale: string) {
  if (!(await isAuthenticated())) return { error: "Unauthorized" };
  const quote = await getQuoteById(id);
  if (!quote) return { error: "Quote not found" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://pragma-web-steel.vercel.app";
  const quoteUrl = `${baseUrl}/${locale}/quote/${id}`;

  await sendQuoteToClient({
    clientEmail: quote.clientEmail,
    clientName: quote.clientName,
    quoteTitle: quote.title,
    quoteUrl,
  });

  await updateQuoteStatus(id, "sent");
  revalidatePath("/[locale]/admin", "page");
  return { success: true };
}

export async function sendAiQuoteAction(id: string, locale: string) {
  if (!(await isAuthenticated())) return { error: "Unauthorized" };
  const quote = await getQuoteById(id);
  if (!quote) return { error: "Quote not found" };
  if (quote.quoteType !== "ai-generated") return { error: "Only AI-generated quotes can be sent" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://pragma-web-steel.vercel.app";
  const quoteUrl = `${baseUrl}/${locale}/quote/${id}`;

  await sendQuoteToClient({
    clientEmail: quote.clientEmail,
    clientName: quote.clientName,
    quoteTitle: quote.title,
    quoteUrl,
  });

  await updateQuoteStatus(id, "sent");
  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]/admin/quotes", "page");
  revalidatePath("/[locale]/admin/quotes/[id]", "page");
  return { success: true };
}
