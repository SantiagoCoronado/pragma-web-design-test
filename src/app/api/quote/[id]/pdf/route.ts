import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getQuoteById } from "@/features/quotes/lib/queries";
import { QuotePdfDocument } from "@/features/quotes/components/QuotePdfDocument";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quote = await getQuoteById(id);

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(QuotePdfDocument({ quote }));
  const uint8 = new Uint8Array(buffer);

  return new Response(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="pragma-quote-${quote.id}.pdf"`,
    },
  });
}
