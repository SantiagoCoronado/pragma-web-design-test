"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/Button";
import { deleteQuoteAction, sendAiQuoteAction } from "../actions";
import { Copy, Trash2, Send, ArrowLeft } from "lucide-react";
import { useState } from "react";

export function AdminQuoteActionBar({ quoteId }: { quoteId: string }) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function copyLink() {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/${locale}/quote/${quoteId}`);
    setCopiedId(quoteId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleSend() {
    setSendingId(quoteId);
    const result = await sendAiQuoteAction(quoteId, locale);
    setSendingId(null);
    if (result.success) {
      setSentId(quoteId);
      setTimeout(() => setSentId(null), 2000);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (confirm(t("deleteConfirm") || "Are you sure?")) {
      setDeletingId(quoteId);
      await deleteQuoteAction(quoteId);
      router.push("/admin");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Link href="/admin/quotes">
        <Button variant="secondary">
          <ArrowLeft size={16} />
          {t("backToQuotes")}
        </Button>
      </Link>

      <Button
        variant="secondary"
        onClick={copyLink}
      >
        <Copy size={16} />
        {copiedId === quoteId ? t("linkCopied") : t("copyLink")}
      </Button>

      <Button
        onClick={handleSend}
        disabled={sendingId === quoteId}
      >
        <Send size={16} />
        {sendingId === quoteId ? t("sending") + "..." : t("sendToClient")}
      </Button>

      <Button
        variant="danger"
        onClick={handleDelete}
        disabled={deletingId === quoteId}
      >
        <Trash2 size={16} />
        {t("deleteQuote")}
      </Button>

      {sentId === quoteId && (
        <span className="text-xs text-pragma-accent-3 px-3 py-2">
          {t("quoteSent")}
        </span>
      )}
    </div>
  );
}
