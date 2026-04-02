"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: "en" | "es") {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-1 bg-pragma-surface border border-pragma-border rounded-lg p-0.5">
      <button
        onClick={() => switchLocale("en")}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
          locale === "en"
            ? "bg-pragma-accent text-pragma-bg"
            : "text-pragma-muted hover:text-pragma-text"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLocale("es")}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
          locale === "es"
            ? "bg-pragma-accent text-pragma-bg"
            : "text-pragma-muted hover:text-pragma-text"
        }`}
      >
        ES
      </button>
    </div>
  );
}
