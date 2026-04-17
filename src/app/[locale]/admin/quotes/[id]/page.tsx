import { notFound } from "next/navigation";
import { getQuoteById } from "@/features/quotes/lib/queries";
import { AdminQuoteActionBar } from "@/features/quotes/components/AdminQuoteActionBar";
import { AiQuoteShell } from "@/features/quotes/components/AiQuoteShell";
import { quoteRegistry } from "@/generated-quotes/registry";

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuoteById(id);

  if (!quote || quote.quoteType !== "ai-generated") {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-pragma-border bg-pragma-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <span className="font-display text-lg font-bold text-pragma-accent">
            PRAGMA
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Quote Details */}
          <div className="space-y-4">
            <div>
              <h1 className="font-display text-2xl font-bold mb-2">
                {quote.title}
              </h1>
              <p className="text-sm text-pragma-muted font-mono">#{quote.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="bg-pragma-surface/50 border border-pragma-border rounded-lg p-4">
                <p className="text-xs text-pragma-muted uppercase tracking-wider mb-1">
                  Client
                </p>
                <p className="font-medium">{quote.clientName}</p>
                {quote.clientCompany && (
                  <p className="text-sm text-pragma-muted">{quote.clientCompany}</p>
                )}
              </div>

              <div className="bg-pragma-surface/50 border border-pragma-border rounded-lg p-4">
                <p className="text-xs text-pragma-muted uppercase tracking-wider mb-1">
                  Email
                </p>
                <p className="font-medium text-sm break-all">{quote.clientEmail}</p>
              </div>

              <div className="bg-pragma-surface/50 border border-pragma-border rounded-lg p-4">
                <p className="text-xs text-pragma-muted uppercase tracking-wider mb-1">
                  Currency
                </p>
                <p className="font-medium">{quote.currency}</p>
              </div>

              <div className="bg-pragma-surface/50 border border-pragma-border rounded-lg p-4">
                <p className="text-xs text-pragma-muted uppercase tracking-wider mb-1">
                  Status
                </p>
                <p className="font-medium capitalize text-pragma-accent">{quote.status}</p>
              </div>
            </div>
          </div>

          {/* Quote Preview */}
          {(() => {
            const entry = quoteRegistry[quote.id];
            if (entry) {
              return (
                <div className="border border-pragma-border rounded-lg overflow-hidden bg-pragma-surface/50">
                  <h2 className="text-lg font-semibold p-6 pb-0">Preview</h2>
                  <AiQuoteShell quote={quote} QuoteContent={entry.QuoteContent} />
                </div>
              );
            }
            if (quote.generatedComponent) {
              return (
                <div className="border border-pragma-border rounded-lg p-6 bg-pragma-surface/50">
                  <h2 className="text-lg font-semibold mb-4">Preview</h2>
                  <p className="text-sm text-pragma-muted">
                    Component not yet deployed — commit the generated component and redeploy.
                  </p>
                </div>
              );
            }
            if (quote.rawContent) {
              return (
                <div className="border border-pragma-border rounded-lg p-6 bg-pragma-surface/50">
                  <h2 className="text-lg font-semibold mb-4">Content</h2>
                  <p className="whitespace-pre-wrap text-sm text-pragma-muted">
                    {quote.rawContent}
                  </p>
                </div>
              );
            }
            return null;
          })()}

          {/* Actions */}
          <div className="pt-6 border-t border-pragma-border">
            <AdminQuoteActionBar quoteId={quote.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
