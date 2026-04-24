"use client";

import { useTranslations } from "next-intl";
import { useMotionContext } from "./MotionProvider";

export function MotionToggle() {
  const t = useTranslations("Navbar");
  const { enabled, setEnabled } = useMotionContext();

  const options: { id: "on" | "off"; label: string }[] = [
    { id: "on", label: t("motionOn") },
    { id: "off", label: t("motionOff") },
  ];

  return (
    <div className="flex items-center border border-pragma-border font-mono text-[10px] tracking-[0.15em]">
      {options.map((opt) => {
        const active = enabled === (opt.id === "on");
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setEnabled(opt.id === "on")}
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
