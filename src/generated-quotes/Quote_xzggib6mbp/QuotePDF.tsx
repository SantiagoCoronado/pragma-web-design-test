import type { Quote } from "@/features/quotes/types";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  pdfColors as c,
  pdfFonts as f,
  type PdfVariant,
} from "@/features/quotes/pdf/tokens";

const PROBLEMS = [
  {
    n: 1,
    title: "Renovación de membresías manual",
    body: "Cada año el equipo contacta uno por uno a los 130 socios por correo, valida manualmente el tamaño de cada firma, reasigna la cuota correspondiente, envía la documentación y genera facturas a mano.",
  },
  {
    n: 2,
    title: "Portal de socios abandonado",
    body: "El número de membresía que se le asigna a cada socio rara vez se usa; la mayoría lo pierde u olvida, y el equipo termina enviando todo por correo de cualquier manera.",
  },
  {
    n: 3,
    title: "Registro de eventos desconectado",
    body: "Para cada evento se contratan proveedores externos que construyen sitio y tienda de boletos desde cero, sin integración con la membresía.",
  },
  {
    n: 4,
    title: "Eventos cerrados difíciles de coordinar",
    body: "La única forma de invitar a socios es por correo, WhatsApp y llamadas, persiguiéndolos uno por uno.",
  },
  {
    n: 5,
    title: "Baja respuesta en la recolección de datos",
    body: "Los Excel trimestrales que se envían a los fondos casi no se contestan porque los fondos no confían en cómo se manejará su información.",
  },
  {
    n: 6,
    title: "Sitio web desactualizado",
    body: "El sitio actual no refleja el nivel de la asociación ni se integra con el resto de la operación.",
  },
];

const PHASES = [
  {
    n: 1,
    title: "Cimientos de la plataforma",
    solves: "Problemas #1, #2, #4 y #5",
    intro:
      "Esta primera fase construye el corazón del sistema: el backend, el panel de administración y el panel de socios. Es el módulo que reemplaza la operación manual del día a día — cómo se cobran las cuotas, cómo se comunica el equipo con los socios, dónde viven los documentos y cómo los fondos comparten información con la asociación. Sin esta base, ninguna de las fases siguientes puede existir; con ella, el equipo de AMEXCAP recupera control sobre su operación y los socios estrenan una experiencia digital que hoy no tienen.",
    scope: [
      "Backend completo y panel de administración para el equipo de AMEXCAP, donde gestionan socios, cuotas, documentos y comunicaciones desde un solo lugar.",
      "Panel personal para cada socio, con su estatus de membresía, nivel de cuota, fecha de renovación, documentos e historial.",
      "Sistema de autenticación moderno (correo + contraseña, o acceso por enlace) que reemplaza el número de membresía actual.",
      "Automatización completa del ciclo de renovación anual: notificaciones, validación del tamaño de firma, asignación de cuota, generación de documentos y facturación.",
      "Sistema seguro de documentos donde los socios pueden compartir estudios y datos, con confidencialidad, cifrado y manejo agregado.",
      "Notificaciones automáticas multicanal por correo electrónico, SMS y WhatsApp.",
      "Web app de prueba que expone la funcionalidad desde el primer mes, para validar el sistema en progreso y no al final.",
    ],
    result:
      "El equipo de AMEXCAP deja de operar como una agencia de correos en enero. Los socios estrenan una plataforma con la que sí quieren interactuar. Y por primera vez, los fondos cuentan con un canal seguro para alimentar a la asociación con la información que la industria necesita.",
    duration: "2 a 3 meses",
    investment: "$350,000 MXN",
    investmentAmount: 350000,
  },
  {
    n: 2,
    title: "Reemplazo del sitio web y migración completa",
    solves: "Problema #6 y consolidación del ecosistema",
    intro:
      "Esta fase trae la cara pública de AMEXCAP al mismo nivel que la operación interna. Conectamos el panel de administración y el backend de la Fase 1 al sitio público, para que toda la presencia digital de AMEXCAP — interna y externa — viva en un solo ecosistema.",
    scope: [
      "Reemplazo completo del sitio web actual, construido sobre el mismo backend de la Fase 1.",
      "Diseño moderno, rápido y responsivo, alineado al nivel y posición de AMEXCAP en la industria.",
      "Migración del contenido relevante del sitio anterior, preservando lo que vale la pena y dejando atrás lo que no.",
      "Login de socios desde la portada, conectado directamente al panel de la Fase 1.",
      "Optimización para buscadores (SEO) y para dispositivos móviles.",
    ],
    result:
      "Todo el sitio público migra al nuevo ecosistema y queda alineado con el panel de administración. AMEXCAP pasa a tener una sola plataforma, lista para construir lo que sigue.",
    duration: "0.5 a 1 mes",
    investment: "$200,000 MXN",
    investmentAmount: 200000,
  },
  {
    n: 3,
    title: "Sistema de eventos",
    solves: "Problema #3 y distribución de publicaciones",
    intro:
      "Con la plataforma ya unificada, esta fase cierra el círculo construyendo el sistema de eventos sobre la base que ya existe. AMEXCAP deja de depender de proveedores externos, los socios compran boletos con la misma cuenta que ya usan, y la asociación abre una fuente de ingresos adicional con la venta a no socios.",
    scope: [
      "Módulo completo de gestión de eventos integrado al panel de administración: creación, modificación y cierre de eventos.",
      "Sistema de registro y venta de boletos vinculado a la identidad de socio.",
      "Venta de boletos para no socios, con un flujo público de checkout — nueva fuente de ingresos.",
      "Boletos digitales con integración a Apple Wallet y Google Wallet.",
      "Notificaciones y recordatorios automáticos de eventos vía WhatsApp y correo.",
      "Biblioteca digital de publicaciones y estudios con control de acceso, monetizable para no socios.",
      "Historial de participación por socio (eventos, descargas) para decisiones basadas en datos.",
    ],
    result:
      "AMEXCAP construye un sistema de eventos propio que elimina proveedores externos, integra la identidad de socio en cada compra, abre una nueva fuente de ingresos y profesionaliza la experiencia del día del evento.",
    duration: "0.5 a 1 mes",
    investment: "$150,000 MXN",
    investmentAmount: 150000,
  },
];

