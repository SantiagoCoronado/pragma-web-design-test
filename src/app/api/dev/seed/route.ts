import { NextResponse } from "next/server";
import { createQuote } from "@/features/quotes/lib/queries";

export const dynamic = "force-dynamic";

const SAMPLE_QUOTES = [
  {
    clientName: "Carlos Ramírez",
    clientEmail: "carlos@startupai.mx",
    clientCompany: "StartupAI MX",
    title: "AI Chatbot & Automation Platform",
    description:
      "Full development of a customer-facing AI chatbot integrated with WhatsApp and web, plus backend automation for lead qualification.",
    quoteType: "line-items" as const,
    lineItems: [
      { id: "li1", description: "AI Chatbot Development", quantity: 1, unitPrice: 45000 },
      { id: "li2", description: "WhatsApp Business API Integration", quantity: 1, unitPrice: 12000 },
      { id: "li3", description: "Lead Qualification Automation", quantity: 1, unitPrice: 18000 },
      { id: "li4", description: "Training & Documentation", quantity: 1, unitPrice: 5000 },
      { id: "li5", description: "Monthly Support (3 months)", quantity: 3, unitPrice: 4500 },
    ],
    currency: "MXN" as const,
    discount: 10,
    notes:
      "Pago: 50% al inicio, 50% al entregable final.\nTiempo estimado: 6 semanas.\nIncluye 3 meses de soporte post-lanzamiento.",
    status: "sent" as const,
    validUntil: "2026-04-30",
    locale: "es" as const,
  },
  {
    clientName: "Sarah Johnson",
    clientEmail: "sarah@databridge.io",
    clientCompany: "DataBridge Analytics",
    title: "Custom BI Dashboard & Data Pipeline",
    description:
      "End-to-end data infrastructure: ETL pipeline from 3 sources, custom dashboards in React, and weekly automated reports.",
    quoteType: "line-items" as const,
    lineItems: [
      { id: "li1", description: "ETL Pipeline (3 data sources)", quantity: 1, unitPrice: 8500 },
      { id: "li2", description: "Custom BI Dashboard", quantity: 1, unitPrice: 6000 },
      { id: "li3", description: "Automated Weekly Reports", quantity: 1, unitPrice: 2500 },
      { id: "li4", description: "Data Model Design", quantity: 1, unitPrice: 3000 },
    ],
    currency: "USD" as const,
    discount: 0,
    notes:
      "Payment: Net 30 after project kickoff.\nEstimated timeline: 5 weeks.\nHosting and infrastructure costs billed separately.",
    status: "accepted" as const,
    validUntil: "2026-05-15",
    locale: "en" as const,
  },
  {
    clientName: "Miguel Torres",
    clientEmail: "miguel@comercialmx.com",
    clientCompany: "Comercial MX",
    title: "E-Commerce Platform with AI Recommendations",
    description:
      "Modern e-commerce site built on Next.js with AI-powered product recommendations and inventory management.",
    quoteType: "line-items" as const,
    lineItems: [
      { id: "li1", description: "E-Commerce Website (Next.js)", quantity: 1, unitPrice: 60000 },
      { id: "li2", description: "AI Recommendation Engine", quantity: 1, unitPrice: 25000 },
      { id: "li3", description: "Admin Panel & Inventory System", quantity: 1, unitPrice: 15000 },
      { id: "li4", description: "Payment Gateway Integration", quantity: 1, unitPrice: 8000 },
      { id: "li5", description: "SEO & Performance Optimization", quantity: 1, unitPrice: 7000 },
    ],
    currency: "MXN" as const,
    discount: 5,
    notes: "Pago en 3 parcialidades: 30% inicio, 40% mitad del proyecto, 30% al cierre.",
    status: "draft" as const,
    validUntil: "2026-05-01",
    locale: "es" as const,
  },
  {
    clientName: "Diego Perezcano",
    clientEmail: "diego@texasribs.mx",
    clientCompany: "Texas Ribs",
    title: "Automatización de Punto de Venta & Experiencia Digital",
    description: "",
    quoteType: "blueprint" as const,
    lineItems: [],
    currency: "MXN" as const,
    discount: 0,
    notes: "",
    status: "sent" as const,
    validUntil: "2026-04-30",
    locale: "es" as const,
    problem:
      "Texas Ribs opera con sistemas desconectados — el punto de venta no habla con la cocina, los pedidos se pierden en papel, y el equipo pierde 2-3 horas diarias reconciliando cuentas manualmente.",
    opportunity:
      "Con una plataforma integrada, podemos eliminar el 90% del trabajo manual de reconciliación y reducir los errores de pedido en un 70%, ahorrando aproximadamente $15,000 MXN mensuales en tiempo operativo.",
    deliverables: [
      {
        id: "d1",
        number: 1,
        title: "Sistema de Punto de Venta Digital",
        description:
          "Tablet-based POS con menú digital, gestión de mesas y cierre de caja automático.",
      },
      {
        id: "d2",
        number: 2,
        title: "Panel de Cocina (KDS)",
        description:
          "Pantalla en cocina que recibe órdenes en tiempo real, elimina el papel.",
      },
      {
        id: "d3",
        number: 3,
        title: "Reportes & Dashboard",
        description:
          "Dashboard web con ventas diarias, productos más pedidos y alertas de inventario.",
      },
      {
        id: "d4",
        number: 4,
        title: "Capacitación & Soporte",
        description:
          "2 sesiones de capacitación con el equipo + soporte vía WhatsApp por 30 días.",
      },
    ],
    timeline: "3 semanas",
    fixedPrice: 35000,
    listPrice: 60000,
    preferentialNote: "Por tratarse de la familia Perezcano",
    paymentTerms: "50% al arranque, 50% a la entrega",
    nextSteps: [
      "Responder este correo con tu aprobación",
      "Agendar llamada de kickoff (30 min)",
      "Compartir acceso al sistema actual para diagnóstico",
    ],
    scopeNote:
      "Esta propuesta cubre el desarrollo e implementación del sistema descrito. Cambios de alcance fuera de este documento se cotizarán por separado.",
  },
];

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const results = await Promise.all(SAMPLE_QUOTES.map((q) => createQuote(q)));

  const quotes = results.map((q) => ({
    id: q.id,
    title: q.title,
    type: q.quoteType,
    status: q.status,
    client: q.clientName,
    viewUrl: `/${q.locale}/quote/${q.id}`,
  }));

  return NextResponse.json({
    message: `Seeded ${quotes.length} sample quotes`,
    quotes,
  });
}
