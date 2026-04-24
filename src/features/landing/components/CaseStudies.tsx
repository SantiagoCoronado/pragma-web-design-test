import { useTranslations } from "next-intl";
import { RevealCard } from "@/shared/components/motion/RevealCard";

const CASES = [
  { key: "case1", stack: ["AI", "RAG", "Next.js"] },
  { key: "case2", stack: ["Automation", "Python", "Integrations"] },
  { key: "case3", stack: ["React", "Vercel", "Turso"] },
] as const;

export function CaseStudies() {
  const t = useTranslations("CaseStudies");

  return (
    <section
      id="case-studies"
      className="border-b border-pragma-border px-6 md:px-14 py-20 md:py-24"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 mb-14">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-pragma-subtext mb-5">
            {t("eyebrow")}
          </div>
          <h2
            className="font-display text-pragma-text m-0 text-balance font-medium leading-[1] tracking-[-0.025em]"
            style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
          >
            {t("title")}
          </h2>
        </div>
        <div className="font-mono text-[12px] text-pragma-subtext md:text-right">
          {t("selectedCount")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CASES.map((c, i) => (
          <RevealCard
            key={c.key}
            as="article"
            delay={i * 120}
            className="bg-pragma-surface border border-pragma-border rounded-[var(--radius-pragma-md)] p-7 flex flex-col min-h-[360px]"
          >
            <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-pragma-accent mb-5">
              {String(i + 1).padStart(2, "0")} — {t(`${c.key}.tag`)}
            </div>

            <div className="h-[120px] mb-6 bg-stripes border border-pragma-border flex items-center justify-center font-mono text-[10px] tracking-[0.1em] text-pragma-muted">
              {t("caseImage")}
            </div>

            <h3 className="font-display text-[20px] font-medium tracking-[-0.015em] text-pragma-text mb-3 text-balance">
              {t(`${c.key}.title`)}
            </h3>
            <p className="text-[13.5px] leading-[1.55] text-pragma-subtext text-pretty mb-5">
              {t(`${c.key}.description`)}
            </p>

            <div className="mt-auto flex flex-wrap gap-1.5">
              {c.stack.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] tracking-[0.05em] text-pragma-subtext border border-pragma-border px-2 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </RevealCard>
        ))}
      </div>
    </section>
  );
}
