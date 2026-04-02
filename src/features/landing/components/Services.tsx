"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/shared/components/ui/Card";
import { AnimateIn } from "@/shared/components/ui/AnimateIn";
import {
  Brain,
  Cpu,
  Zap,
  BarChart3,
  Globe,
  Palette,
} from "lucide-react";
import type { ReactNode } from "react";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay: number;
}

function ServiceCard({ icon, title, description, delay }: ServiceCardProps) {
  return (
    <AnimateIn delay={delay}>
      <Card hover className="h-full group">
        <div className="text-pragma-accent mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-pragma-muted leading-relaxed">
          {description}
        </p>
      </Card>
    </AnimateIn>
  );
}

export function Services() {
  const t = useTranslations("Services");

  const services = [
    {
      icon: <Brain size={32} />,
      titleKey: "aiConsulting" as const,
    },
    {
      icon: <Cpu size={32} />,
      titleKey: "customAI" as const,
    },
    {
      icon: <Zap size={32} />,
      titleKey: "automation" as const,
    },
    {
      icon: <BarChart3 size={32} />,
      titleKey: "analytics" as const,
    },
    {
      icon: <Globe size={32} />,
      titleKey: "webDev" as const,
    },
    {
      icon: <Palette size={32} />,
      titleKey: "uiux" as const,
    },
  ];

  return (
    <section id="services" className="py-24 sm:py-32">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <ServiceCard
              key={service.titleKey}
              icon={service.icon}
              title={t(`${service.titleKey}.title`)}
              description={t(`${service.titleKey}.description`)}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
