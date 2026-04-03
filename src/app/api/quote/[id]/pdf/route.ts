import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { renderToBuffer } from "@react-pdf/renderer";
import { getQuoteById } from "@/features/quotes/lib/queries";
import { QuotePdfDocument } from "@/features/quotes/components/QuotePdfDocument";
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
  _request: Request,
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

  const buffer = await renderToBuffer(QuotePdfDocument({ quote }));
  const uint8 = new Uint8Array(buffer);

  const clientSlug = slugify(quote.clientName);
  const titleSlug = slugify(quote.title);
  const filename = `pragma-${clientSlug}-${titleSlug}.pdf`;

  return new Response(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
