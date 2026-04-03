"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { AnimateIn } from "@/shared/components/ui/AnimateIn";

interface CaseStudyData {
  titleKey: string;
  tags: string[];
  color: "cyan" | "purple" | "green";
}

const caseStudies: CaseStudyData[] = [
  {
    titleKey: "case1",
    tags: ["AI", "RAG", "Next.js"],
    color: "cyan",
  },
  {
    titleKey: "case2",
    tags: ["Automation", "Python", "Integrations"],
    color: "purple",
  },
  {
    titleKey: "case3",
    tags: ["React", "Vercel", "Turso"],
    color: "green",
  },
];

export function CaseStudies() {
  const t = useTranslations("CaseStudies");

  return (
    <section id="case-studies" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              {t("title")}
            </h2>
            <p className="mt-4 text-pragma-muted max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {caseStudies.map((cs, i) => (
            <AnimateIn key={cs.titleKey} delay={i * 0.15}>
              <Card hover className="h-full flex flex-col">
                {/* Gradient bar at top */}
                <div
                  className={`h-1 -mt-6 -mx-6 mb-6 rounded-t-xl ${
                    cs.color === "cyan"
                      ? "bg-gradient-to-r from-pragma-accent/60 to-pragma-accent/10"
                      : cs.color === "purple"
                        ? "bg-gradient-to-r from-pragma-accent-2/60 to-pragma-accent-2/10"
                        : "bg-gradient-to-r from-pragma-accent-3/60 to-pragma-accent-3/10"
                  }`}
                />

                <p className="text-xs text-pragma-muted font-mono uppercase tracking-wider mb-2">
                  {t(`${cs.titleKey}.client`)}
                </p>
                <h3 className="font-display text-lg font-semibold mb-3">
                  {t(`${cs.titleKey}.title`)}
                </h3>
                <p className="text-sm text-pragma-muted leading-relaxed flex-1">
                  {t(`${cs.titleKey}.description`)}
                </p>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-pragma-border/50">
                  {cs.tags.map((tag) => (
                    <Badge key={tag} variant={cs.color}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
