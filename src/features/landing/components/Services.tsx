import { useTranslations } from "next-intl";

const SERVICE_KEYS = [
  "aiConsulting",
  "customAI",
  "automation",
  "analytics",
  "webDev",
  "uiux",
] as const;

export function Services() {
  const t = useTranslations("Services");

  return (
    <section
      id="services"
      className="border-b border-pragma-border px-6 md:px-14 py-20 md:py-24"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 mb-16">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-pragma-subtext mb-5">
            {t("eyebrow")}
          </div>
          <h2
            className="font-display text-pragma-text max-w-[780px] text-balance m-0 font-medium leading-[1] tracking-[-0.025em]"
            style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
          >
            {t("title")}
          </h2>
        </div>
      </div>

      <div className="border-t border-l border-pragma-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {SERVICE_KEYS.map((key, i) => (
          <div
            key={key}
            className="relative border-r border-b border-pragma-border p-7 md:p-8 min-h-[240px]"
          >
            <div className="font-mono text-[11px] tracking-[0.1em] text-pragma-accent mb-5">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="font-display text-[22px] font-medium tracking-[-0.015em] text-pragma-text mb-3.5 text-balance">
              {t(`${key}.title`)}
            </h3>
            <p className="text-[14px] leading-[1.55] text-pragma-subtext text-pretty m-0">
              {t(`${key}.description`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
