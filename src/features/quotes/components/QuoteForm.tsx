"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { Select } from "@/shared/components/ui/Select";
import { Card } from "@/shared/components/ui/Card";
import {
  createQuoteAction,
  updateQuoteAction,
} from "../actions";
import type { Quote, LineItem, Currency, Deliverable, QuoteType } from "../types";
import {
  CURRENCY_LABELS,
  formatCurrency,
  calculateLineItemTotal,
  calculateSubtotal,
  calculateTotal,
} from "../types";
import { nanoid } from "nanoid";
import { Plus, X, Save, Link2, Eye } from "lucide-react";

interface QuoteFormProps {
  quote?: Quote;
}

export function QuoteForm({ quote }: QuoteFormProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const router = useRouter();

  const [quoteType, setQuoteType] = useState<QuoteType>(
    quote?.quoteType || "line-items"
  );
  const [lineItems, setLineItems] = useState<LineItem[]>(
    quote?.lineItems?.length
      ? quote.lineItems
      : [{ id: nanoid(6), description: "", quantity: 1, unitPrice: 0 }]
  );
  const [currency, setCurrency] = useState<Currency>(
    quote?.currency || "MXN"
  );
  const [discount, setDiscount] = useState(quote?.discount || 0);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(
    quote?.deliverables || []
  );
  const [nextSteps, setNextSteps] = useState<string[]>(
    quote?.nextSteps || []
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // Line item handlers
  const addLineItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      { id: nanoid(6), description: "", quantity: 1, unitPrice: 0 },
    ]);
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateLineItem = useCallback(
    (id: string, field: keyof LineItem, value: string | number) => {
      setLineItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  // Deliverable handlers
  const addDeliverable = useCallback(() => {
    setDeliverables((prev) => [
      ...prev,
      {
        id: nanoid(6),
        number: prev.length + 1,
        title: "",
        description: "",
      },
    ]);
  }, []);

  const removeDeliverable = useCallback((id: string) => {
    setDeliverables((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      return filtered.map((d, i) => ({ ...d, number: i + 1 }));
    });
  }, []);

  const updateDeliverable = useCallback(
    (id: string, field: keyof Deliverable, value: string | number) => {
      setDeliverables((prev) =>
        prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
      );
    },
    []
  );

  // Next step handlers
  const addNextStep = useCallback(() => {
    setNextSteps((prev) => [...prev, ""]);
  }, []);

  const removeNextStep = useCallback((index: number) => {
    setNextSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateNextStep = useCallback((index: number, value: string) => {
    setNextSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  }, []);

  const subtotal = calculateSubtotal(lineItems);
  const total = calculateTotal(lineItems, discount);

  async function handleSubmit(formData: FormData, status: string) {
    formData.set("quoteType", quoteType);
    formData.set("currency", currency);
    formData.set("status", status);

    if (quoteType === "line-items") {
      formData.set("lineItems", JSON.stringify(lineItems));
      formData.set("discount", discount.toString());
    } else {
      formData.set("lineItems", "[]");
      formData.set("discount", "0");
      formData.set("deliverables", JSON.stringify(deliverables));
      formData.set("nextSteps", JSON.stringify(nextSteps));
    }

    if (quote) {
      const result = await updateQuoteAction(quote.id, formData);
      if ("error" in result) return;
      router.push("/admin");
    } else {
      const result = await createQuoteAction(formData);
      if ("error" in result) return;

      if (status === "sent" && result.id) {
        const baseUrl = window.location.origin;
        await navigator.clipboard.writeText(
          `${baseUrl}/${locale}/quote/${result.id}`
        );
        setCopiedLink(true);
        setTimeout(() => {
          router.push("/admin");
        }, 1500);
      } else {
        router.push("/admin");
      }
    }
  }

  const currencyOptions = Object.entries(CURRENCY_LABELS).map(
    ([value, label]) => ({ value, label })
  );

  return (
    <form
      action={async (formData) => handleSubmit(formData, "draft")}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Quote Type Toggle */}
      <Card>
        <h3 className="text-sm font-semibold text-pragma-muted uppercase tracking-wider mb-4">
          {t("quoteType")}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setQuoteType("line-items")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              quoteType === "line-items"
                ? "bg-pragma-accent text-pragma-bg"
                : "bg-pragma-surface border border-pragma-border text-pragma-muted hover:text-pragma-text"
            }`}
          >
            {t("lineItemsType")}
          </button>
          <button
            type="button"
            onClick={() => setQuoteType("blueprint")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              quoteType === "blueprint"
                ? "bg-pragma-accent text-pragma-bg"
                : "bg-pragma-surface border border-pragma-border text-pragma-muted hover:text-pragma-text"
            }`}
          >
            {t("blueprintType")}
          </button>
        </div>
      </Card>

      {/* Client Info */}
      <Card>
        <h3 className="text-sm font-semibold text-pragma-muted uppercase tracking-wider mb-4">
          Client Info
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            id="clientName"
            name="clientName"
            label={t("clientName")}
            defaultValue={quote?.clientName}
            required
          />
          <Input
            id="clientEmail"
            name="clientEmail"
            type="email"
            label={t("clientEmail")}
            defaultValue={quote?.clientEmail}
            required
          />
          <Input
            id="clientCompany"
            name="clientCompany"
            label={t("clientCompany")}
            defaultValue={quote?.clientCompany}
          />
        </div>
      </Card>

      {/* Quote Details */}
      <Card>
        <h3 className="text-sm font-semibold text-pragma-muted uppercase tracking-wider mb-4">
          Quote Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="title"
            name="title"
            label={t("quoteTitle")}
            defaultValue={quote?.title}
            required
          />
          <Select
            id="currency"
            label={t("currency")}
            options={currencyOptions}
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
          />
        </div>
        {quoteType === "line-items" && (
          <div className="mt-4">
            <Textarea
              id="description"
              name="description"
              label={t("quoteDescription")}
              defaultValue={quote?.description}
            />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Input
            id="validUntil"
            name="validUntil"
            type="date"
            label={t("validUntil")}
            defaultValue={quote?.validUntil}
          />
          <Select
            id="locale"
            name="locale"
            label={t("locale")}
            options={[
              { value: "en", label: "English" },
              { value: "es", label: "Espanol" },
            ]}
            defaultValue={quote?.locale || "en"}
          />
        </div>
      </Card>

      {/* ---- LINE ITEMS MODE ---- */}
      {quoteType === "line-items" && (
        <>
          <Card>
            <h3 className="text-sm font-semibold text-pragma-muted uppercase tracking-wider mb-4">
              Line Items
            </h3>

            <div className="space-y-3">
              <div className="hidden sm:grid grid-cols-12 gap-3 text-xs text-pragma-muted uppercase tracking-wider px-1">
                <div className="col-span-5">{t("quoteDescription")}</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1" />
              </div>

              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start bg-pragma-bg/50 rounded-lg p-3"
                >
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, "description", e.target.value)
                      }
                      placeholder="Description..."
                      className="w-full bg-pragma-surface border border-pragma-border rounded-lg px-3 py-2 text-sm text-pragma-text placeholder:text-pragma-muted/50 focus:outline-none focus:border-pragma-accent/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(
                          item.id,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full bg-pragma-surface border border-pragma-border rounded-lg px-3 py-2 text-sm text-pragma-text focus:outline-none focus:border-pragma-accent/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateLineItem(
                          item.id,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full bg-pragma-surface border border-pragma-border rounded-lg px-3 py-2 text-sm text-pragma-text focus:outline-none focus:border-pragma-accent/50"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center text-sm text-pragma-muted py-2">
                    {formatCurrency(
                      calculateLineItemTotal(item),
                      currency,
                      locale
                    )}
                  </div>
                  <div className="sm:col-span-1 flex items-center">
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="text-pragma-muted hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addLineItem}
              >
                <Plus size={14} />
                {t("addLineItem")}
              </Button>
            </div>

            {/* Totals */}
            <div className="mt-6 border-t border-pragma-border pt-4">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm text-pragma-muted">
                  {t("discountLabel")}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(parseFloat(e.target.value) || 0)
                  }
                  className="w-20 bg-pragma-surface border border-pragma-border rounded-lg px-3 py-1.5 text-sm text-pragma-text focus:outline-none focus:border-pragma-accent/50"
                />
              </div>
              <div className="flex flex-col items-end gap-1 text-sm">
                <div className="flex gap-8">
                  <span className="text-pragma-muted">Subtotal:</span>
                  <span>{formatCurrency(subtotal, currency, locale)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex gap-8">
                    <span className="text-pragma-muted">
                      Discount ({discount}%):
                    </span>
                    <span className="text-red-400">
                      -{formatCurrency(subtotal * (discount / 100), currency, locale)}
                    </span>
                  </div>
                )}
                <div className="flex gap-8 text-lg font-bold border-t border-pragma-accent/30 pt-2 mt-1">
                  <span>Total:</span>
                  <span className="text-pragma-accent">
                    {formatCurrency(total, currency, locale)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <Textarea
              id="notes"
              name="notes"
              label={t("notesLabel")}
              defaultValue={quote?.notes}
              placeholder="Payment terms, conditions, etc."
            />
          </Card>
        </>
      )}

      {/* ---- BLUEPRINT MODE ---- */}
      {quoteType === "blueprint" && (
        <>
          {/* Problem */}
          <Card>
            <h3 className="text-sm font-semibold text-pragma-muted uppercase tracking-wider mb-4">
              {t("problem")}
            </h3>
            <Textarea
              id="problem"
              name="problem"
              label=""
              defaultValue={quote?.problem}
              placeholder="Describe the client's problem or pain point..."
            />
          </Card>

          {/* Opportunity */}
          <Card>
            <h3 className="text-sm font-semibold text-pragma-muted uppercase tracking-wider mb-4">
              {t("opportunity")}
            </h3>
            <Textarea
              id="opportunity"
              name="opportunity"
              label=""
              defaultValue={quote?.opportunity}
              placeholder="Describe the opportunity and expected impact..."
            />
          </Card>

          {/* Deliverables */}
          <Card>
            <h3 className="text-sm font-semibold text-pragma-muted uppercase tracking-wider mb-4">
              {t("deliverables")}
            </h3>
            <div className="space-y-3">
              {deliverables.map((d) => (
                <div
                  key={d.id}
                  className="bg-pragma-bg/50 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-pragma-accent font-bold text-lg w-6 shrink-0">
                      {d.number}
                    </span>
                    <input
                      type="text"
                      value={d.title}
                      onChange={(e) =>
                        updateDeliverable(d.id, "title", e.target.value)
                      }
                      placeholder={t("deliverableTitle")}
                      className="flex-1 bg-pragma-surface border border-pragma-border rounded-lg px-3 py-2 text-sm text-pragma-text placeholder:text-pragma-muted/50 focus:outline-none focus:border-pragma-accent/50"
                    />
                    <button
                      type="button"
                      onClick={() => removeDeliverable(d.id)}
                      className="text-pragma-muted hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="pl-9">
                    <input
                      type="text"
                      value={d.description}
                      onChange={(e) =>
                        updateDeliverable(d.id, "description", e.target.value)
                      }
                      placeholder={t("deliverableDesc")}
                      className="w-full bg-pragma-surface border border-pragma-border rounded-lg px-3 py-2 text-sm text-pragma-text placeholder:text-pragma-muted/50 focus:outline-none focus:border-pragma-accent/50"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addDeliverable}
              >
                <Plus size={14} />
                {t("addDeliverable")}
              </Button>
            </div>
          </Card>

          {/* Timeline + Pricing */}
          <Card>
            <h3 className="text-sm font-semibold text-pragma-muted uppercase tracking-wider mb-4">
              {t("timeline")} & Pricing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="timeline"
                name="timeline"
                label={t("timeline")}
                defaultValue={quote?.timeline}
                placeholder="e.g. 3 semanas"
              />
              <Input
                id="fixedPrice"
                name="fixedPrice"
                type="number"
                label={t("fixedPrice")}
                defaultValue={quote?.fixedPrice?.toString()}
                placeholder="35000"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Input
                id="listPrice"
                name="listPrice"
                type="number"
                label={t("listPrice")}
                defaultValue={quote?.listPrice?.toString()}
                placeholder="60000"
              />
              <Input
                id="preferentialNote"
                name="preferentialNote"
                label={t("preferentialNote")}
                defaultValue={quote?.preferentialNote}
                placeholder="Por tratarse de..."
              />
            </div>
            <div className="mt-4">
              <Input
                id="paymentTerms"
                name="paymentTerms"
                label={t("paymentTerms")}
                defaultValue={quote?.paymentTerms}
                placeholder="50% al arranque, 50% a la entrega"
              />
            </div>
          </Card>

          {/* Next Steps */}
          <Card>
            <h3 className="text-sm font-semibold text-pragma-muted uppercase tracking-wider mb-4">
              {t("nextSteps")}
            </h3>
            <div className="space-y-2">
              {nextSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-pragma-muted text-sm w-5 shrink-0">
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateNextStep(i, e.target.value)}
                    placeholder={`${t("nextStep")} ${i + 1}...`}
                    className="flex-1 bg-pragma-surface border border-pragma-border rounded-lg px-3 py-2 text-sm text-pragma-text placeholder:text-pragma-muted/50 focus:outline-none focus:border-pragma-accent/50"
                  />
                  <button
                    type="button"
                    onClick={() => removeNextStep(i)}
                    className="text-pragma-muted hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addNextStep}
              >
                <Plus size={14} />
                {t("addNextStep")}
              </Button>
            </div>
          </Card>

          {/* Scope Note */}
          <Card>
            <Textarea
              id="scopeNote"
              name="scopeNote"
              label={t("scopeNote")}
              defaultValue={quote?.scopeNote}
              placeholder="Scope disclaimer, limitations, out-of-scope items..."
            />
          </Card>
        </>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button type="submit" variant="secondary" size="md">
          <Save size={16} />
          {t("saveAsDraft")}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={async () => {
            const form = document.querySelector("form");
            if (!form) return;
            const formData = new FormData(form);
            await handleSubmit(formData, "sent");
          }}
        >
          <Link2 size={16} />
          {copiedLink ? t("linkCopied") : t("saveAndShare")}
        </Button>
      </div>
    </form>
  );
}
