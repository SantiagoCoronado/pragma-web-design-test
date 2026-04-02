"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/shared/components/ui/Card";
import { AnimateIn } from "@/shared/components/ui/AnimateIn";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: {
      en: "PRAGMA transformed our customer support with AI. The chatbot handles 80% of inquiries and our team can focus on complex cases.",
      es: "PRAGMA transformo nuestro soporte al cliente con IA. El chatbot maneja el 80% de las consultas y nuestro equipo puede enfocarse en casos complejos.",
    },
    author: "Maria Gonzalez",
    role: "CTO, FinServ",
  },
  {
    quote: {
      en: "Their pragmatic approach saved us months. No unnecessary complexity, just solutions that work and deliver real ROI.",
      es: "Su enfoque pragmatico nos ahorro meses. Sin complejidad innecesaria, solo soluciones que funcionan y entregan ROI real.",
    },
    author: "Carlos Rivera",
    role: "VP Engineering, LogiTech",
  },
  {
    quote: {
      en: "The web platform PRAGMA built for us is fast, beautiful, and exactly what our users needed. Highly recommended.",
      es: "La plataforma web que PRAGMA construyo para nosotros es rapida, hermosa y exactamente lo que nuestros usuarios necesitaban. Muy recomendados.",
    },
    author: "Ana Torres",
    role: "Product Manager, RetailCo",
  },
];

export function Testimonials() {
  const t = useTranslations("Testimonials");

  return (
    <section className="py-24 sm:py-32 bg-pragma-surface/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-16">
            {t("title")}
          </h2>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <AnimateIn key={testimonial.author} delay={i * 0.15}>
              <Card className="h-full flex flex-col">
                <Quote
                  size={24}
                  className="text-pragma-accent/30 mb-4 shrink-0"
                />
                <p className="text-sm text-pragma-muted leading-relaxed flex-1">
                  &ldquo;
                  {
                    testimonial.quote[
                      typeof window !== "undefined" &&
                      document.documentElement.lang === "es"
                        ? "es"
                        : "en"
                    ]
                  }
                  &rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-pragma-border/50">
                  <p className="font-semibold text-sm">{testimonial.author}</p>
                  <p className="text-xs text-pragma-muted">
                    {testimonial.role}
                  </p>
                </div>
              </Card>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
