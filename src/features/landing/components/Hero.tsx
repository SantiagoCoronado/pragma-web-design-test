"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/Button";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-grid bg-gradient-mesh overflow-hidden">
      {/* Floating accent orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pragma-accent/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-pragma-accent-2/5 rounded-full blur-3xl animate-float [animation-delay:2s]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
            {t("title")}
            <br />
            <span className="text-pragma-accent">{t("titleAccent")}</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-6 text-lg sm:text-xl text-pragma-muted max-w-2xl mx-auto"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#contact">
            <Button size="lg">
              {t("cta")}
              <ArrowRight size={18} />
            </Button>
          </a>
          <a href="#case-studies">
            <Button variant="secondary" size="lg">
              {t("ctaSecondary")}
            </Button>
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#services">
          <ChevronDown
            size={24}
            className="text-pragma-muted animate-bounce"
          />
        </a>
      </motion.div>
    </section>
  );
}
