"use client";

import type { Quote } from "@/features/quotes/types";
import { Card } from "@/shared/components/ui/Card";
import type { ReactNode } from "react";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Handle **bold** and *italic*
  const nodes: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-pragma-text">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      nodes.push(
        <em key={`${keyPrefix}-i-${i}`} className="italic text-pragma-muted">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + token.length;
    i++;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];

  let i = 0;
  let paragraphBuffer: string[] = [];
  let listBuffer: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = (key: string) => {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(" ");
      elements.push(
        <p key={key} className="text-pragma-text leading-relaxed">
          {renderInline(text, key)}
        </p>
      );
      paragraphBuffer = [];
    }
  };

  const flushList = (key: string) => {
    if (listBuffer && listBuffer.items.length > 0) {
      const Tag = listBuffer.ordered ? "ol" : "ul";
      const listClass = listBuffer.ordered
        ? "list-decimal pl-6 space-y-2 text-pragma-text marker:text-pragma-accent marker:font-semibold"
        : "list-disc pl-6 space-y-2 text-pragma-text marker:text-pragma-accent";
      elements.push(
        <Tag key={key} className={listClass}>
          {listBuffer.items.map((item, idx) => (
            <li key={`${key}-${idx}`} className="leading-relaxed">
              {renderInline(item, `${key}-${idx}`)}
            </li>
          ))}
        </Tag>
      );
      listBuffer = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushParagraph(`p-${i}`);
      flushList(`l-${i}`);

      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (r: string) =>
          r
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim());
        const header = parseRow(tableLines[0]);
        const rows = tableLines.slice(2).map(parseRow);

        elements.push(
          <Card key={`table-${i}`} className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pragma-border bg-pragma-accent/5">
                  {header.map((h, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-pragma-accent"
                    >
                      {renderInline(h, `th-${i}-${idx}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="border-b border-pragma-border/50 last:border-0 hover:bg-pragma-accent/5"
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 text-pragma-text align-top leading-relaxed">
                        {renderInline(cell, `td-${i}-${rIdx}-${cIdx}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        );
      }
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      flushParagraph(`p-${i}`);
      flushList(`l-${i}`);
      elements.push(
        <h1
          key={`h1-${i}`}
          className="font-display text-3xl sm:text-4xl font-bold text-pragma-text mt-8 mb-4"
        >
          {renderInline(line.slice(2), `h1-${i}`)}
        </h1>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph(`p-${i}`);
      flushList(`l-${i}`);
      elements.push(
        <h2
          key={`h2-${i}`}
          className="font-display text-xl sm:text-2xl font-bold text-pragma-accent mt-6 mb-3"
        >
          {renderInline(line.slice(3), `h2-${i}`)}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph(`p-${i}`);
      flushList(`l-${i}`);
      elements.push(
        <h3
          key={`h3-${i}`}
          className="font-display text-lg font-semibold text-pragma-text mt-4 mb-2"
        >
          {renderInline(line.slice(4), `h3-${i}`)}
        </h3>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (trimmed === "---" || trimmed === "***") {
      flushParagraph(`p-${i}`);
      flushList(`l-${i}`);
      elements.push(
        <hr key={`hr-${i}`} className="border-pragma-border my-6" />
      );
      i++;
      continue;
    }

    // Ordered list item
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      flushParagraph(`p-${i}`);
      if (!listBuffer || !listBuffer.ordered) {
        flushList(`l-${i}`);
        listBuffer = { ordered: true, items: [] };
      }
      listBuffer.items.push(orderedMatch[2]);
      i++;
      continue;
    }

    // Unordered list item
    const unorderedMatch = line.match(/^[-*]\s+(.*)/);
    if (unorderedMatch) {
      flushParagraph(`p-${i}`);
      if (!listBuffer || listBuffer.ordered) {
        flushList(`l-${i}`);
        listBuffer = { ordered: false, items: [] };
      }
      listBuffer.items.push(unorderedMatch[1]);
      i++;
      continue;
    }

    // Empty line
    if (trimmed === "") {
      flushParagraph(`p-${i}`);
      flushList(`l-${i}`);
      i++;
      continue;
    }

    // Regular text
    flushList(`l-${i}`);
    paragraphBuffer.push(line);
    i++;
  }

  flushParagraph("p-final");
  flushList("l-final");

  return <div className="space-y-4">{elements}</div>;
}

export const QuoteContent = ({ quote }: { quote: Quote }) => {
  const dateFormatLocale = quote.locale === "es" ? "es-MX" : "en-US";

  return (
    <div className="space-y-6">
      {/* Title + meta */}
      <div>
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-pragma-text">
          {quote.title}
        </h1>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-sm text-pragma-muted">
          <span>
            {quote.locale === "es" ? "Cotización" : "Quote"} #{quote.id}
          </span>
          <span>&middot;</span>
          <span>
            {new Date(quote.createdAt).toLocaleDateString(dateFormatLocale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {quote.validUntil && (
            <>
              <span>&middot;</span>
              <span>
                {quote.locale === "es" ? "Válida hasta" : "Valid until"}: {quote.validUntil}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Client card */}
      <Card>
        <p className="text-xs font-semibold text-pragma-muted uppercase tracking-wider mb-3">
          {quote.locale === "es" ? "Preparado para" : "Prepared for"}
        </p>
        <p className="font-display text-lg font-semibold text-pragma-text">
          {quote.clientName}
        </p>
        {quote.clientCompany && (
          <p className="text-sm text-pragma-muted mt-0.5">{quote.clientCompany}</p>
        )}
        <p className="text-sm text-pragma-muted">{quote.clientEmail}</p>
      </Card>

      {/* Full proposal content — rendered verbatim from rawContent */}
      {quote.rawContent && (
        <Card>
          <MarkdownRenderer content={quote.rawContent} />
        </Card>
      )}
    </div>
  );
};
