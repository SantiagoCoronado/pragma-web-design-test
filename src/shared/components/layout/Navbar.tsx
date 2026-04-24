"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "@/shared/components/theme/ThemeToggle";
import { MotionToggle } from "@/shared/components/motion/MotionToggle";
import { useMotionActive } from "@/shared/components/motion/MotionProvider";

export function Navbar() {
  const t = useTranslations("Navbar");
  const [mobileOpen, setMobileOpen] = useState(false);
  const motionActive = useMotionActive();

  const navLinks = [
    { href: "#services", label: t("services") },
    { href: "#about", label: t("about") },
    { href: "#case-studies", label: t("caseStudies") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-pragma-bg border-b border-pragma-border">
      <div className="flex items-center justify-between px-6 md:px-14 h-16">
        <Link
          href="/"
          className="font-mono text-[15px] font-semibold tracking-[0.12em] text-pragma-text"
        >
          PRAGMA
          <span
            className="text-pragma-accent ml-0.5"
            style={
              motionActive
                ? { animation: "pragmaBlink 1.2s steps(1) infinite" }
                : undefined
            }
          >
            .
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-[13px] text-pragma-subtext">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-pragma-text transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <MotionToggle />
          <ThemeToggle />
          <LanguageToggle />
        </div>

        {/* Mobile: always show toggles + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <MotionToggle />
          <ThemeToggle />
          <LanguageToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="font-mono text-[11px] tracking-[0.15em] text-pragma-subtext hover:text-pragma-text cursor-pointer px-2 py-1 border border-pragma-border"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "CLOSE" : "MENU"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-pragma-border bg-pragma-bg">
          <div className="flex flex-col px-6 py-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-[13px] text-pragma-subtext hover:text-pragma-text transition-colors py-3 border-b border-pragma-border last:border-b-0"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
