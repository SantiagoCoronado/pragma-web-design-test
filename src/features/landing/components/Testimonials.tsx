import { useTranslations } from "next-intl";

const KEYS = ["q1", "q2", "q3"] as const;

export function Testimonials() {
  const t = useTranslations("Testimonials");

  return (
    <section className="border-b border-pragma-border px-6 md:px-14 py-20 md:py-24">
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-pragma-subtext mb-12">
        {t("eyebrow")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        {KEYS.map((k) => (
          <figure key={k} className="m-0">
            <blockquote className="text-[17px] md:text-[18px] leading-[1.45] tracking-[-0.01em] text-pragma-text text-pretty mb-6 m-0">
              <span className="text-pragma-accent mr-1">“</span>
              {t(`${k}.quote`)}
              <span className="text-pragma-accent ml-0.5">”</span>
            </blockquote>
            <figcaption className="border-t border-pragma-border pt-3.5">
              <div className="text-[14px] font-medium text-pragma-text">
                {t(`${k}.name`)}
              </div>
              <div className="font-mono text-[11px] tracking-[0.08em] text-pragma-subtext mt-1">
                {t(`${k}.role`)}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