const OPTIONAL_MODULES = [
  {
    code: "5.1",
    title: "Estrategia de distribución de contenido y redes sociales",
    body: "Publicación automatizada y recurrente de contenido de AMEXCAP en LinkedIn, X y otros canales, potenciada por IA, para posicionar a AMEXCAP como referente informativo a nivel global.",
  },
  {
    code: "5.2",
    title: "Analítica de engagement de socios",
    body: "Tableros que muestren qué socios leen estudios, abren boletines y asisten a eventos — para identificar a los más comprometidos y enfocar retención donde más importa.",
  },
  {
    code: "5.3",
    title: "CRM y automatización de comunicaciones",
    body: "Segmentación de audiencias, programación de envíos, plantillas y métricas de apertura y clics — convertir la comunicación de AMEXCAP en una máquina profesional.",
  },
];

const NEXT_STEPS = [
  {
    title: "Reunión de revisión de propuesta",
    body: "Agendar segunda llamada con José para revisar este documento, resolver dudas y definir prioridades.",
  },
  {
    title: "Definición de alcance detallado",
    body: "Tras la aprobación conceptual, PRAGMA realiza un sprint de descubrimiento para detallar requerimientos, flujos y estimaciones precisas de la Fase 1.",
  },
  {
    title: "Propuesta económica final",
    body: "Con el alcance detallado definido, se presenta la cotización formal de la primera fase.",
  },
  {
    title: "Arranque de proyecto",
    body: "Kickoff, plan de trabajo y primeras entregas.",
  },
];

