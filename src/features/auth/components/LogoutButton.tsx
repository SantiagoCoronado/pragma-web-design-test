"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/Button";
import { logoutAction } from "./loginAction";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const t = useTranslations("Admin");

  return (
    <form action={logoutAction}>
      <Button variant="ghost" size="sm" type="submit">
        <LogOut size={14} />
        {t("logout")}
      </Button>
    </form>
  );
}
