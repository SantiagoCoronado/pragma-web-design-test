import { useTranslations } from "next-intl";
import { RevealCard } from "@/shared/components/motion/RevealCard";
import { CountUp } from "@/shared/components/motion/CountUp";

export function About() {
  const t = useTranslations("About");

  const pillars = [
    { title: t("diff1Title"), body: t("diff1Desc") },
    { title: t("diff2Title"), body: t("diff2Desc") },
    { title: t("diff3Title"), body: t("diff3Desc") },
  ];

  const stats = [
    { to: 50, suffix: "+", label: t("statProjects") },
    { to: 30, suffix: "+", label: t("statClients") },
    { to: 8, suffix: "+", label: t("statYears") },
  ];

  return (
    <section
      id="about"
      className="border-b border-pragma-border bg-pragma-surface px-6 md:px-14 py-20 md:py-24"
    >
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-pragma-subtext mb-5">
        {t("eyebrow")}
      </div>
      <h2
        className="font-display text-pragma-text max-w-[820px] text-balance m-0 mb-16 font-medium leading-[1.05] tracking-[-0.025em]"
        style={{ fontSize: "clamp(32px, 4.2vw, 48px)" }}
      >
        {t("titleLead")}{" "}
        <span className="text-pragma-subtext">{t("titleTrail")}</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mb-20">
        {pillars.map((p, i) => (
          <RevealCard
            key={p.title}
            delay={i * 100}
            className="border-t border-pragma-accent pt-5"
          >
            <h3 className="font-display text-[20px] font-medium tracking-[-0.01em] text-pragma-text mb-3">
              {p.title}
            </h3>
            <p className="text-[14px] leading-[1.55] text-pragma-subtext m-0">
              {p.body}
            </p>
          </RevealCard>
        ))}
      </div>

      <div className="border-t border-pragma-border pt-9 grid grid-cols-1 md:grid-cols-3 gap-10">
        {stats.map((s) => (
          <div key={s.label}>
            <div
              className="font-display text-pragma-text font-medium leading-[0.95] tracking-[-0.035em] mb-2.5"
              style={{ fontSize: "clamp(48px, 6.5vw, 72px)" }}
            >
              <CountUp to={s.to} suffix={s.suffix} />
            </div>
            <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-pragma-subtext">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
