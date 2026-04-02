import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllQuotes } from "@/features/quotes/lib/queries";
import { QuoteTable } from "@/features/quotes/components/QuoteTable";
import { Button } from "@/shared/components/ui/Button";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { Plus } from "lucide-react";

export default async function AdminDashboard() {
  const t = await getTranslations("Admin");
  const quotes = await getAllQuotes();

  return (
    <div className="min-h-screen">
      {/* Admin header */}
      <header className="border-b border-pragma-border bg-pragma-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold text-pragma-accent">
              PRAGMA
            </span>
            <span className="hidden sm:inline text-pragma-muted text-sm">{t("title")}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/admin/quotes/new">
              <Button size="sm">
                <Plus size={16} />
                <span className="hidden sm:inline">{t("newQuote")}</span>
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl font-bold mb-6">
          {t("quotes")}
        </h1>
        <QuoteTable quotes={quotes} />
      </main>
    </div>
  );
}
