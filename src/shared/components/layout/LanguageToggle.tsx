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
    <div className="flex items-center gap-2 font-mono text-[12px] text-pragma-subtext">
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={`cursor-pointer transition-colors ${
          locale === "en" ? "text-pragma-text" : "hover:text-pragma-text"
        }`}
      >
        EN
      </button>
      <span className="opacity-40">/</span>
      <button
        type="button"
        onClick={() => switchLocale("es")}
        className={`cursor-pointer transition-colors ${
          locale === "es" ? "text-pragma-text" : "hover:text-pragma-text"
        }`}
      >
        ES
      </button>
    </div>
  );
}
