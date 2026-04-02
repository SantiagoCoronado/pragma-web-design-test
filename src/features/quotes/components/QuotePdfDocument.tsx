import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Quote } from "../types";
import {
  formatCurrency,
  calculateLineItemTotal,
  calculateSubtotal,
  calculateTotal,
} from "../types";

const colors = {
  bg: "#0a0a0f",
  surface: "#12121a",
  border: "#1e1e2e",
  accent: "#00f0ff",
  text: "#e4e4e7",
  muted: "#71717a",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    color: "#1a1a2e",
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  logo: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
  },
  headerRight: {
    textAlign: "right",
  },
  headerLabel: {
    fontSize: 8,
    color: colors.muted,
    marginBottom: 2,
  },
  headerValue: {
    fontSize: 10,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#1a1a2e",
  },
  description: {
    fontSize: 10,
    color: colors.muted,
    marginBottom: 20,
  },
  clientBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
  },
  clientLabel: {
    fontSize: 8,
    color: colors.muted,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  clientName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: 9,
    color: colors.muted,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  colDesc: { flex: 5 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 2, textAlign: "right" },
  colTotal: { flex: 2, textAlign: "right" },
  totalsSection: {
    marginTop: 12,
    paddingTop: 8,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  totalLabel: {
    width: 100,
    textAlign: "right",
    color: colors.muted,
    fontSize: 10,
  },
  totalValue: {
    width: 100,
    textAlign: "right",
    fontSize: 10,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 2,
    borderTopColor: colors.accent,
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalLabel: {
    width: 100,
    textAlign: "right",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalValue: {
    width: 100,
    textAlign: "right",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0066cc",
  },
  notesBox: {
    marginTop: 24,
    backgroundColor: "#fafafa",
    borderRadius: 4,
    padding: 12,
  },
  notesLabel: {
    fontSize: 8,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: "#555",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#b3f7ff",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: colors.muted,
  },
  footerBrand: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
    marginBottom: 1,
  },
  footerConfidential: {
    fontSize: 7,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Blueprint-specific styles
  sectionLabel: {
    fontSize: 8,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionLabelAccent: {
    fontSize: 8,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  narrativeBox: {
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    padding: 12,
    paddingLeft: 14,
  },
  narrativeText: {
    fontSize: 10,
    color: "#333",
    lineHeight: 1.6,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginVertical: 16,
  },
  deliverableRow: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 4,
  },
  deliverableNumber: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
    width: 24,
    marginRight: 8,
  },
  deliverableContent: {
    flex: 1,
  },
  deliverableTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  deliverableDesc: {
    fontSize: 9,
    color: colors.muted,
    lineHeight: 1.4,
  },
  timelineInvestmentRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  timelineBox: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    padding: 12,
  },
  investmentBox: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: "#b3f7ff",
  },
  timelineValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  listPriceText: {
    fontSize: 10,
    color: colors.muted,
    textDecoration: "line-through",
  },
  preferentialText: {
    fontSize: 8,
    color: colors.muted,
    fontStyle: "italic",
    marginBottom: 2,
  },
  fixedPriceText: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0066cc",
    marginTop: 2,
  },
  paymentTermsText: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 4,
  },
  scopeNoteText: {
    fontSize: 9,
    color: colors.muted,
    fontStyle: "italic",
    marginBottom: 16,
  },
  nextStepRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  nextStepNum: {
    fontSize: 10,
    color: colors.accent,
    width: 20,
    fontFamily: "Helvetica-Bold",
  },
  nextStepText: {
    flex: 1,
    fontSize: 10,
    color: "#333",
  },
});

function LogoMark() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View
        style={{
          width: 28,
          height: 28,
          backgroundColor: colors.accent,
          borderRadius: 3,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
        }}
      >
        <Text style={{ fontSize: 15, fontFamily: "Helvetica-Bold", color: "#0a0a0f" }}>
          P
        </Text>
      </View>
      <Text style={styles.logo}>PRAGMA</Text>
    </View>
  );
}

