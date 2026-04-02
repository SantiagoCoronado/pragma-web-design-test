"use client";

import { useTranslations } from "next-intl";
import { AnimateIn } from "@/shared/components/ui/AnimateIn";
import { CheckCircle2 } from "lucide-react";

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-display font-bold text-pragma-accent">
        {value}
      </div>
      <div className="text-sm text-pragma-muted mt-1">{label}</div>
    </div>
  );
}

export function About() {
  const t = useTranslations("About");

  const differentiators = [
    { title: t("diff1Title"), desc: t("diff1Desc") },
    { title: t("diff2Title"), desc: t("diff2Desc") },
    { title: t("diff3Title"), desc: t("diff3Desc") },
  ];

  return (
    <section id="about" className="py-24 sm:py-32 bg-pragma-surface/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: content */}
          <AnimateIn>
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">
                {t("title")}
              </h2>
              <p className="mt-4 text-pragma-muted leading-relaxed">
                {t("subtitle")}
              </p>

              <div className="mt-8 space-y-6">
                {differentiators.map((diff) => (
                  <div key={diff.title} className="flex gap-4">
                    <CheckCircle2
                      size={22}
                      className="text-pragma-accent shrink-0 mt-0.5"
                    />
                    <div>
                      <h3 className="font-semibold">{diff.title}</h3>
                      <p className="text-sm text-pragma-muted mt-1">
                        {diff.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>

          {/* Right: stats */}
          <AnimateIn delay={0.2}>
            <div className="bg-pragma-surface/50 backdrop-blur-sm border border-pragma-border rounded-2xl p-8 sm:p-12">
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                <StatBlock value="50+" label={t("statProjects")} />
                <StatBlock value="30+" label={t("statClients")} />
                <StatBlock value="8+" label={t("statYears")} />
              </div>

              {/* Decorative gradient line */}
              <div className="mt-8 h-px bg-gradient-to-r from-transparent via-pragma-accent/50 to-transparent" />

              <p className="mt-6 text-center text-sm text-pragma-muted font-mono">
                &lt;PRAGMA /&gt;
              </p>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
