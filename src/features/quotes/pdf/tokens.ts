export type PdfVariant = "full" | "polish" | "dark";

export const pdfColors = {
  white: "#ffffff",

  ink: "#0a0e27",
  inkBody: "#1a1d3a",
  inkMuted: "#52525b",

  accentPrint: "#0e7490",
  accentPrintDeep: "#155e75",
  accentGlow: "#00f0ff",

  surfaceInk: "#0a0e27",
  surfaceInkSoft: "#12121a",
  surfaceSoft: "#f9f9fb",
  surfaceAccent: "#ecfeff",

  borderHair: "#e4e4e7",
  borderHairSoft: "#f0f0f0",
  borderAccent: "#67e8f9",

  inkOnDark: "#e4e4e7",
  inkOnDarkMuted: "#a1a1aa",

  pageDark: "#0a0a0f",
  borderDark: "#1e1e2e",
  mutedDark: "#71717a",

  discount: "#b91c1c",
} as const;

export const pdfFonts = {
  sans: "Helvetica",
  sansBold: "Helvetica-Bold",
  sansItalic: "Helvetica-Oblique",
} as const;

export const PDF_VARIANTS: PdfVariant[] = ["full", "polish", "dark"];

export function parseVariant(value: string | null | undefined): PdfVariant {
  if (value === "polish") return "polish";
  if (value === "dark") return "dark";
  return "full";
}
