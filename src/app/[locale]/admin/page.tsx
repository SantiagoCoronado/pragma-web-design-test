import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllQuotes } from "@/features/quotes/lib/queries";
import { QuoteTable } from "@/features/quotes/components/QuoteTable";
import { QuoteFilters } from "@/features/quotes/components/QuoteFilters";
import { Pagination } from "@/features/quotes/components/Pagination";
import { Button } from "@/shared/components/ui/Button";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { Plus, Mail } from "lucide-react";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const t = await getTranslations("Admin");
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const { quotes, total, totalPages } = await getAllQuotes({
    search: params.search,
    status: params.status,
    quoteType: params.type,
    page,
    perPage: 15,
  });

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
            <Link href="/admin/contacts">
              <Button variant="secondary" size="sm">
                <Mail size={16} />
                <span className="hidden sm:inline">{t("viewContacts")}</span>
              </Button>
            </Link>
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">
            {t("quotes")}
            <span className="text-sm font-normal text-pragma-muted ml-2">
              ({total})
            </span>
          </h1>
        </div>
        <QuoteFilters
          currentSearch={params.search}
          currentStatus={params.status}
          currentType={params.type}
        />
        <QuoteTable quotes={quotes} />
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} />
        )}
      </main>
    </div>
  );
}
