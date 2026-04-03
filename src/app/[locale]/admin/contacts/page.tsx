import { getTranslations } from "next-intl/server";
import { getAllContacts } from "@/features/landing/lib/queries";
import { ContactsTable } from "@/features/landing/components/ContactsTable";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/Button";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { ArrowLeft } from "lucide-react";

export default async function ContactsPage() {
  const t = await getTranslations("Admin");
  const contacts = await getAllContacts();

  return (
    <div className="min-h-screen">
      <header className="border-b border-pragma-border bg-pragma-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold text-pragma-accent">
              PRAGMA
            </span>
            <span className="hidden sm:inline text-pragma-muted text-sm">
              {t("title")}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/admin">
              <Button variant="secondary" size="sm">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">{t("quotes")}</span>
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl font-bold mb-6">
          {t("contacts")}
        </h1>
        <ContactsTable contacts={contacts} />
      </main>
    </div>
  );
}
