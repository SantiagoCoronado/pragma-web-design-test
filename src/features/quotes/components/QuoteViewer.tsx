"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import type { Quote } from "../types";
import {
  formatCurrency,
  calculateLineItemTotal,
  calculateSubtotal,
  calculateTotal,
} from "../types";
import { acceptQuoteAction } from "../actions";
import { Download, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { track } from "@vercel/analytics";

const STATUS_VARIANTS = {
  draft: "default",
  sent: "cyan",
  accepted: "green",
  rejected: "red",
} as const;

function QuoteHeader({ quoteId }: { quoteId: string }) {
  const locale = useLocale();
  return (
    <header className="border-b border-pragma-border bg-pragma-bg/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <span className="font-display text-xl font-bold text-pragma-accent">
          PRAGMA
        </span>
        <div className="flex items-center gap-1 text-xs font-medium">
          <Link
            href={`/quote/${quoteId}`}
            locale="en"
            className={`px-2 py-1 rounded transition-colors ${locale === "en" ? "text-pragma-accent" : "text-pragma-muted hover:text-pragma-text"}`}
          >
            EN
          </Link>
          <span className="text-pragma-border">|</span>
          <Link
            href={`/quote/${quoteId}`}
            locale="es"
            className={`px-2 py-1 rounded transition-colors ${locale === "es" ? "text-pragma-accent" : "text-pragma-muted hover:text-pragma-text"}`}
          >
            ES
          </Link>
        </div>
      </div>
    </header>
  );
}

function QuoteActions({
  quote,
  accepting,
  onAccept,
}: {
  quote: Quote;
  accepting: boolean;
  onAccept: () => void;
}) {
  const t = useTranslations("Quote");
  return (
    <div className="flex flex-row flex-wrap gap-3 pt-4">
      <a
        href={`/api/quote/${quote.id}/pdf?variant=polish`}
        download
        onClick={() =>
          track("quote_pdf_download", {
            variant: "polish",
            quote_id: quote.id,
            quote_status: quote.status,
            locale: quote.locale,
          })
        }
        className="inline-flex self-start"
      >
        <Button variant="secondary" size="lg">
          <Download size={18} />
          {t("downloadPrint")}
        </Button>
      </a>
      <a
        href={`/api/quote/${quote.id}/pdf?variant=dark`}
        download
        onClick={() =>
          track("quote_pdf_download", {
            variant: "dark",
            quote_id: quote.id,
            quote_status: quote.status,
            locale: quote.locale,
          })
        }
        className="inline-flex self-start"
      >
        <Button variant="secondary" size="lg">
          <Download size={18} />
          {t("downloadScreen")}
        </Button>
      </a>
      {quote.status === "sent" && (
        <Button
          variant="success"
          size="lg"
          onClick={onAccept}
          disabled={accepting}
        >
          <CheckCircle2 size={18} />
          {accepting ? t("accepted") + "..." : t("acceptQuote")}
        </Button>
      )}
      {quote.status === "accepted" && (
        <Badge variant="green" className="px-4 py-2 text-sm">
          <CheckCircle2 size={16} className="mr-1" />
          {t("accepted")}
        </Badge>
      )}
    </div>
  );
}

function BlueprintViewer({
  quote,
  accepting,
  onAccept,
}: {
  quote: Quote;
  accepting: boolean;
  onAccept: () => void;
}) {
  const t = useTranslations("Quote");
  const dateFormatLocale = quote.locale === "es" ? "es-MX" : "en-US";

  return (
    <div className="min-h-screen bg-grid">
      <QuoteHeader quoteId={quote.id} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        {/* Title block */}
        <div>
          <Badge variant={STATUS_VARIANTS[quote.status]} className="mb-4">
            {t(quote.status)}
          </Badge>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            {quote.title}
          </h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-pragma-muted">
            <span>
              {t("quoteNumber")} #{quote.id}
            </span>
            <span>&middot;</span>
            <span>
              {t("date")}:{" "}
              {new Date(quote.createdAt).toLocaleDateString(dateFormatLocale)}
            </span>
            {quote.validUntil && (
              <>
                <span>&middot;</span>
                <span>
                  {t("validUntil")}: {quote.validUntil}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Client */}
        <Card>
          <h3 className="text-xs font-semibold text-pragma-muted uppercase tracking-wider mb-3">
            {t("preparedFor")}
          </h3>
          <p className="font-semibold">{quote.clientName}</p>
          {quote.clientCompany && (
            <p className="text-sm text-pragma-muted">{quote.clientCompany}</p>
          )}
          <p className="text-sm text-pragma-muted">{quote.clientEmail}</p>
        </Card>

        {/* Problem */}
        {quote.problem && (
          <div className="border-l-2 border-pragma-accent pl-4">
            <Card>
              <p className="text-xs font-semibold text-pragma-accent uppercase tracking-wider mb-3">
                {t("theProblem")}
              </p>
              <p className="text-sm text-pragma-text leading-relaxed">
                {quote.problem}
              </p>
            </Card>
          </div>
        )}

        {/* Opportunity */}
        {quote.opportunity && (
          <div className="border-l-2 border-pragma-accent pl-4">
            <Card>
              <p className="text-xs font-semibold text-pragma-accent uppercase tracking-wider mb-3">
                {t("theOpportunity")}
              </p>
              <p className="text-sm text-pragma-text leading-relaxed">
                {quote.opportunity}
              </p>
            </Card>
          </div>
        )}

        {quote.deliverables && quote.deliverables.length > 0 && (
          <>
            <hr className="border-pragma-border" />

            {/* Deliverables */}
            <div>
              <h3 className="text-xs font-semibold text-pragma-muted uppercase tracking-wider mb-4">
                {t("deliverables")}
              </h3>
              <div className="space-y-3">
                {quote.deliverables.map((d) => (
                  <Card key={d.id} className="flex gap-4 items-start">
                    <span className="text-2xl font-bold text-pragma-accent shrink-0 leading-none mt-0.5">
                      {d.number}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{d.title}</p>
                      <p className="text-sm text-pragma-muted mt-1">
                        {d.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        <hr className="border-pragma-border" />

        {/* Timeline + Investment */}
        <div className="flex flex-col sm:flex-row gap-4">
          {quote.timeline && (
            <Card className="flex-1">
              <p className="text-xs font-semibold text-pragma-muted uppercase tracking-wider mb-3">
                {t("timeline")}
              </p>
              <p className="text-2xl font-bold">{quote.timeline}</p>
            </Card>
          )}

          {quote.fixedPrice != null && (
            <Card className="flex-1 border border-pragma-accent/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
              <p className="text-xs font-semibold text-pragma-muted uppercase tracking-wider mb-3">
                {t("investment")}
              </p>
              {quote.listPrice != null && (
                <p className="text-sm text-pragma-muted line-through">
                  {formatCurrency(quote.listPrice, quote.currency, quote.locale)}
                </p>
              )}
              {quote.preferentialNote && (
                <p className="text-xs text-pragma-muted italic mb-1">
                  {quote.preferentialNote}
                </p>
              )}
              <p className="text-2xl font-bold text-pragma-accent">
                {formatCurrency(quote.fixedPrice, quote.currency, quote.locale)}
              </p>
              {quote.paymentTerms && (
                <p className="text-xs text-pragma-muted mt-2">
                  {quote.paymentTerms}
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Scope note */}
        {quote.scopeNote && (
          <p className="text-xs text-pragma-muted italic">{quote.scopeNote}</p>
        )}

        {/* Next Steps */}
        {quote.nextSteps && quote.nextSteps.length > 0 && (
          <Card>
            <p className="text-xs font-semibold text-pragma-muted uppercase tracking-wider mb-3">
              {t("nextSteps")}
            </p>
            <ol className="list-decimal list-inside space-y-2">
              {quote.nextSteps.map((step, i) => (
                <li key={i} className="text-sm text-pragma-text">
                  {step}
                </li>
              ))}
            </ol>
          </Card>
        )}

        <QuoteActions quote={quote} accepting={accepting} onAccept={onAccept} />
      </main>

      <footer className="border-t border-pragma-border mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-xs text-pragma-muted">{t("poweredBy")}</p>
        </div>
      </footer>
    </div>
  );
}

export function QuoteViewer({ quote }: { quote: Quote }) {
  const t = useTranslations("Quote");
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);

  async function handleAccept() {
    setAccepting(true);
    await acceptQuoteAction(quote.id);
    router.refresh();
  }

  if (quote.quoteType === "blueprint") {
    return (
      <BlueprintViewer
        quote={quote}
        accepting={accepting}
        onAccept={handleAccept}
      />
    );
  }

  // Line-items layout (original)
  const subtotal = calculateSubtotal(quote.lineItems);
  const discountAmount = subtotal * (quote.discount / 100);
  const total = calculateTotal(quote.lineItems, quote.discount);
  const dateFormatLocale = quote.locale === "es" ? "es-MX" : "en-US";

  return (
    <div className="min-h-screen bg-grid">
      <QuoteHeader quoteId={quote.id} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        {/* Status & Title */}
        <div>
          <Badge variant={STATUS_VARIANTS[quote.status]} className="mb-4">
            {t(quote.status)}
          </Badge>

          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            {quote.title}
          </h1>

          <div className="flex flex-wrap gap-3 mt-2 text-sm text-pragma-muted">
            <span>
              {t("quoteNumber")} #{quote.id}
            </span>
            <span>&middot;</span>
            <span>
              {t("date")}:{" "}
              {new Date(quote.createdAt).toLocaleDateString(dateFormatLocale)}
            </span>
            {quote.validUntil && (
              <>
                <span>&middot;</span>
                <span>
                  {t("validUntil")}: {quote.validUntil}
                </span>
              </>
            )}
          </div>

          {quote.description && (
            <p className="mt-4 text-pragma-muted">{quote.description}</p>
          )}
        </div>

        {/* Client Details */}
        <Card>
          <h3 className="text-xs font-semibold text-pragma-muted uppercase tracking-wider mb-3">
            {t("preparedFor")}
          </h3>
          <p className="font-semibold">{quote.clientName}</p>
          {quote.clientCompany && (
            <p className="text-sm text-pragma-muted">{quote.clientCompany}</p>
          )}
          <p className="text-sm text-pragma-muted">{quote.clientEmail}</p>
        </Card>

        {/* Line Items */}
        <Card className="overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-pragma-border">
                  <th className="pb-3 text-left text-xs font-medium text-pragma-muted uppercase tracking-wider">
                    {t("description")}
                  </th>
                  <th className="pb-3 text-right text-xs font-medium text-pragma-muted uppercase tracking-wider">
                    {t("qty")}
                  </th>
                  <th className="pb-3 text-right text-xs font-medium text-pragma-muted uppercase tracking-wider">
                    {t("unitPrice")}
                  </th>
                  <th className="pb-3 text-right text-xs font-medium text-pragma-muted uppercase tracking-wider">
                    {t("total")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pragma-border/30">
                {quote.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-sm">{item.description}</td>
                    <td className="py-3 text-sm text-right text-pragma-muted">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-sm text-right text-pragma-muted">
                      {formatCurrency(item.unitPrice, quote.currency, quote.locale)}
                    </td>
                    <td className="py-3 text-sm text-right">
                      {formatCurrency(
                        calculateLineItemTotal(item),
                        quote.currency,
                        quote.locale
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-4">
            {quote.lineItems.map((item) => (
              <div
                key={item.id}
                className="bg-pragma-bg/50 rounded-lg p-4"
              >
                <p className="font-medium text-sm">{item.description}</p>
                <div className="flex justify-between mt-2 text-sm text-pragma-muted">
                  <span>
                    {item.quantity} x{" "}
                    {formatCurrency(item.unitPrice, quote.currency, quote.locale)}
                  </span>
                  <span className="text-pragma-text">
                    {formatCurrency(
                      calculateLineItemTotal(item),
                      quote.currency,
                      quote.locale
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-pragma-border mt-4 pt-4">
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-pragma-muted">{t("subtotal")}:</span>
                <span>
                  {formatCurrency(subtotal, quote.currency, quote.locale)}
                </span>
              </div>
              {quote.discount > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-pragma-muted">
                    {t("discount")} ({quote.discount}%):
                  </span>
                  <span className="text-red-400">
                    -{formatCurrency(discountAmount, quote.currency, quote.locale)}
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-4 text-xl font-bold mt-2 px-4 py-3 rounded-lg border border-pragma-accent/30 shadow-[0_0_15px_rgba(0,240,255,0.12)]">
                <span>{t("total")}:</span>
                <span className="text-pragma-accent">
                  {formatCurrency(total, quote.currency, quote.locale)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {quote.notes && (
          <Card>
            <h3 className="text-xs font-semibold text-pragma-muted uppercase tracking-wider mb-3">
              {t("notes")}
            </h3>
            <p className="text-sm text-pragma-muted italic whitespace-pre-wrap">
              {quote.notes}
            </p>
          </Card>
        )}

        <QuoteActions quote={quote} accepting={accepting} onAccept={handleAccept} />
      </main>

      {/* Footer */}
      <footer className="border-t border-pragma-border mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-xs text-pragma-muted">{t("poweredBy")}</p>
        </div>
      </footer>
    </div>
  );
}
