import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { getQuoteById } from "@/features/quotes/lib/queries";
import { QuotePdfDocument } from "@/features/quotes/components/QuotePdfDocument";
import { parseVariant } from "@/features/quotes/pdf/tokens";
import { rateLimit } from "@/shared/lib/rate-limit";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)
    .replace(/^-|-$/g, "");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";

  const limit = rateLimit(`pdf:${ip}`, { limit: 30, windowMs: 60 * 1000 });
  if (!limit.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { id } = await params;
  const quote = await getQuoteById(id);

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const variant = parseVariant(
    new URL(request.url).searchParams.get("variant")
  );

  let pdfComponent: ReactElement<DocumentProps>;

  if (quote.quoteType === "ai-generated") {
    const { quoteRegistry } = await import("@/generated-quotes/registry");
    const entry = quoteRegistry[quote.id];
    if (!entry) {
      return NextResponse.json({ error: "Quote PDF not found" }, { status: 404 });
    }
    pdfComponent = createElement(entry.QuotePDF, { quote, variant }) as ReactElement<DocumentProps>;
  } else {
    pdfComponent = createElement(QuotePdfDocument, { quote, variant }) as ReactElement<DocumentProps>;
  }

  const buffer = await renderToBuffer(pdfComponent);
  const uint8 = new Uint8Array(buffer);

  const clientSlug = slugify(quote.clientName);
  const titleSlug = slugify(quote.title);
  const suffix = variant === "dark" ? "-dark" : variant === "polish" ? "-polish" : "";
  const filename = `pragma-${clientSlug}-${titleSlug}${suffix}.pdf`;

  return new Response(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
