import type { Quote } from "@/features/quotes/types";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReactElement } from "react";

const COLOR_ACCENT = "#00f0ff";
const COLOR_DARK = "#0a0e27";
const COLOR_TEXT = "#1a1d3a";
const COLOR_MUTED = "#666666";
const COLOR_BORDER = "#e0e0e0";
const COLOR_BORDER_SOFT = "#f0f0f0";
const COLOR_BG_SOFT = "#f9f9fb";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: COLOR_TEXT,
    backgroundColor: "#ffffff",
    lineHeight: 1.55,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLOR_ACCENT,
  },
  brand: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLOR_ACCENT,
    letterSpacing: 2,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLOR_DARK,
    marginBottom: 6,
  },
  headerMeta: {
    fontSize: 9,
    color: COLOR_MUTED,
    marginTop: 2,
  },
  clientCard: {
    backgroundColor: COLOR_BG_SOFT,
    padding: 14,
    marginBottom: 20,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLOR_ACCENT,
  },
  clientLabel: {
    fontSize: 8,
    color: COLOR_MUTED,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLOR_DARK,
  },
  clientCompany: {
    fontSize: 10,
    color: COLOR_MUTED,
    marginTop: 2,
  },
  clientEmail: {
    fontSize: 10,
    color: COLOR_MUTED,
    marginTop: 2,
  },
  h1: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLOR_DARK,
    marginTop: 18,
    marginBottom: 10,
  },
  h2: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLOR_ACCENT,
    marginTop: 14,
    marginBottom: 8,
  },
  h3: {
    fontSize: 11.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR_DARK,
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 10.5,
    color: COLOR_TEXT,
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
    color: COLOR_ACCENT,
    fontFamily: "Helvetica-Bold",
    width: 18,
  },
  listText: {
    fontSize: 10.5,
    color: COLOR_TEXT,
    lineHeight: 1.5,
    flex: 1,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
    marginVertical: 12,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
    color: COLOR_DARK,
  },
  italic: {
    fontFamily: "Helvetica-Oblique",
    color: COLOR_MUTED,
  },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    borderRadius: 2,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR_BG_SOFT,
    borderBottomWidth: 1.5,
    borderBottomColor: COLOR_ACCENT,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER_SOFT,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 6,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR_ACCENT,
    letterSpacing: 0.5,
  },
  tableCell: {
    flex: 1,
    padding: 6,
    fontSize: 9,
    color: COLOR_TEXT,
  },
  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDER,
    textAlign: "center",
    fontSize: 8,
    color: COLOR_MUTED,
  },
  pageNumber: {
    position: "absolute",
    bottom: 12,
    right: 48,
    fontSize: 8,
    color: COLOR_MUTED,
  },
});

function renderInlinePDF(text: string, keyPrefix: string): ReactElement[] {
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

function parseMarkdownForPDF(content: string): ReactElement[] {
  const lines = content.split("\n");
  const elements: ReactElement[] = [];

  let i = 0;
  let paragraphBuffer: string[] = [];

  const flushParagraph = (key: string) => {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(" ");
      elements.push(
        <Text key={key} style={styles.paragraph}>
          {renderInlinePDF(text, key)}
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
                    {renderInlinePDF(cell, `td-${i}-${rIdx}-${cIdx}`)}
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
          {renderInlinePDF(line.slice(2), `h1-${i}`)}
        </Text>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph(`p-${i}`);
      elements.push(
        <Text key={`h2-${i}`} style={styles.h2}>
          {renderInlinePDF(line.slice(3), `h2-${i}`)}
        </Text>
      );
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph(`p-${i}`);
      elements.push(
        <Text key={`h3-${i}`} style={styles.h3}>
          {renderInlinePDF(line.slice(4), `h3-${i}`)}
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
            {renderInlinePDF(orderedMatch[2], `ol-${i}`)}
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
            {renderInlinePDF(unorderedMatch[1], `ul-${i}`)}
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

export const QuotePDF = ({ quote }: { quote: Quote }) => {
  const dateFormatLocale = quote.locale === "es" ? "es-MX" : "en-US";
  const quoteLabel = quote.locale === "es" ? "Cotización" : "Quote";
  const dateLabel = quote.locale === "es" ? "Fecha" : "Date";
  const validLabel = quote.locale === "es" ? "Válida hasta" : "Valid until";
  const preparedLabel = quote.locale === "es" ? "PREPARADO PARA" : "PREPARED FOR";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
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

        {/* Client card */}
        <View style={styles.clientCard}>
          <Text style={styles.clientLabel}>{preparedLabel}</Text>
          <Text style={styles.clientName}>{quote.clientName}</Text>
          {quote.clientCompany && (
            <Text style={styles.clientCompany}>{quote.clientCompany}</Text>
          )}
          <Text style={styles.clientEmail}>{quote.clientEmail}</Text>
        </View>

        {/* Full rawContent rendered verbatim */}
        {quote.rawContent && <View>{parseMarkdownForPDF(quote.rawContent)}</View>}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Desarrollado por PRAGMA • Santiago Coronado • santiago.coronado94@gmail.com
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};
