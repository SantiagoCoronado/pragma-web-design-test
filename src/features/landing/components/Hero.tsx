import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/Button";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative border-b border-pragma-border px-6 md:px-14 pt-20 md:pt-24 pb-20">
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-pragma-subtext mb-7 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-pragma-accent" />
        {t("availability")}
      </div>

      <h1
        className="font-display text-pragma-text max-w-[90%] text-balance m-0 mb-9 font-medium leading-[0.98] tracking-[-0.035em]"
        style={{ fontSize: "clamp(44px, 8vw, 96px)" }}
      >
        {t("titleLine1")} <br />
        {t("titleLine2")} <br />
        <span className="text-pragma-accent">{t("titleAccent")}</span>{" "}
        {t("titleLine3")}
      </h1>

      <p className="text-[17px] md:text-[19px] leading-[1.5] text-pragma-subtext max-w-[640px] text-pretty mb-11">
        {t("subtitle")}
      </p>

      <div className="flex flex-wrap gap-3">
        <a href="#contact">
          <Button variant="primary" size="lg">
            {t("cta")}
          </Button>
        </a>
        <a href="#case-studies">
          <Button variant="secondary" size="lg">
            {t("ctaSecondary")}
          </Button>
        </a>
      </div>

      <div className="hidden lg:block absolute right-14 top-24 text-right font-mono text-[11px] tracking-[0.1em] text-pragma-muted">
        <div>{t("markA")}</div>
        <div>{t("markB")}</div>
      </div>
    </section>
  );
}