function BlueprintPdfDocument({ quote }: { quote: Quote }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <LogoMark />
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>PROPUESTA</Text>
            <Text style={styles.headerValue}>#{quote.id}</Text>
            <Text style={styles.headerLabel}>FECHA</Text>
            <Text style={styles.headerValue}>
              {new Date(quote.createdAt).toLocaleDateString("es-MX")}
            </Text>
            {quote.validUntil && (
              <>
                <Text style={styles.headerLabel}>VÁLIDO HASTA</Text>
                <Text style={styles.headerValue}>{quote.validUntil}</Text>
              </>
            )}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{quote.title}</Text>

        {/* Client */}
        <View style={styles.clientBox}>
          <Text style={styles.clientLabel}>Preparado para</Text>
          <Text style={styles.clientName}>{quote.clientName}</Text>
          {quote.clientCompany && (
            <Text style={styles.clientDetail}>{quote.clientCompany}</Text>
          )}
          <Text style={styles.clientDetail}>{quote.clientEmail}</Text>
        </View>

        {/* Problem */}
        {quote.problem && (
          <View style={styles.narrativeBox}>
            <Text style={styles.sectionLabelAccent}>El Problema</Text>
            <Text style={styles.narrativeText}>{quote.problem}</Text>
          </View>
        )}

        {/* Opportunity */}
        {quote.opportunity && (
          <View style={styles.narrativeBox}>
            <Text style={styles.sectionLabelAccent}>La Oportunidad</Text>
            <Text style={[styles.narrativeText, { fontStyle: "italic" }]}>
              {quote.opportunity}
            </Text>
          </View>
        )}

        {/* Deliverables */}
        {quote.deliverables && quote.deliverables.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Entregables</Text>
            {quote.deliverables.map((d) => (
              <View key={d.id} style={styles.deliverableRow}>
                <Text style={styles.deliverableNumber}>{d.number}</Text>
                <View style={styles.deliverableContent}>
                  <Text style={styles.deliverableTitle}>{d.title}</Text>
                  <Text style={styles.deliverableDesc}>{d.description}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.divider} />

        {/* Timeline + Investment */}
        <View style={styles.timelineInvestmentRow}>
          {quote.timeline && (
            <View style={styles.timelineBox}>
              <Text style={styles.sectionLabel}>Timeline</Text>
              <Text style={styles.timelineValue}>{quote.timeline}</Text>
            </View>
          )}

          {quote.fixedPrice != null && (
            <View style={styles.investmentBox}>
              <Text style={styles.sectionLabel}>Inversión</Text>
              {quote.listPrice != null && (
                <Text style={styles.listPriceText}>
                  {formatCurrency(quote.listPrice, quote.currency, quote.locale)}
                </Text>
              )}
              {quote.preferentialNote && (
                <Text style={styles.preferentialText}>
                  {quote.preferentialNote}
                </Text>
              )}
              <Text style={styles.fixedPriceText}>
                {formatCurrency(quote.fixedPrice, quote.currency, quote.locale)}
              </Text>
              {quote.paymentTerms && (
                <Text style={styles.paymentTermsText}>
                  {quote.paymentTerms}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Scope note */}
        {quote.scopeNote && (
          <Text style={styles.scopeNoteText}>{quote.scopeNote}</Text>
        )}

        {/* Next Steps */}
        {quote.nextSteps && quote.nextSteps.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Siguientes Pasos</Text>
            {quote.nextSteps.map((step, i) => (
              <View key={i} style={styles.nextStepRow}>
                <Text style={styles.nextStepNum}>{i + 1}.</Text>
                <Text style={styles.nextStepText}>{step}</Text>
              </View>
            ))}
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerBrand}>PRAGMA</Text>
            <Text style={styles.footerText}>AI & Technology Solutions</Text>
          </View>
          <Text style={styles.footerConfidential}>Documento Confidencial</Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.footerText}>hello@pragma.agency</Text>
            <Text style={styles.footerText}>pragma.agency</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export function QuotePdfDocument({ quote }: { quote: Quote }) {
  if (quote.quoteType === "blueprint") {
    return <BlueprintPdfDocument quote={quote} />;
  }

  // Line-items PDF (original)
  const subtotal = calculateSubtotal(quote.lineItems);
  const discountAmount = subtotal * (quote.discount / 100);
  const total = calculateTotal(quote.lineItems, quote.discount);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <LogoMark />
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>QUOTE</Text>
            <Text style={styles.headerValue}>#{quote.id}</Text>
            <Text style={styles.headerLabel}>DATE</Text>
            <Text style={styles.headerValue}>
              {new Date(quote.createdAt).toLocaleDateString()}
            </Text>
            {quote.validUntil && (
              <>
                <Text style={styles.headerLabel}>VALID UNTIL</Text>
                <Text style={styles.headerValue}>{quote.validUntil}</Text>
              </>
            )}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{quote.title}</Text>
        {quote.description && (
          <Text style={styles.description}>{quote.description}</Text>
        )}

        {/* Client */}
        <View style={styles.clientBox}>
          <Text style={styles.clientLabel}>Prepared for</Text>
          <Text style={styles.clientName}>{quote.clientName}</Text>
          {quote.clientCompany && (
            <Text style={styles.clientDetail}>{quote.clientCompany}</Text>
          )}
          <Text style={styles.clientDetail}>{quote.clientEmail}</Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDesc]}>
            Description
          </Text>
          <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.colPrice]}>
            Unit Price
          </Text>
          <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
        </View>

        {/* Table Rows */}
        {quote.lineItems.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>
              {formatCurrency(item.unitPrice, quote.currency, quote.locale)}
            </Text>
            <Text style={styles.colTotal}>
              {formatCurrency(
                calculateLineItemTotal(item),
                quote.currency,
                quote.locale
              )}
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(subtotal, quote.currency, quote.locale)}
            </Text>
          </View>
          {quote.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Discount ({quote.discount}%):
              </Text>
              <Text style={[styles.totalValue, { color: "#cc0000" }]}>
                -{formatCurrency(discountAmount, quote.currency, quote.locale)}
              </Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(total, quote.currency, quote.locale)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notes & Terms</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerBrand}>PRAGMA</Text>
            <Text style={styles.footerText}>AI & Technology Solutions</Text>
          </View>
          <Text style={styles.footerConfidential}>Confidential Document</Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.footerText}>hello@pragma.agency</Text>
            <Text style={styles.footerText}>pragma.agency</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
