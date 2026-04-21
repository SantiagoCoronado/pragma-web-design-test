"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/Button";
import type { ComponentType } from "react";
import type { Quote } from "../types";
import { acceptQuoteAction } from "../actions";
import { Download, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/shared/components/ui/Badge";
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

interface AiQuoteShellProps {
  quote: Quote;
  QuoteContent: ComponentType<{ quote: Quote }>;
}

export function AiQuoteShell({ quote, QuoteContent }: AiQuoteShellProps) {
  const t = useTranslations("Quote");
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);

  async function handleAccept() {
    setAccepting(true);
    await acceptQuoteAction(quote.id);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-grid">
      <QuoteHeader quoteId={quote.id} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Status badge */}
        <div className="mb-6">
          <Badge variant={STATUS_VARIANTS[quote.status]} className="mb-4">
            {t(quote.status)}
          </Badge>
        </div>

        {/* Render the AI-generated quote content */}
        <div className="space-y-6 mb-8">
          <QuoteContent quote={quote} />
        </div>

        {/* Actions */}
        <QuoteActions quote={quote} accepting={accepting} onAccept={handleAccept} />
      </main>

      {/* Footer */}
      <footer className="border-t border-pragma-border mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center space-y-2">
          <p className="text-xs text-pragma-muted">{t("poweredBy")}</p>
          {quote.validUntil && (
            <p className="text-xs text-pragma-muted">
              {t("validUntil")}: {quote.validUntil}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
