"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import type { Quote } from "../types";
import {
  formatCurrency,
  calculateTotal,
} from "../types";
import { deleteQuoteAction, sendQuoteAction } from "../actions";
import { Copy, Pencil, Trash2, ExternalLink, Send } from "lucide-react";
import { useState } from "react";

const STATUS_VARIANTS = {
  draft: "default",
  sent: "cyan",
  accepted: "green",
  rejected: "red",
} as const;

export function QuoteTable({ quotes }: { quotes: Quote[] }) {
  const t = useTranslations("Admin");
  const tq = useTranslations("Quote");
  const locale = useLocale();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);

  function copyLink(id: string) {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/${locale}/quote/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleSend(id: string) {
    setSendingId(id);
    const result = await sendQuoteAction(id, locale);
    setSendingId(null);
    if (result.success) {
      setSentId(id);
      setTimeout(() => setSentId(null), 2000);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure?")) {
      await deleteQuoteAction(id);
    }
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-16 text-pragma-muted">
        <p>{t("noQuotes")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="bg-pragma-surface/50 border border-pragma-border rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{quote.title}</p>
                <p className="text-xs text-pragma-muted font-mono">#{quote.id}</p>
              </div>
              <Badge variant={STATUS_VARIANTS[quote.status]} className="shrink-0">
                {tq(quote.status)}
              </Badge>
            </div>

            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-sm">{quote.clientName}</p>
                {quote.clientCompany && (
                  <p className="text-xs text-pragma-muted">{quote.clientCompany}</p>
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium mt-1 inline-block ${quote.quoteType === "blueprint" ? "bg-pragma-accent/10 text-pragma-accent" : "bg-pragma-surface text-pragma-muted"}`}>
                  {quote.quoteType === "blueprint" ? t("blueprintType") : t("lineItemsType")}
                </span>
              </div>
              <p className="text-sm font-semibold text-pragma-accent">
                {quote.quoteType === "blueprint"
                  ? formatCurrency(quote.fixedPrice ?? 0, quote.currency, locale)
                  : formatCurrency(calculateTotal(quote.lineItems, quote.discount), quote.currency, locale)}
              </p>
            </div>

            <div className="flex items-center gap-1 pt-3 border-t border-pragma-border/50">
              <Link href={`/quote/${quote.id}`} target="_blank">
                <Button variant="ghost" size="sm"><ExternalLink size={14} /></Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => copyLink(quote.id)}>
                <Copy size={14} />
                {copiedId === quote.id && (
                  <span className="text-xs text-pragma-accent-3">{t("linkCopied")}</span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSend(quote.id)}
                disabled={sendingId === quote.id}
              >
                <Send size={14} className="text-pragma-accent" />
                {sentId === quote.id && (
                  <span className="text-xs text-pragma-accent-3">{t("quoteSent")}</span>
                )}
              </Button>
              <Link href={`/admin/quotes/${quote.id}/edit`}>
                <Button variant="ghost" size="sm"><Pencil size={14} /></Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(quote.id)}>
                <Trash2 size={14} className="text-red-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-pragma-border text-left">
              <th className="pb-3 text-xs font-medium text-pragma-muted uppercase tracking-wider">
                {t("quoteTitle")}
              </th>
              <th className="pb-3 text-xs font-medium text-pragma-muted uppercase tracking-wider">
                {t("client")}
              </th>
              <th className="pb-3 text-xs font-medium text-pragma-muted uppercase tracking-wider">
                {t("quoteType")}
              </th>
              <th className="pb-3 text-xs font-medium text-pragma-muted uppercase tracking-wider">
                {t("amount")}
              </th>
              <th className="pb-3 text-xs font-medium text-pragma-muted uppercase tracking-wider">
                {t("status")}
              </th>
              <th className="pb-3 text-xs font-medium text-pragma-muted uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pragma-border/50">
            {quotes.map((quote) => (
              <tr key={quote.id} className="group">
                <td className="py-4">
                  <div>
                    <p className="font-medium text-sm">{quote.title}</p>
                    <p className="text-xs text-pragma-muted font-mono">
                      #{quote.id}
                    </p>
                  </div>
                </td>
                <td className="py-4">
                  <p className="text-sm">{quote.clientName}</p>
                  <p className="text-xs text-pragma-muted">
                    {quote.clientCompany}
                  </p>
                </td>
                <td className="py-4">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${quote.quoteType === "blueprint" ? "bg-pragma-accent/10 text-pragma-accent" : "bg-pragma-surface text-pragma-muted"}`}>
                    {quote.quoteType === "blueprint" ? t("blueprintType") : t("lineItemsType")}
                  </span>
                </td>
                <td className="py-4 text-sm">
                  {quote.quoteType === "blueprint"
                    ? formatCurrency(quote.fixedPrice ?? 0, quote.currency, locale)
                    : formatCurrency(calculateTotal(quote.lineItems, quote.discount), quote.currency, locale)}
                </td>
                <td className="py-4">
                  <Badge variant={STATUS_VARIANTS[quote.status]}>
                    {tq(quote.status)}
                  </Badge>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-1">
                    <Link href={`/quote/${quote.id}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <ExternalLink size={14} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyLink(quote.id)}
                    >
                      <Copy size={14} />
                      {copiedId === quote.id && (
                        <span className="text-xs text-pragma-accent-3">
                          {t("linkCopied")}
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSend(quote.id)}
                      disabled={sendingId === quote.id}
                      title={t("sendToClient")}
                    >
                      <Send size={14} className="text-pragma-accent" />
                      {sentId === quote.id && (
                        <span className="text-xs text-pragma-accent-3">
                          {t("quoteSent")}
                        </span>
                      )}
                    </Button>
                    <Link href={`/admin/quotes/${quote.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(quote.id)}
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
