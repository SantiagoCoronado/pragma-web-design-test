import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-pragma-surface/30 border-t border-pragma-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="text-xl font-display font-bold text-pragma-accent">
              PRAGMA
            </span>
            <p className="mt-3 text-sm text-pragma-muted max-w-md">
              {t("tagline")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-pragma-text mb-3">
              {t("company")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#about"
                  className="text-sm text-pragma-muted hover:text-pragma-accent transition-colors"
                >
                  {t("about")}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-sm text-pragma-muted hover:text-pragma-accent transition-colors"
                >
                  {t("services")}
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-sm text-pragma-muted hover:text-pragma-accent transition-colors"
                >
                  {t("contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-pragma-text mb-3">
              {t("legal")}
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-pragma-muted">
                  {t("privacy")}
                </span>
              </li>
              <li>
                <span className="text-sm text-pragma-muted">
                  {t("terms")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-pragma-border">
          <p className="text-xs text-pragma-muted text-center">
            &copy; {year} PRAGMA. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
