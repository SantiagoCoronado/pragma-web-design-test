"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "./LanguageToggle";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const t = useTranslations("Navbar");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "#services", label: t("services") },
    { href: "#about", label: t("about") },
    { href: "#case-studies", label: t("caseStudies") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-pragma-bg/80 backdrop-blur-md border-b border-pragma-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-display font-bold text-pragma-accent">
              PRAGMA
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-pragma-muted hover:text-pragma-text transition-colors"
              >
                {link.label}
              </a>
            ))}
            <LanguageToggle />
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-pragma-muted hover:text-pragma-text cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-pragma-border/50">
            <div className="flex flex-col gap-3 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-pragma-muted hover:text-pragma-text transition-colors px-2"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
