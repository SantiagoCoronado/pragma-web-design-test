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
import { deleteQuoteAction } from "../actions";
import { Copy, Pencil, Trash2, ExternalLink } from "lucide-react";
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

  function copyLink(id: string) {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/${locale}/quote/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
    <div className="overflow-x-auto">
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
              <td className="py-4 text-sm">
                {formatCurrency(
                  calculateTotal(quote.lineItems, quote.discount),
                  quote.currency,
                  locale
                )}
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
  );
}
