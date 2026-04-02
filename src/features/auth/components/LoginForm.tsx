"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { loginAction } from "./loginAction";

export function LoginForm() {
  const t = useTranslations("Admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, the action redirects
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-pragma-surface/50 backdrop-blur-sm border border-pragma-border rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-pragma-accent">
            PRAGMA
          </h1>
          <p className="text-sm text-pragma-muted mt-2">{t("login")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={t("password")}
            required
          />

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {t("loginButton")}
          </Button>
        </form>
      </div>
    </div>
  );
}
