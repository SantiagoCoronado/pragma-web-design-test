"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useRef } from "react";

export function QuoteFilters({
  currentSearch,
  currentStatus,
  currentType,
}: {
  currentSearch?: string;
  currentStatus?: string;
  currentType?: string;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  const hasFilters = currentSearch || currentStatus || currentType;

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <form
        ref={formRef}
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          updateParams("search", (fd.get("search") as string) || "");
        }}
      >
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-pragma-muted"
        />
        <input
          name="search"
          type="text"
          placeholder={t("searchPlaceholder")}
          defaultValue={currentSearch || ""}
          className="w-full pl-9 pr-4 py-2 bg-pragma-surface border border-pragma-border rounded-lg text-sm text-pragma-text placeholder:text-pragma-muted focus:outline-none focus:border-pragma-accent/50"
        />
      </form>

      <select
        value={currentStatus || ""}
        onChange={(e) => updateParams("status", e.target.value)}
        className="px-3 py-2 bg-pragma-surface border border-pragma-border rounded-lg text-sm text-pragma-text focus:outline-none focus:border-pragma-accent/50"
      >
        <option value="">{t("allStatuses")}</option>
        <option value="draft">{t("statusDraft")}</option>
        <option value="sent">{t("statusSent")}</option>
        <option value="accepted">{t("statusAccepted")}</option>
        <option value="rejected">{t("statusRejected")}</option>
      </select>

      <select
        value={currentType || ""}
        onChange={(e) => updateParams("type", e.target.value)}
        className="px-3 py-2 bg-pragma-surface border border-pragma-border rounded-lg text-sm text-pragma-text focus:outline-none focus:border-pragma-accent/50"
      >
        <option value="">{t("allTypes")}</option>
        <option value="line-items">{t("lineItemsType")}</option>
        <option value="blueprint">{t("blueprintType")}</option>
      </select>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-3 py-2 text-sm text-pragma-muted hover:text-pragma-text transition-colors"
        >
          <X size={14} />
          {t("clearFilters")}
        </button>
      )}
    </div>
  );
}
