"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import type { ContactSubmission } from "../lib/queries";
import {
  toggleContactReadAction,
  deleteContactAction,
} from "../actions/contacts";
import { Mail, MailOpen, Trash2 } from "lucide-react";

export function ContactsTable({
  contacts,
}: {
  contacts: ContactSubmission[];
}) {
  const t = useTranslations("Admin");

  async function handleToggleRead(id: string, currentRead: boolean) {
    await toggleContactReadAction(id, !currentRead);
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this submission?")) {
      await deleteContactAction(id);
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-16 text-pragma-muted">
        <p>{t("noContacts")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {contacts.map((c) => (
          <div
            key={c.id}
            className={`border rounded-xl p-4 ${
              c.read
                ? "bg-pragma-surface/30 border-pragma-border/50"
                : "bg-pragma-surface/50 border-pragma-accent/20"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-pragma-muted">{c.email}</p>
                {c.company && (
                  <p className="text-xs text-pragma-muted">{c.company}</p>
                )}
              </div>
              <Badge variant={c.read ? "default" : "cyan"}>
                {c.read ? t("contactRead") : t("contactNew")}
              </Badge>
            </div>
            <p className="text-sm text-pragma-muted mb-3 line-clamp-3">
              {c.message}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-pragma-border/50">
              <span className="text-xs text-pragma-muted">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleRead(c.id, c.read)}
                >
                  {c.read ? <MailOpen size={14} /> : <Mail size={14} />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(c.id)}
                >
                  <Trash2 size={14} className="text-red-400" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-pragma-border text-left">
              <th className="pb-3 text-xs font-medium text-pragma-muted uppercase tracking-wider">
                {t("contactStatus")}
              </th>
              <th className="pb-3 text-xs font-medium text-pragma-muted uppercase tracking-wider">
                {t("contactName")}
              </th>
              <th className="pb-3 text-xs font-medium text-pragma-muted uppercase tracking-wider">
                {t("contactCompany")}
              </th>
              <th className="pb-3 text-xs font-medium text-pragma-muted uppercase tracking-wider">
                {t("contactMessage")}
              </th>
              <th className="pb-3 text-xs font-medium text-pragma-muted uppercase tracking-wider">
                {t("contactDate")}
              </th>
              <th className="pb-3 text-xs font-medium text-pragma-muted uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pragma-border/50">
            {contacts.map((c) => (
              <tr
                key={c.id}
                className={c.read ? "opacity-60" : ""}
              >
                <td className="py-4">
                  <Badge variant={c.read ? "default" : "cyan"}>
                    {c.read ? t("contactRead") : t("contactNew")}
                  </Badge>
                </td>
                <td className="py-4">
                  <p className="text-sm font-medium">{c.name}</p>
                  <a
                    href={`mailto:${c.email}`}
                    className="text-xs text-pragma-accent hover:underline"
                  >
                    {c.email}
                  </a>
                </td>
                <td className="py-4 text-sm text-pragma-muted">
                  {c.company || "—"}
                </td>
                <td className="py-4 text-sm text-pragma-muted max-w-xs">
                  <p className="line-clamp-2">{c.message}</p>
                </td>
                <td className="py-4 text-sm text-pragma-muted whitespace-nowrap">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRead(c.id, c.read)}
                      title={c.read ? "Mark unread" : "Mark read"}
                    >
                      {c.read ? (
                        <MailOpen size={14} />
                      ) : (
                        <Mail size={14} />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
