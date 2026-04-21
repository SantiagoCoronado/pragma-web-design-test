import type { Quote } from "@/features/quotes/types";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReactElement } from "react";
import {
  pdfColors as c,
  pdfFonts as f,
  type PdfVariant,
} from "@/features/quotes/pdf/tokens";

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
  const hairBorder = isDark ? c.borderDark : c.borderHair;
  const hairBorderSoft = isDark ? c.borderDark : c.borderHairSoft;
  const headerBandBg = isDark ? c.surfaceInkSoft : c.surfaceInk;

  return StyleSheet.create({
    page: {
      paddingTop: 48,
      paddingBottom: 56,
      paddingHorizontal: 48,
      fontSize: 10.5,
      fontFamily: f.sans,
      color: bodyText,
      backgroundColor: pageBg,
      lineHeight: 1.55,
    },
    pageRail: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: accentText,
    },
    headerBandFull: {
      marginBottom: 24,
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 20,
      backgroundColor: headerBandBg,
      borderLeftWidth: 4,
      borderLeftColor: c.accentGlow,
    },
    headerBandPolish: {
      marginBottom: 24,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: c.accentPrint,
    },
    brand: {
      fontSize: 10,
      fontFamily: f.sansBold,
      color: bold ? c.accentGlow : c.accentPrint,
      letterSpacing: 2,
      marginBottom: 10,
    },
    headerTitle: {
      fontSize: 22,
      fontFamily: f.sansBold,
      color: bold ? c.inkOnDark : c.ink,
      marginBottom: 6,
    },
    headerMeta: {
      fontSize: 9,
      color: bold ? c.inkOnDarkMuted : c.inkMuted,
      marginTop: 2,
    },
    clientCard: {
      backgroundColor: cardBg,
      padding: 14,
      marginBottom: 20,
      borderRadius: 4,
      borderLeftWidth: 3,
      borderLeftColor: accentText,
    },
    clientLabel: {
      fontSize: 8,
      color: mutedText,
      fontFamily: f.sansBold,
      letterSpacing: 1,
      marginBottom: 4,
    },
    clientName: {
      fontSize: 12,
      fontFamily: f.sansBold,
      color: titleText,
    },
    clientCompany: {
      fontSize: 10,
      color: mutedText,
      marginTop: 2,
    },
    clientEmail: {
      fontSize: 10,
      color: mutedText,
      marginTop: 2,
    },
    h1: {
      fontSize: 18,
      fontFamily: f.sansBold,
      color: titleText,
      marginTop: 18,
      marginBottom: 10,
    },
    h2: {
      fontSize: 14,
      fontFamily: f.sansBold,
      color: titleText,
      marginTop: 14,
      marginBottom: 8,
    },
    h2Underline: {
      width: 32,
      height: 2,
      backgroundColor: accentText,
      marginTop: -4,
      marginBottom: 10,
    },
    h3: {
      fontSize: 11.5,
      fontFamily: f.sansBold,
      color: titleText,
      marginTop: 10,
      marginBottom: 5,
    },
    paragraph: {
      fontSize: 10.5,
      color: bodyText,
      lineHeight: 1.55,
      marginBottom: 8,
      textAlign: "justify",
    },
    listItem: {
      flexDirection: "row",
      marginBottom: 4,
      marginLeft: 4,
      paddingRight: 6,
    },
    listBullet: {
      fontSize: 10.5,
      color: accentText,
      fontFamily: f.sansBold,
      width: 18,
    },
    listText: {
      fontSize: 10.5,
      color: bodyText,
      lineHeight: 1.5,
      flex: 1,
    },
    hr: {
      borderBottomWidth: 1,
      borderBottomColor: hairBorder,
      marginVertical: 12,
    },
    bold: {
      fontFamily: f.sansBold,
      color: titleText,
    },
    italic: {
      fontFamily: f.sansItalic,
      color: mutedText,
    },
    table: {
      marginVertical: 10,
      borderWidth: 1,
      borderColor: hairBorder,
      borderRadius: 2,
    },
    tableHeaderRow: {
      flexDirection: "row",
      backgroundColor: cardBg,
      borderBottomWidth: 1.5,
      borderBottomColor: accentText,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: hairBorderSoft,
    },
    tableHeaderCell: {
      flex: 1,
      padding: 6,
      fontSize: 8.5,
      fontFamily: f.sansBold,
      color: titleText,
      letterSpacing: 0.5,
    },
    tableCell: {
      flex: 1,
      padding: 6,
      fontSize: 9,
      color: bodyText,
    },
    footer: {
      position: "absolute",
      left: 48,
      right: 48,
      bottom: 24,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: hairBorder,
      textAlign: "center",
      fontSize: 8,
      color: mutedText,
    },
    pageNumber: {
      position: "absolute",
      bottom: 12,
      right: 48,
      fontSize: 8,
      color: mutedText,
    },
  });
}

type Styles = ReturnType<typeof makeStyles>;

function renderInlinePDF(
  text: string,
  keyPrefix: string,
  styles: Styles
): ReactElement[] {
  const nodes: ReactElement[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Text key={`${keyPrefix}-t-${i}`}>{text.slice(lastIndex, match.index)}</Text>
      );
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <Text key={`${keyPrefix}-b-${i}`} style={styles.bold}>
          {token.slice(2, -2)}
        </Text>
      );
    } else {
      nodes.push(
        <Text key={`${keyPrefix}-i-${i}`} style={styles.italic}>
          {token.slice(1, -1)}
        </Text>
      );
    }
    lastIndex = match.index + token.length;
    i++;
  }
  if (lastIndex < text.length) {
    nodes.push(<Text key={`${keyPrefix}-tail`}>{text.slice(lastIndex)}</Text>);
  }
  return nodes;
}