const TOTAL_INVESTMENT = PHASES.reduce((sum, p) => sum + p.investmentAmount, 0);

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
  // Dark sidebars/total rows use a slightly-lifted card surface to stand out from the dark page.
  const darkPanel = isDark ? c.surfaceInkSoft : c.surfaceInk;

  return StyleSheet.create({
    page: {
      paddingTop: 48,
      paddingBottom: 60,
      paddingHorizontal: 48,
      fontSize: 10,
      fontFamily: f.sans,
      color: bodyText,
      backgroundColor: pageBg,
      lineHeight: 1.55,
    },
    pageFlush: {
      paddingTop: 0,
      paddingBottom: 60,
      paddingHorizontal: 0,
      fontSize: 10,
      fontFamily: f.sans,
      color: bodyText,
      backgroundColor: pageBg,
      lineHeight: 1.55,
    },
    pageInner: {
      paddingHorizontal: 48,
      paddingTop: 0,
      flex: 1,
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
      marginBottom: 22,
      paddingHorizontal: 48,
      paddingTop: 48,
      paddingBottom: 24,
      backgroundColor: darkPanel,
    },
    headerBandPolish: {
      marginBottom: 20,
      paddingBottom: 14,
      borderBottomWidth: 2,
      borderBottomColor: c.accentPrint,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      gap: 8,
    },
    brand: {
      fontSize: 9,
      fontFamily: f.sansBold,
      color: bold ? c.accentGlow : c.accentPrint,
      letterSpacing: 2,
    },
    brandSep: {
      fontSize: 9,
      color: bold ? c.inkOnDarkMuted : c.inkMuted,
    },
    brandClient: {
      fontSize: 9,
      color: bold ? c.inkOnDarkMuted : c.inkMuted,
      letterSpacing: 2,
      fontFamily: f.sansBold,
    },
    headerTitle: {
      fontSize: 20,
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
      marginBottom: 24,
      borderLeftWidth: 3,
      borderLeftColor: accentText,
    },
    clientLabel: {
      fontSize: 7.5,
      color: mutedText,
      fontFamily: f.sansBold,
      letterSpacing: 1.5,
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
      marginTop: 1,
    },
    sectionKicker: {
      fontSize: 8,
      fontFamily: f.sansBold,
      color: accentText,
      letterSpacing: 2,
      marginTop: 18,
      marginBottom: 6,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: f.sansBold,
      color: titleText,
      marginBottom: 10,
    },
    paragraph: {
      fontSize: 10,
      color: bodyText,
      lineHeight: 1.55,
      marginBottom: 8,
      textAlign: "justify",
    },
    muted: {
      fontSize: 9.5,
      color: mutedText,
      lineHeight: 1.55,
      marginBottom: 8,
    },
    bold: {
      fontFamily: f.sansBold,
      color: titleText,
    },
    italic: {
      fontFamily: f.sansItalic,
      color: mutedText,
    },
    problemsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 6,
      marginHorizontal: -4,
    },
    problemCard: {
      width: "50%",
      paddingHorizontal: 4,
      marginBottom: 8,
    },
    problemInner: {
      borderWidth: 1,
      borderColor: hairBorder,
      borderLeftWidth: bold ? 3 : 1,
      borderLeftColor: bold ? accentText : hairBorder,
      padding: 10,
      flexDirection: "row",
      gap: 8,
      minHeight: 80,
    },
    problemBadge: {
      fontSize: 10,
      fontFamily: f.sansBold,
      color: titleText,
      borderWidth: 1,
      borderColor: accentText,
      width: 22,
      height: 22,
      textAlign: "center",
      paddingTop: 4,
    },
    problemBody: {
      flex: 1,
    },
    problemTitle: {
      fontSize: 9.5,
      fontFamily: f.sansBold,
      color: titleText,
      marginBottom: 3,
    },
    problemText: {
      fontSize: 8.5,
      color: mutedText,
      lineHeight: 1.45,
    },
    phaseCard: {
      borderWidth: 1,
      borderColor: hairBorder,
      marginBottom: 14,
      flexDirection: "row",
    },
    phaseSide: {
      width: bold ? 120 : 110,
      backgroundColor: bold ? darkPanel : c.surfaceSoft,
      borderRightWidth: 1,
      borderRightColor: bold ? darkPanel : c.borderHair,
      padding: 12,
    },
    phaseNum: {
      fontSize: bold ? 44 : 36,
      fontFamily: f.sansBold,
      color: bold ? c.accentGlow : c.ink,
      lineHeight: 1,
      marginBottom: bold ? 10 : 4,
    },
    phaseNumUnderline: {
      width: 28,
      height: 2,
      backgroundColor: c.accentPrint,
      marginBottom: 10,
    },
    phaseSideLabel: {
      fontSize: 7,
      fontFamily: f.sansBold,
      color: bold ? c.inkOnDarkMuted : c.inkMuted,
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    phaseSideMeta: {
      fontSize: 8.5,
      color: bold ? c.inkOnDarkMuted : c.inkMuted,
      marginBottom: 2,
    },
    phaseSideInvest: {
      fontSize: 9.5,
      fontFamily: f.sansBold,
      color: bold ? c.accentGlow : c.ink,
      marginTop: 4,
    },
    phaseBody: {
      flex: 1,
      padding: 14,
    },
    phaseTitle: {
      fontSize: 13,
      fontFamily: f.sansBold,
      color: titleText,
      marginBottom: 3,
    },
    phaseSolves: {
      fontSize: 8,
      color: mutedText,
      letterSpacing: 1,
      marginBottom: 10,
    },
    phaseSolvesAccent: {
      color: accentDeep,
      fontFamily: f.sansBold,
    },
    phaseIntro: {
      fontSize: 9.5,
      color: bodyText,
      lineHeight: 1.55,
      marginBottom: 10,
      textAlign: "justify",
    },
    scopeLabel: {
      fontSize: 8,
      fontFamily: f.sansBold,
      color: accentText,
      letterSpacing: 1.5,
      marginBottom: 6,
    },
    scopeItem: {
      flexDirection: "row",
      marginBottom: 4,
      paddingRight: 4,
    },
    scopeBullet: {
      fontSize: 10,
      color: accentText,
      width: 10,
      fontFamily: f.sansBold,
    },
    scopeText: {
      fontSize: 9,
      color: bodyText,
      lineHeight: 1.5,
      flex: 1,
    },
    resultBlock: {
      marginTop: 10,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: hairBorderSoft,
    },
    resultLabel: {
      fontSize: 8,
      fontFamily: f.sansBold,
      color: accentText,
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    resultText: {
      fontSize: 9,
      color: bodyText,
      fontFamily: f.sansItalic,
      lineHeight: 1.5,
    },
    optionalGrid: {
      flexDirection: "row",
      gap: 8,
      marginTop: 6,
    },
    optionalCard: {
      flex: 1,
      borderWidth: 1,
      borderColor: hairBorder,
      borderTopWidth: bold ? 2 : 1,
      borderTopColor: bold ? accentText : hairBorder,
      padding: 10,
    },
    optionalCode: {
      fontSize: 9,
      fontFamily: f.sansBold,
      color: accentText,
      letterSpacing: 2,
      marginBottom: 4,
    },
    optionalTitle: {
      fontSize: 9.5,
      fontFamily: f.sansBold,
      color: titleText,
      marginBottom: 4,
    },
    optionalBody: {
      fontSize: 8.5,
      color: mutedText,
      lineHeight: 1.45,
    },
    ribbon: {
      marginTop: 8,
      marginBottom: 14,
      flexDirection: "row",
      height: 56,
      borderWidth: 1,
      borderColor: hairBorder,
    },
    ribbonSeg: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      justifyContent: "center",
      backgroundColor: darkPanel,
    },
    ribbonSegDivider: {
      width: 1,
      backgroundColor: isDark ? c.accentGlow : c.accentPrint,
      opacity: 0.4,
    },
    ribbonSegLabel: {
      fontSize: 7,
      fontFamily: f.sansBold,
      color: c.inkOnDarkMuted,
      letterSpacing: 1.5,
      marginBottom: 3,
    },
    ribbonSegAmount: {
      fontSize: 11,
      fontFamily: f.sansBold,
      color: c.accentGlow,
    },
    ribbonScale: {
      flexDirection: "row",
      marginBottom: 10,
      justifyContent: "space-between",
    },
    ribbonScaleLabel: {
      fontSize: 7,
      color: mutedText,
      fontFamily: f.sansBold,
      letterSpacing: 1,
    },
    table: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: hairBorder,
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
    tableRowTotal: {
      flexDirection: "row",
      backgroundColor: bold ? darkPanel : c.surfaceSoft,
      borderTopWidth: 2,
      borderTopColor: accentText,
    },
    thPhase: {
      width: 40,
      padding: 8,
      fontSize: 8,
      fontFamily: f.sansBold,
      color: titleText,
      letterSpacing: 1,
    },
    thScope: {
      flex: 1,
      padding: 8,
      fontSize: 8,
      fontFamily: f.sansBold,
      color: titleText,
      letterSpacing: 1,
    },
    thDur: {
      width: 90,
      padding: 8,
      fontSize: 8,
      fontFamily: f.sansBold,
      color: titleText,
      letterSpacing: 1,
    },
    thInv: {
      width: 95,
      padding: 8,
      fontSize: 8,
      fontFamily: f.sansBold,
      color: titleText,
      letterSpacing: 1,
      textAlign: "right",
    },
    tdPhase: {
      width: 40,
      padding: 8,
      fontSize: 10,
      fontFamily: f.sansBold,
      color: accentDeep,
    },
    tdScope: { flex: 1, padding: 8, fontSize: 9, color: bodyText },
    tdScopeTitle: {
      fontSize: 9.5,
      fontFamily: f.sansBold,
      color: titleText,
      marginBottom: 2,
    },
    tdScopeSolves: { fontSize: 8, color: mutedText },
    tdDur: { width: 90, padding: 8, fontSize: 9, color: mutedText },
    tdInv: {
      width: 95,
      padding: 8,
      fontSize: 9.5,
      fontFamily: f.sansBold,
      color: titleText,
      textAlign: "right",
    },
    tdTotalPhase: {
      width: 40,
      padding: 10,
      fontSize: 11,
      fontFamily: f.sansBold,
      color: bold ? c.accentGlow : c.accentPrintDeep,
    },
    tdTotalLabel: {
      flex: 1,
      padding: 10,
      fontSize: 10,
      fontFamily: f.sansBold,
      color: bold ? c.inkOnDark : c.ink,
      letterSpacing: 1.5,
    },
    tdTotalDur: {
      width: 90,
      padding: 10,
      fontSize: 9.5,
      fontFamily: f.sansBold,
      color: bold ? c.inkOnDark : c.ink,
    },
    tdTotalInv: {
      width: 95,
      padding: 10,
      fontSize: 12,
      fontFamily: f.sansBold,
      color: bold ? c.accentGlow : c.accentPrintDeep,
      textAlign: "right",
    },
    tableNote: {
      fontSize: 9,
      color: mutedText,
      fontFamily: f.sansItalic,
      marginTop: 8,
      lineHeight: 1.5,
    },
    nextStep: {
      flexDirection: "row",
      marginBottom: 10,
      gap: 10,
    },
    nextNum: {
      width: 30,
      fontSize: bold ? 26 : 20,
      fontFamily: f.sansBold,
      color: isDark ? c.inkOnDarkMuted : isFull ? c.borderHair : c.accentPrint,
      lineHeight: 1,
    },
    nextBody: {
      flex: 1,
    },
    nextTitle: {
      fontSize: 10,
      fontFamily: f.sansBold,
      color: titleText,
      marginBottom: 3,
    },
    nextText: {
      fontSize: 9,
      color: mutedText,
      lineHeight: 1.5,
    },
    signoff: {
      marginTop: 28,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: hairBorder,
    },
    signoffText: {
      fontSize: 9,
      color: mutedText,
      fontFamily: f.sansItalic,
      marginBottom: 2,
    },
    footer: {
      position: "absolute",
      left: 48,
      right: 48,
      bottom: 24,
      paddingTop: 8,
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

export const QuotePDF = ({
  quote,
  variant = "full",
}: {
  quote: Quote;
  variant?: PdfVariant;
}) => {
  const styles = makeStyles(variant);
  const bold = variant === "full" || variant === "dark";

  const formattedDate = new Date(quote.createdAt).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const renderRail = () => (bold ? <View style={styles.pageRail} fixed /> : null);

  const renderHeader = () => (
    <View style={bold ? styles.headerBandFull : styles.headerBandPolish}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>PRAGMA</Text>
        <Text style={styles.brandSep}>—</Text>
        <Text style={styles.brandClient}>AMEXCAP</Text>
      </View>
      <Text style={styles.headerTitle}>{quote.title}</Text>
      <Text style={styles.headerMeta}>Cotización #{quote.id}</Text>
      <Text style={styles.headerMeta}>Fecha: {formattedDate}</Text>
      {quote.validUntil && (
        <Text style={styles.headerMeta}>Válida hasta: {quote.validUntil}</Text>
      )}
    </View>
  );

  const page1Body = (
    <>
      <View style={styles.clientCard}>
        <Text style={styles.clientLabel}>PREPARADO PARA</Text>
        <Text style={styles.clientName}>{quote.clientName}</Text>
        {quote.clientCompany && (
          <Text style={styles.clientCompany}>{quote.clientCompany}</Text>
        )}
        <Text style={styles.clientEmail}>{quote.clientEmail}</Text>
      </View>

      <Text style={styles.sectionKicker}>01 — RESUMEN EJECUTIVO</Text>
      <Text style={styles.sectionTitle}>
        Una plataforma integral, entregada por fases
      </Text>
      <Text style={styles.paragraph}>
        AMEXCAP es la voz de los fondos de inversión en México, con 130 socios entre fondos de
        capital de riesgo, crédito privado, crecimiento, infraestructura, energía y despachos
        especializados. Su operación, sin embargo, todavía depende de procesos manuales que
        consumen tiempo del equipo y limitan la experiencia que vive el socio.
      </Text>
      <Text style={styles.paragraph}>
        PRAGMA propone construir una <Text style={styles.bold}>plataforma integral</Text> que
        centralice la gestión de membresías, la comunicación con socios, los eventos y el sitio
        web, todo bajo una sola identidad de socio y un solo panel de administración. El proyecto
        se entrega en tres fases secuenciales para que AMEXCAP reciba funcionalidad útil desde
        el primer mes y pueda distribuir la inversión en el tiempo.
      </Text>
    </>
  );

  return (
    <Document>
      <Page size="A4" style={bold ? styles.pageFlush : styles.page}>
        {renderRail()}
        {renderHeader()}
        {bold ? <View style={styles.pageInner}>{page1Body}</View> : page1Body}
      </Page>

      <Page size="A4" style={styles.page}>
        {renderRail()}
        <Text style={styles.sectionKicker}>02 — SITUACIÓN ACTUAL</Text>
        <Text style={styles.sectionTitle}>Seis retos operativos identificados</Text>
        <Text style={styles.muted}>
          Durante la llamada de descubrimiento se identificaron los siguientes retos que hoy
          limitan la operación y la experiencia del socio:
        </Text>
        <View style={styles.problemsGrid}>
          {PROBLEMS.map((p) => (
            <View key={p.n} style={styles.problemCard} wrap={false}>
              <View style={styles.problemInner}>
                <Text style={styles.problemBadge}>{p.n.toString().padStart(2, "0")}</Text>
                <View style={styles.problemBody}>
                  <Text style={styles.problemTitle}>{p.title}</Text>
                  <Text style={styles.problemText}>{p.body}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionKicker}>03 — SOLUCIÓN PROPUESTA</Text>
        <Text style={styles.sectionTitle}>Una sola plataforma</Text>
        <Text style={styles.paragraph}>
          La mayoría de estos retos son síntomas de un mismo problema de fondo:{" "}
          <Text style={styles.bold}>
            AMEXCAP cuenta con sistemas, pero ninguno es efectivo ni cubre todas las funcionalidades
            que la asociación necesita.
          </Text>{" "}
          Algunos están abandonados, otros funcionan parcialmente, y ninguno habla con los demás.
        </Text>
        <Text style={styles.paragraph}>
          PRAGMA propone una <Text style={styles.bold}>plataforma integral</Text> que funcione como
          el sistema nervioso central de la asociación: una sola identidad de socio que conecte
          renovaciones, pagos, eventos, publicaciones, recolección de datos y comunicaciones. No
          son seis herramientas separadas, es una sola solución que ataca la raíz compartida de
          todos los problemas.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        {renderRail()}
        <Text style={styles.sectionKicker}>04 — HOJA DE RUTA</Text>
        <Text style={styles.sectionTitle}>Tres fases secuenciales</Text>
        {PHASES.map((phase) => (
          <View key={phase.n} style={styles.phaseCard} wrap={false}>
            <View style={styles.phaseSide}>
              <Text style={styles.phaseNum}>
                {phase.n.toString().padStart(2, "0")}
              </Text>
              {!bold && <View style={styles.phaseNumUnderline} />}
              <Text style={styles.phaseSideLabel}>FASE</Text>
              <Text style={styles.phaseSideMeta}>{phase.duration}</Text>
              <Text style={styles.phaseSideInvest}>{phase.investment}</Text>
            </View>
            <View style={styles.phaseBody}>
              <Text style={styles.phaseTitle}>{phase.title}</Text>
              <Text style={styles.phaseSolves}>
                RESUELVE:{" "}
                <Text style={styles.phaseSolvesAccent}>
                  {phase.solves.toUpperCase()}
                </Text>
              </Text>
              <Text style={styles.phaseIntro}>{phase.intro}</Text>
              <Text style={styles.scopeLabel}>ALCANCE</Text>
              {phase.scope.map((item, idx) => (
                <View key={idx} style={styles.scopeItem}>
                  <Text style={styles.scopeBullet}>•</Text>
                  <Text style={styles.scopeText}>{item}</Text>
                </View>
              ))}
              <View style={styles.resultBlock}>
                <Text style={styles.resultLabel}>RESULTADO ESPERADO</Text>
                <Text style={styles.resultText}>{phase.result}</Text>
              </View>
            </View>
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        {renderRail()}
        <Text style={styles.sectionKicker}>05 — MÓDULOS OPCIONALES</Text>
        <Text style={styles.sectionTitle}>
          Expansiones habilitadas por la plataforma
        </Text>
        <Text style={styles.muted}>
          Los siguientes módulos no forman parte del alcance principal, pero quedan habilitados
          gracias a los cimientos construidos.
        </Text>
        <View style={styles.optionalGrid}>
          {OPTIONAL_MODULES.map((m) => (
            <View key={m.code} style={styles.optionalCard} wrap={false}>
              <Text style={styles.optionalCode}>{m.code}</Text>
              <Text style={styles.optionalTitle}>{m.title}</Text>
              <Text style={styles.optionalBody}>{m.body}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionKicker}>06 — CRONOGRAMA E INVERSIÓN</Text>
        <Text style={styles.sectionTitle}>Inversión estimada por fase</Text>

        {bold && (
          <>
            <View style={styles.ribbonScale}>
              <Text style={styles.ribbonScaleLabel}>DISTRIBUCIÓN DE LA INVERSIÓN</Text>
              <Text style={styles.ribbonScaleLabel}>
                TOTAL $700,000 MXN
              </Text>
            </View>
            <View style={styles.ribbon} wrap={false}>
              {PHASES.flatMap((phase, idx) => {
                const seg = (
                  <View
                    key={`seg-${phase.n}`}
                    style={[
                      styles.ribbonSeg,
                      { flex: phase.investmentAmount / TOTAL_INVESTMENT },
                    ]}
                  >
                    <Text style={styles.ribbonSegLabel}>
                      FASE {phase.n.toString().padStart(2, "0")}
                    </Text>
                    <Text style={styles.ribbonSegAmount}>{phase.investment}</Text>
                  </View>
                );
                if (idx === PHASES.length - 1) return [seg];
                return [
                  seg,
                  <View key={`div-${phase.n}`} style={styles.ribbonSegDivider} />,
                ];
              })}
            </View>
          </>
        )}

        <View style={styles.table} wrap={false}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.thPhase}>FASE</Text>
            <Text style={styles.thScope}>ALCANCE</Text>
            <Text style={styles.thDur}>DURACIÓN</Text>
            <Text style={styles.thInv}>INVERSIÓN</Text>
          </View>
          {PHASES.map((phase) => (
            <View key={phase.n} style={styles.tableRow}>
              <Text style={styles.tdPhase}>
                {phase.n.toString().padStart(2, "0")}
              </Text>
              <View style={styles.tdScope}>
                <Text style={styles.tdScopeTitle}>{phase.title}</Text>
                <Text style={styles.tdScopeSolves}>{phase.solves}</Text>
              </View>
              <Text style={styles.tdDur}>{phase.duration}</Text>
              <Text style={styles.tdInv}>{phase.investment}</Text>
            </View>
          ))}
          <View style={styles.tableRowTotal}>
            <Text style={styles.tdTotalPhase}>Σ</Text>
            <Text style={styles.tdTotalLabel}>TOTAL</Text>
            <Text style={styles.tdTotalDur}>3 a 5 meses</Text>
            <Text style={styles.tdTotalInv}>$700,000 MXN</Text>
          </View>
        </View>
        <Text style={styles.tableNote}>
          El modelo por fases permite que cada etapa entregue valor de forma independiente. No es
          necesario comprometerse con las tres fases desde el inicio — cada fase se puede aprobar
          y ejecutar por separado.
        </Text>

        <Text style={styles.sectionKicker}>07 — SIGUIENTES PASOS</Text>
        <Text style={styles.sectionTitle}>Cómo arrancamos</Text>
        {NEXT_STEPS.map((step, idx) => (
          <View key={idx} style={styles.nextStep} wrap={false}>
            <Text style={styles.nextNum}>
              {(idx + 1).toString().padStart(2, "0")}
            </Text>
            <View style={styles.nextBody}>
              <Text style={styles.nextTitle}>{step.title}</Text>
              <Text style={styles.nextText}>{step.body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.signoff}>
          <Text style={styles.signoffText}>
            Propuesta preparada por PRAGMA para AMEXCAP.
          </Text>
          <Text style={styles.signoffText}>Contacto: Santiago Coronado</Text>
          <Text style={styles.signoffText}>Fecha: abril 2026</Text>
        </View>

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
