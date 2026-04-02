import { notFound } from "next/navigation";
import { getQuoteById } from "@/features/quotes/lib/queries";
import { QuoteViewer } from "@/features/quotes/components/QuoteViewer";
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

  return <QuoteViewer quote={quote} />;
}