function parseMarkdownForPDF(
  content: string,
  styles: Styles,
  variant: PdfVariant
): ReactElement[] {
  const lines = content.split("\n");
  const elements: ReactElement[] = [];

  let i = 0;
  let paragraphBuffer: string[] = [];

  const flushParagraph = (key: string) => {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(" ");
      elements.push(
        <Text key={key} style={styles.paragraph}>
          {renderInlinePDF(text, key, styles)}
        </Text>
      );
      paragraphBuffer = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushParagraph(`p-${i}`);
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const parseRow = (r: string) =>
          r.slice(1, -1).split("|").map((c) => c.trim());
        const header = parseRow(tableLines[0]);
        const rows = tableLines.slice(2).map(parseRow);

        elements.push(
          <View key={`table-${i}`} style={styles.table} wrap={false}>
            <View style={styles.tableHeaderRow}>
              {header.map((h, idx) => (
                <Text key={idx} style={styles.tableHeaderCell}>
                  {h.toUpperCase()}
                </Text>
              ))}
            </View>
            {rows.map((row, rIdx) => (
              <View
                key={rIdx}
                style={[
                  styles.tableRow,
                  rIdx === rows.length - 1 ? { borderBottomWidth: 0 } : {},
                ]}
              >
                {row.map((cell, cIdx) => (
                  <Text key={cIdx} style={styles.tableCell}>
                    {renderInlinePDF(cell, `td-${i}-${rIdx}-${cIdx}`, styles)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        );
      }
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      flushParagraph(`p-${i}`);
      elements.push(
        <Text key={`h1-${i}`} style={styles.h1}>
          {renderInlinePDF(line.slice(2), `h1-${i}`, styles)}
        </Text>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph(`p-${i}`);
      elements.push(
        <Text key={`h2-${i}`} style={styles.h2}>
          {renderInlinePDF(line.slice(3), `h2-${i}`, styles)}
        </Text>
      );
      if (variant === "full" || variant === "dark") {
        elements.push(<View key={`h2u-${i}`} style={styles.h2Underline} />);
      }
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph(`p-${i}`);
      elements.push(
        <Text key={`h3-${i}`} style={styles.h3}>
          {renderInlinePDF(line.slice(4), `h3-${i}`, styles)}
        </Text>
      );
      i++;
      continue;
    }

    // HR
    if (trimmed === "---" || trimmed === "***") {
      flushParagraph(`p-${i}`);
      elements.push(<View key={`hr-${i}`} style={styles.hr} />);
      i++;
      continue;
    }

    // Ordered list
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      flushParagraph(`p-${i}`);
      elements.push(
        <View key={`ol-${i}`} style={styles.listItem} wrap={false}>
          <Text style={styles.listBullet}>{orderedMatch[1]}.</Text>
          <Text style={styles.listText}>
            {renderInlinePDF(orderedMatch[2], `ol-${i}`, styles)}
          </Text>
        </View>
      );
      i++;
      continue;
    }

    // Unordered list
    const unorderedMatch = line.match(/^[-*]\s+(.*)/);
    if (unorderedMatch) {
      flushParagraph(`p-${i}`);
      elements.push(
        <View key={`ul-${i}`} style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listText}>
            {renderInlinePDF(unorderedMatch[1], `ul-${i}`, styles)}
          </Text>
        </View>
      );
      i++;
      continue;
    }

    // Empty
    if (trimmed === "") {
      flushParagraph(`p-${i}`);
      i++;
      continue;
    }

    // Regular text
    paragraphBuffer.push(line);
    i++;
  }

  flushParagraph("p-final");
  return elements;
}

export const QuotePDF = ({
  quote,
  variant = "full",
}: {
  quote: Quote;
  variant?: PdfVariant;
}) => {
  const styles = makeStyles(variant);
  const bold = variant === "full" || variant === "dark";

  const dateFormatLocale = quote.locale === "es" ? "es-MX" : "en-US";
  const quoteLabel = quote.locale === "es" ? "Cotización" : "Quote";
  const dateLabel = quote.locale === "es" ? "Fecha" : "Date";
  const validLabel = quote.locale === "es" ? "Válida hasta" : "Valid until";
  const preparedLabel =
    quote.locale === "es" ? "PREPARADO PARA" : "PREPARED FOR";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {bold && <View style={styles.pageRail} fixed />}

        <View style={bold ? styles.headerBandFull : styles.headerBandPolish}>
          <Text style={styles.brand}>PRAGMA</Text>
          <Text style={styles.headerTitle}>{quote.title}</Text>
          <Text style={styles.headerMeta}>
            {quoteLabel} #{quote.id}
          </Text>
          <Text style={styles.headerMeta}>
            {dateLabel}:{" "}
            {new Date(quote.createdAt).toLocaleDateString(dateFormatLocale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          {quote.validUntil && (
            <Text style={styles.headerMeta}>
              {validLabel}: {quote.validUntil}
            </Text>
          )}
        </View>

        <View style={styles.clientCard}>
          <Text style={styles.clientLabel}>{preparedLabel}</Text>
          <Text style={styles.clientName}>{quote.clientName}</Text>
          {quote.clientCompany && (
            <Text style={styles.clientCompany}>{quote.clientCompany}</Text>
          )}
          <Text style={styles.clientEmail}>{quote.clientEmail}</Text>
        </View>

        {quote.rawContent && (
          <View>{parseMarkdownForPDF(quote.rawContent, styles, variant)}</View>
        )}

        <Text style={styles.footer} fixed>
          Desarrollado por PRAGMA • Santiago Coronado • santiago.coronado94@gmail.com
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};
