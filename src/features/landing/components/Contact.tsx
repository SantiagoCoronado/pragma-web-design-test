"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { useToast } from "@/shared/components/ui/Toaster";
import { submitContactAction } from "@/features/landing/actions";

type Status = "idle" | "sending" | "success" | "error";

export function Contact() {
  const t = useTranslations("Contact");
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");

    const result = await submitContactAction(new FormData(form));
    if (result.success) {
      setStatus("success");
      toast(t("success"), "success");
      form.reset();
      setTimeout(() => setStatus("idle"), 4000);
    } else {
      setStatus("error");
      toast(t("error"), "error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return (
    <section
      id="contact"
      className="border-b border-pragma-border bg-pragma-surface px-6 md:px-14 py-20 md:py-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-14 lg:gap-20">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-pragma-subtext mb-5">
            {t("eyebrow")}
          </div>
          <h2
            className="font-display text-pragma-text text-balance m-0 mb-7 font-medium leading-[1] tracking-[-0.03em]"
            style={{ fontSize: "clamp(36px, 6vw, 64px)" }}
          >
            {t("title")}
          </h2>
          <p className="text-[17px] leading-[1.5] text-pragma-subtext max-w-[480px] mb-10">
            {t("subtitle")}
          </p>

          <div className="grid gap-5">
            <div className="border-t border-pragma-border pt-3.5">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-pragma-subtext mb-1.5">
                {t("emailLabel")}
              </div>
              <div className="text-[18px] text-pragma-text">{t("email")}</div>
            </div>
            <div className="border-t border-pragma-border pt-3.5">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-pragma-subtext mb-1.5">
                {t("locationLabel")}
              </div>
              <div className="text-[18px] text-pragma-text">{t("location")}</div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="self-start bg-pragma-bg border border-pragma-border p-8 rounded-[var(--radius-pragma-md)] grid gap-5"
          noValidate
        >
          <Input
            id="contact-name"
            name="name"
            label={t("nameLabel")}
            placeholder="Jane Doe"
            autoComplete="name"
            required
          />
          <Input
            id="contact-email"
            name="email"
            type="email"
            label={t("emailInputLabel")}
            placeholder="jane@company.com"
            autoComplete="email"
            required
          />
          <Input
            id="contact-company"
            name="company"
            label={t("companyLabel")}
            placeholder="Acme Inc."
            autoComplete="organization"
          />
          <Textarea
            id="contact-message"
            name="message"
            label={t("briefLabel")}
            placeholder="We're exploring AI to reduce support workload…"
            required
          />
          <Button
            type="submit"
            size="lg"
            disabled={status === "sending"}
            className="justify-start mt-1"
          >
            {status === "sending" ? t("sending") : t("send")}
          </Button>
        </form>
      </div>
    </section>
  );
}
