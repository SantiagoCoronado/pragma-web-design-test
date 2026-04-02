"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { AnimateIn } from "@/shared/components/ui/AnimateIn";
import { Send, Mail, MapPin } from "lucide-react";

export function Contact() {
  const t = useTranslations("Contact");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    // For MVP: just simulate submission. Replace with actual Server Action later.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStatus("success");

    // Reset after 3 seconds
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: info */}
          <AnimateIn>
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">
                {t("title")}
              </h2>
              <p className="mt-4 text-pragma-muted leading-relaxed">
                {t("subtitle")}
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-pragma-accent/10 flex items-center justify-center">
                    <Mail size={18} className="text-pragma-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-pragma-muted">Email</p>
                    <p className="text-sm font-medium">hello@pragma.agency</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-pragma-accent/10 flex items-center justify-center">
                    <MapPin size={18} className="text-pragma-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-pragma-muted">Location</p>
                    <p className="text-sm font-medium">Mexico City, MX</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>

          {/* Right: form */}
          <AnimateIn delay={0.2}>
            <form
              onSubmit={handleSubmit}
              className="bg-pragma-surface/50 backdrop-blur-sm border border-pragma-border rounded-2xl p-6 sm:p-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="name"
                  name="name"
                  placeholder={t("name")}
                  required
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("email")}
                  required
                />
              </div>
              <Input
                id="company"
                name="company"
                placeholder={t("company")}
              />
              <Textarea
                id="message"
                name="message"
                placeholder={t("message")}
                required
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={status === "sending"}
              >
                {status === "sending" ? (
                  t("sending")
                ) : (
                  <>
                    {t("send")}
                    <Send size={16} />
                  </>
                )}
              </Button>

              {status === "success" && (
                <p className="text-sm text-pragma-accent-3 text-center">
                  {t("success")}
                </p>
              )}
              {status === "error" && (
                <p className="text-sm text-red-400 text-center">
                  {t("error")}
                </p>
              )}
            </form>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
