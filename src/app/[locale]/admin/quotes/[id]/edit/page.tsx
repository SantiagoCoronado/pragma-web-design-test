import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getQuoteById } from "@/features/quotes/lib/queries";
import { QuoteForm } from "@/features/quotes/components/QuoteForm";
import { ArrowLeft } from "lucide-react";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("Admin");
  const quote = await getQuoteById(id);

  if (!quote) notFound();

  return (
    <div className="min-h-screen">
      <header className="border-b border-pragma-border bg-pragma-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link
            href="/admin"
            className="text-pragma-muted hover:text-pragma-text transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <span className="font-display text-lg font-bold text-pragma-accent">
              PRAGMA
            </span>
            <span className="text-pragma-muted text-sm ml-3">
              {t("editQuote")}
            </span>
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <QuoteForm quote={quote} />
      </main>
    </div>
  );
}
