"use client";

import { useTranslations } from "next-intl";
import { useTheme, type Theme } from "./ThemeProvider";

export function ThemeToggle() {
  const t = useTranslations("Navbar");
  const { theme, setTheme } = useTheme();

  const options: { id: Theme; label: string }[] = [
    { id: "space", label: t("themeSpace") },
    { id: "signal", label: t("themeSignal") },
  ];

  return (
    <div className="flex items-center border border-pragma-border font-mono text-[10px] tracking-[0.15em]">
      {options.map((opt) => {
        const active = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            aria-pressed={active}
            className={`px-3 py-1.5 cursor-pointer transition-colors ${
              active
                ? "bg-pragma-accent text-pragma-on-accent"
                : "bg-transparent text-pragma-subtext hover:text-pragma-text"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
