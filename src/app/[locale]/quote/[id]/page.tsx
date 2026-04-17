import { notFound } from "next/navigation";
import { getQuoteById } from "@/features/quotes/lib/queries";
import { QuoteViewer } from "@/features/quotes/components/QuoteViewer";
import { AiQuoteShell } from "@/features/quotes/components/AiQuoteShell";
import { quoteRegistry } from "@/generated-quotes/registry";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function QuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuoteById(id);

  if (!quote) notFound();

  // Handle AI-generated quotes
  if (quote.quoteType === "ai-generated") {
    const entry = quoteRegistry[quote.id];
    if (!entry) notFound();
    return <AiQuoteShell quote={quote} QuoteContent={entry.QuoteContent} />;
  }

  // Default to legacy QuoteViewer for line-items and blueprint types
  return <QuoteViewer quote={quote} />;
}
