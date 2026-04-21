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
import { pdfColors as c, pdfFonts as f, type PdfVariant } from "../pdf/tokens";

function makeStyles(variant: PdfVariant) {
  const isFull = variant === "full";
  const isDark = variant === "dark";
  const bold = isFull || isDark;

  const pageBg = isDark ? c.pageDark : c.white;
  const bodyText = isDark ? c.inkOnDark : c.inkBody;
  const titleText = isDark ? c.inkOnDark : c.ink;
  const mutedText = isDark ? c.mutedDark : c.inkMuted;
  const cardBg = isDark ? c.surfaceInkSoft : c.surfaceSoft;
  const accentText = isDark ? c.accentGlow : c.accentPrint;
  const accentDeep = isDark ? c.accentGlow : c.accentPrintDeep;
  const hairBorder = isDark ? c.borderDark : c.borderHair;
  const hairBorderSoft = isDark ? c.borderDark : c.borderHairSoft;

  return StyleSheet.create({
    page: {
      padding: 40,
      backgroundColor: pageBg,
      color: bodyText,
      fontFamily: f.sans,
      fontSize: 10,
    },
    pageRail: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: isDark ? c.accentGlow : c.accentPrint,
    },
    headerBandFull: {
      marginBottom: 24,
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 18,
      backgroundColor: isDark ? c.surfaceInkSoft : c.surfaceInk,
      borderLeftWidth: 4,
      borderLeftColor: c.accentGlow,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    headerBandPolish: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
      paddingBottom: 15,
      borderBottomWidth: 2,
      borderBottomColor: c.accentPrint,
    },
    logoTile: {
      width: 28,
      height: 28,
      backgroundColor: bold ? c.accentGlow : c.accentPrint,
      borderRadius: 3,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    logoTileText: {
      fontSize: 15,
      fontFamily: f.sansBold,
      color: bold ? c.surfaceInk : c.white,
    },
    logo: {
      fontSize: 24,
      fontFamily: f.sansBold,
      color: bold ? c.inkOnDark : c.ink,
      letterSpacing: 1,
    },
    headerRight: {
      textAlign: "right",
    },
    headerLabel: {
      fontSize: 8,
      color: bold ? c.inkOnDarkMuted : c.inkMuted,
      marginBottom: 2,
      letterSpacing: 0.5,
    },
    headerValue: {
      fontSize: 10,
      color: bold ? c.inkOnDark : c.inkBody,
      marginBottom: 4,
    },
    title: {
      fontSize: 18,
      fontFamily: f.sansBold,
      marginBottom: 6,
      color: titleText,
    },
    description: {
      fontSize: 10,
      color: mutedText,
      marginBottom: 20,
    },
    clientBox: {
      backgroundColor: cardBg,
      borderRadius: 4,
      padding: 12,
      marginBottom: 20,
      borderLeftWidth: 3,
      borderLeftColor: accentText,
    },
    clientLabel: {
      fontSize: 8,
      color: mutedText,
      fontFamily: f.sansBold,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    clientName: {
      fontSize: 12,
      fontFamily: f.sansBold,
      color: titleText,
      marginBottom: 2,
    },
    clientDetail: {
      fontSize: 9,
      color: mutedText,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: cardBg,
      borderBottomWidth: 1.5,
      borderBottomColor: accentText,
      paddingVertical: 6,
      paddingHorizontal: 6,
      marginBottom: 4,
    },
    tableHeaderText: {
      fontSize: 8,
      color: titleText,
      fontFamily: f.sansBold,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 6,
      paddingHorizontal: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: hairBorderSoft,
    },
    colDesc: { flex: 5 },
    colQty: { flex: 1, textAlign: "right" },
    colPrice: { flex: 2, textAlign: "right" },
    colTotal: { flex: 2, textAlign: "right" },
    cellText: {
      fontSize: 9.5,
      color: bodyText,
    },
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
      color: mutedText,
      fontSize: 10,
    },
    totalValue: {
      width: 100,
      textAlign: "right",
      fontSize: 10,
      color: bodyText,
    },
    grandTotal: {
      flexDirection: "row",
      justifyContent: "flex-end",
      borderTopWidth: 2,
      borderTopColor: accentText,
      paddingTop: 6,
      marginTop: 4,
    },
    grandTotalLabel: {
      width: 100,
      textAlign: "right",
      fontSize: 14,
      fontFamily: f.sansBold,
      color: titleText,
    },
    grandTotalValue: {
      width: 100,
      textAlign: "right",
      fontSize: 14,
      fontFamily: f.sansBold,
      color: accentDeep,
    },
    notesBox: {
      marginTop: 24,
      backgroundColor: cardBg,
      borderRadius: 4,
      padding: 12,
    },
    notesLabel: {
      fontSize: 8,
      color: accentText,
      fontFamily: f.sansBold,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 6,
    },
    notesText: {
      fontSize: 9,
      color: bodyText,
      lineHeight: 1.5,
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 40,
      right: 40,
      borderTopWidth: 1,
      borderTopColor: hairBorder,
      paddingTop: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerText: {
      fontSize: 8,
      color: mutedText,
    },
    footerBrand: {
      fontSize: 9,
      fontFamily: f.sansBold,
      color: titleText,
      marginBottom: 1,
    },
    footerConfidential: {
      fontSize: 7,
      color: mutedText,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    // Blueprint-specific styles
    sectionLabel: {
      fontSize: 8,
      color: mutedText,
      fontFamily: f.sansBold,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 6,
    },
    sectionLabelAccent: {
      fontSize: 8,
      color: accentText,
      fontFamily: f.sansBold,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 6,
    },
    narrativeBox: {
      borderLeftWidth: 3,
      borderLeftColor: accentText,
      marginBottom: 16,
      backgroundColor: cardBg,
      padding: 12,
      paddingLeft: 14,
    },
    narrativeText: {
      fontSize: 10,
      color: bodyText,
      lineHeight: 1.6,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: hairBorder,
      marginVertical: 16,
    },
    deliverableRow: {
      flexDirection: "row",
      marginBottom: 10,
      backgroundColor: cardBg,
      padding: 10,
      borderRadius: 4,
      borderLeftWidth: bold ? 3 : 0,
      borderLeftColor: accentText,
    },
    deliverableNumber: {
      fontSize: 14,
      fontFamily: f.sansBold,
      color: accentDeep,
      width: 24,
      marginRight: 8,
    },
    deliverableContent: {
      flex: 1,
    },
    deliverableTitle: {
      fontSize: 10,
      fontFamily: f.sansBold,
      color: titleText,
      marginBottom: 3,
    },
    deliverableDesc: {
      fontSize: 9,
      color: mutedText,
      lineHeight: 1.4,
    },
    timelineInvestmentRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    timelineBox: {
      flex: 1,
      backgroundColor: cardBg,
      borderRadius: 4,
      padding: 12,
    },
    investmentBox: {
      flex: 1,
      backgroundColor: isDark
        ? c.surfaceInkSoft
        : isFull
          ? c.surfaceInk
          : c.surfaceSoft,
      borderRadius: 4,
      padding: 12,
      borderWidth: 1,
      borderColor: isDark
        ? c.accentGlow
        : isFull
          ? c.surfaceInk
          : c.borderAccent,
    },
    investmentLabel: {
      fontSize: 8,
      color: bold ? c.inkOnDarkMuted : c.inkMuted,
      fontFamily: f.sansBold,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 6,
    },
    timelineValue: {
      fontSize: 16,
      fontFamily: f.sansBold,
      color: titleText,
      marginTop: 4,
    },
    listPriceText: {
      fontSize: 10,
      color: bold ? c.inkOnDarkMuted : c.inkMuted,
      textDecoration: "line-through",
    },
    preferentialText: {
      fontSize: 8,
      color: bold ? c.inkOnDarkMuted : c.inkMuted,
      fontStyle: "italic",
      marginBottom: 2,
    },
    fixedPriceText: {
      fontSize: 16,
      fontFamily: f.sansBold,
      color: bold ? c.accentGlow : c.accentPrintDeep,
      marginTop: 2,
    },
    paymentTermsText: {
      fontSize: 8,
      color: bold ? c.inkOnDarkMuted : c.inkMuted,
      marginTop: 4,
    },
    scopeNoteText: {
      fontSize: 9,
      color: mutedText,
      fontStyle: "italic",
      marginBottom: 16,
    },
    nextStepRow: {
      flexDirection: "row",
      marginBottom: 6,
    },
    nextStepNum: {
      fontSize: 10,
      color: accentText,
      width: 20,
      fontFamily: f.sansBold,
    },
    nextStepText: {
      flex: 1,
      fontSize: 10,
      color: bodyText,
    },
  });
}

function LogoMark({ styles }: { styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={styles.logoTile}>
        <Text style={styles.logoTileText}>P</Text>
      </View>
      <Text style={styles.logo}>PRAGMA</Text>
    </View>
  );
}

function BlueprintPdfDocument({
  quote,
  variant,
}: {
  quote: Quote;
  variant: PdfVariant;
}) {
  const styles = makeStyles(variant);
  const bold = variant === "full" || variant === "dark";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {bold && <View style={styles.pageRail} fixed />}

        <View style={bold ? styles.headerBandFull : styles.headerBandPolish}>
          <LogoMark styles={styles} />
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

        <Text style={styles.title}>{quote.title}</Text>

        <View style={styles.clientBox}>
          <Text style={styles.clientLabel}>Preparado para</Text>
          <Text style={styles.clientName}>{quote.clientName}</Text>
          {quote.clientCompany && (
            <Text style={styles.clientDetail}>{quote.clientCompany}</Text>
          )}
          <Text style={styles.clientDetail}>{quote.clientEmail}</Text>
        </View>

        {quote.problem && (
          <View style={styles.narrativeBox}>
            <Text style={styles.sectionLabelAccent}>El Problema</Text>
            <Text style={styles.narrativeText}>{quote.problem}</Text>
          </View>
        )}

        {quote.opportunity && (
          <View style={styles.narrativeBox}>
            <Text style={styles.sectionLabelAccent}>La Oportunidad</Text>
            <Text style={[styles.narrativeText, { fontStyle: "italic" }]}>
              {quote.opportunity}
            </Text>
          </View>
        )}

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

        <View style={styles.timelineInvestmentRow}>
          {quote.timeline && (
            <View style={styles.timelineBox}>
              <Text style={styles.sectionLabel}>Timeline</Text>
              <Text style={styles.timelineValue}>{quote.timeline}</Text>
            </View>
          )}

          {quote.fixedPrice != null && (
            <View style={styles.investmentBox}>
              <Text style={styles.investmentLabel}>Inversión</Text>
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

        {quote.scopeNote && (
          <Text style={styles.scopeNoteText}>{quote.scopeNote}</Text>
        )}

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

export function QuotePdfDocument({
  quote,
  variant = "full",
}: {
  quote: Quote;
  variant?: PdfVariant;
}) {
  if (quote.quoteType === "blueprint") {
    return <BlueprintPdfDocument quote={quote} variant={variant} />;
  }

  const styles = makeStyles(variant);
  const bold = variant === "full" || variant === "dark";

  const subtotal = calculateSubtotal(quote.lineItems);
  const discountAmount = subtotal * (quote.discount / 100);
  const total = calculateTotal(quote.lineItems, quote.discount);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {bold && <View style={styles.pageRail} fixed />}

        <View style={bold ? styles.headerBandFull : styles.headerBandPolish}>
          <LogoMark styles={styles} />
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

        <Text style={styles.title}>{quote.title}</Text>
        {quote.description && (
          <Text style={styles.description}>{quote.description}</Text>
        )}

        <View style={styles.clientBox}>
          <Text style={styles.clientLabel}>Prepared for</Text>
          <Text style={styles.clientName}>{quote.clientName}</Text>
          {quote.clientCompany && (
            <Text style={styles.clientDetail}>{quote.clientCompany}</Text>
          )}
          <Text style={styles.clientDetail}>{quote.clientEmail}</Text>
        </View>

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

        {quote.lineItems.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.colDesc]}>
              {item.description}
            </Text>
            <Text style={[styles.cellText, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.cellText, styles.colPrice]}>
              {formatCurrency(item.unitPrice, quote.currency, quote.locale)}
            </Text>
            <Text style={[styles.cellText, styles.colTotal]}>
              {formatCurrency(
                calculateLineItemTotal(item),
                quote.currency,
                quote.locale
              )}
            </Text>
          </View>
        ))}

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
              <Text style={[styles.totalValue, { color: c.discount }]}>
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

        {quote.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notes & Terms</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

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
