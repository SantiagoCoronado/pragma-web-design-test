import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  const companyLinks = [
    t("companyLinks.about"),
    t("companyLinks.services"),
    t("companyLinks.contact"),
  ];
  const legalLinks = [t("legalLinks.privacy"), t("legalLinks.terms")];
  const followLinks = [
    t("followLinks.linkedin"),
    t("followLinks.github"),
    t("followLinks.x"),
  ];

  return (
    <footer className="bg-pragma-bg px-6 md:px-14 pt-14 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 md:gap-12 mb-12">
        <div>
          <div className="font-mono text-[18px] font-semibold tracking-[0.12em] text-pragma-text mb-4">
            PRAGMA<span className="text-pragma-accent">.</span>
          </div>
          <p className="text-[14px] text-pragma-subtext max-w-[320px] leading-[1.55]">
            {t("tagline")}
          </p>
        </div>
        {(
          [
            [t("company"), companyLinks],
            [t("legal"), legalLinks],
            [t("follow"), followLinks],
          ] as const
        ).map(([heading, items]) => (
          <div key={heading}>
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-pragma-subtext mb-4">
              {heading}
            </div>
            <div className="grid gap-2 text-[14px] text-pragma-text">
              {items.map((i) => (
                <div key={i}>{i}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-pragma-border pt-5 flex flex-col md:flex-row md:justify-between gap-2 font-mono text-[11px] tracking-[0.08em] uppercase text-pragma-subtext">
        <span>{t("rights", { year })}</span>
        <span>{t("coords")}</span>
      </div>
    </footer>
  );
}
