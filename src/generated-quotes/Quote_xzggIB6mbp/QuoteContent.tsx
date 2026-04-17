"use client";

import type { Quote } from "@/features/quotes/types";
import { Card } from "@/shared/components/ui/Card";

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
      {
        head: "Backend completo y panel de administración para el equipo de AMEXCAP",
        tail: ", donde gestionan socios, cuotas, documentos y comunicaciones desde un solo lugar — el centro de control que el equipo nunca ha tenido, donde finalmente cada socio, cada cuota y cada documento viven en un mismo sistema en lugar de estar dispersos en correos y hojas de Excel.",
      },
      {
        head: "Panel personal para cada socio",
        tail: ", con su estatus de membresía, su nivel de cuota, su fecha de renovación, sus documentos e historial — la primera vez que el socio tiene una razón real para entrar a la plataforma, porque encuentra todo lo suyo en un solo lugar y deja de depender de pedírselo al equipo por correo.",
      },
      {
        head: "Sistema de autenticación moderno",
        tail: " (correo + contraseña, o acceso por enlace) que reemplaza el número de membresía actual — los socios entran como entran a cualquier servicio digital serio, sin tener que recordar un número que siempre olvidan.",
      },
      {
        head: "Automatización completa del ciclo de renovación anual",
        tail: ": notificaciones automáticas, validación del tamaño de firma, asignación de cuota por rango, generación de documentos y facturación — en enero, el equipo deja de escribir 130 correos individuales; lo que hoy toma semanas pasa a tomar días, y libera al equipo para enfocarse en lo que sí mueve a la asociación.",
      },
      {
        head: "Sistema seguro de documentos donde los socios pueden compartir estudios y datos con la asociación",
        tail: ", con garantías visibles de confidencialidad, cifrado y manejo agregado de la información — los fondos por fin tienen un entorno en el que confían para compartir información sensible, lo que ataca de raíz la baja tasa de respuesta de los Excel trimestrales.",
      },
      {
        head: "Notificaciones automáticas multicanal",
        tail: " por correo electrónico, SMS y WhatsApp — boletines, recordatorios de renovación, avisos de eventos y comunicaciones generales llegan al socio por el canal que más usa, no por el que al equipo le toca enviar a mano.",
      },
      {
        head: "Web app de prueba que expone la funcionalidad desde el primer mes",
        tail: ", para que AMEXCAP vea, toque y valide el sistema sin esperar al final del proyecto — no compran una promesa, ven avances reales desde el inicio.",
      },
    ],
    result:
      "El equipo de AMEXCAP deja de operar como una agencia de correos en enero. Los socios estrenan una plataforma con la que sí quieren interactuar. Y por primera vez, los fondos cuentan con un canal seguro para alimentar a la asociación con la información que la industria necesita.",
    duration: "2 a 3 meses",
    investment: "$350,000 MXN",
  },
  {
    n: 2,
    title: "Reemplazo del sitio web y migración completa",
    solves: "Problema #6 y consolidación del ecosistema",
    intro:
      "Esta fase trae la cara pública de AMEXCAP al mismo nivel que la operación interna. Una vez que el equipo está usando el panel nuevo y los socios entran a su portal, el siguiente paso natural es que el sitio que ve el resto del mundo refleje también esa transformación. Aquí conectamos el panel de administración y el backend de la Fase 1 al sitio público, para que toda la presencia digital de AMEXCAP — interna y externa — viva en un solo ecosistema.",
    scope: [
      {
        head: "Reemplazo completo del sitio web actual de AMEXCAP",
        tail: ", construido sobre el mismo backend de la Fase 1 — conectamos nuestro panel de administración y nuestro backend al sitio que ve el público, para que el sitio externo y la operación interna vivan finalmente en el mismo ecosistema y hablen el mismo idioma.",
      },
      {
        head: "Diseño moderno, rápido y responsivo",
        tail: ", alineado al nivel y posición de AMEXCAP en la industria — la primera impresión que se llevan socios, prospectos, periodistas e inversionistas internacionales finalmente refleja lo que AMEXCAP realmente es.",
      },
      {
        head: "Migración del contenido relevante del sitio anterior",
        tail: ", preservando lo que vale la pena conservar y dejando atrás lo que no — sin perder el patrimonio digital que ya existe, pero estrenando una base limpia.",
      },
      {
        head: "Login de socios desde la portada",
        tail: ", conectado directamente al panel de la Fase 1 — un solo punto de entrada para todo lo que el socio necesita, sin que tenga que recordar entre qué sitio es para qué.",
      },
      {
        head: "Optimización para buscadores (SEO) y para dispositivos móviles",
        tail: " — más visibilidad orgánica para los estudios y publicaciones de AMEXCAP, y una experiencia consistente sin importar desde dónde se conecte el socio.",
      },
    ],
    result:
      "Una vez validados los cimientos en la Fase 1, todo el sitio público migra al nuevo ecosistema y queda alineado con el panel de administración. AMEXCAP deja de tener \u201Cel sistema viejo y el sistema nuevo\u201D y pasa a tener una sola plataforma, lista para construir lo que sigue.",
    duration: "0.5 a 1 mes",
    investment: "$200,000 MXN",
  },
  {
    n: 3,
    title: "Sistema de eventos",
    solves: "Problema #3 y distribución de publicaciones",
    intro:
      "Con la plataforma ya unificada, esta fase cierra el círculo construyendo el sistema de eventos sobre la base que ya existe. AMEXCAP deja de depender de proveedores externos para cada evento, los socios compran boletos con la misma cuenta que ya usan para todo lo demás, y la asociación abre una fuente de ingresos adicional con la venta a no socios. Es la fase donde la inversión empieza a generar retorno directo.",
    scope: [
      {
        head: "Módulo completo de gestión de eventos integrado al panel de administración",
        tail: ": creación, modificación y cierre de eventos desde un solo lugar — AMEXCAP deja de depender de proveedores externos para cada evento y toma control total de su propio calendario.",
      },
      {
        head: "Sistema de registro y venta de boletos vinculado a la identidad de socio",
        tail: " — el socio compra con la misma cuenta que ya usa para todo lo demás, y el sistema reconoce automáticamente sus privilegios y precios, sin que tenga que demostrar nada.",
      },
      {
        head: "Venta de boletos para no socios",
        tail: ", con un flujo público de checkout — los eventos abren su alcance más allá de la membresía y AMEXCAP estrena una nueva fuente de ingresos sin esfuerzo operativo adicional.",
      },
      {
        head: "Boletos digitales con integración a Apple Wallet y Google Wallet",
        tail: " — el socio guarda su boleto en el celular como cualquier pase de avión o entrada de concierto, y el día del evento entra con un escaneo, sin filas ni listas impresas.",
      },
      {
        head: "Notificaciones y recordatorios automáticos",
        tail: " de eventos vía WhatsApp y correo — invitaciones, confirmaciones y recordatorios salen solos, en lugar de tener al equipo persiguiendo a los socios uno por uno.",
      },
      {
        head: "Biblioteca digital de publicaciones y estudios con control de acceso",
        tail: ": los socios acceden con su cuenta, los no socios pueden comprar publicaciones individuales — los estudios que AMEXCAP produce dejan de vivir solo en bandejas de entrada y se convierten en un activo siempre disponible y monetizable.",
      },
      {
        head: "Historial de participación por socio",
        tail: " (a qué eventos asistió, qué publicaciones descargó) — AMEXCAP empieza por primera vez a entender quiénes son sus socios más activos y qué les interesa, abriendo la puerta a decisiones basadas en datos.",
      },
    ],
    result:
      "Sobre la plataforma ya unificada, AMEXCAP construye un sistema de eventos propio que elimina proveedores externos, integra la identidad de socio en cada compra, abre una nueva fuente de ingresos con la venta a no socios, y profesionaliza por completo la experiencia del día del evento.",
    duration: "0.5 a 1 mes",
    investment: "$150,000 MXN",
  },
];

const OPTIONAL_MODULES = [
  {
    code: "5.1",
    title: "Estrategia de distribución de contenido y redes sociales",
    body: "Publicación automatizada y recurrente de contenido de AMEXCAP en LinkedIn, X y otros canales, potenciada por inteligencia artificial — para que los estudios de la asociación dejen de ser un secreto bien guardado y empiecen a posicionar a AMEXCAP como referente informativo a nivel global.",
  },
  {
    code: "5.2",
    title: "Analítica de engagement de socios",
    body: "Tableros que muestren qué socios leen estudios, abren boletines, asisten a eventos y participan activamente — para identificar a los socios más comprometidos, detectar a los que están en riesgo de no renovar, y enfocar los esfuerzos de retención donde más importan.",
  },
  {
    code: "5.3",
    title: "CRM y automatización de comunicaciones",
    body: "Capa avanzada de comunicaciones con segmentación de audiencias, programación de envíos, plantillas reutilizables y métricas de apertura y clics — para convertir la operación de comunicación de AMEXCAP en una máquina de marketing profesional.",
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

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="space-y-2">
      <p className="font-display text-xs uppercase tracking-[0.25em] text-pragma-accent">
        {kicker}
      </p>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-pragma-text">
        {title}
      </h2>
    </div>
  );
}

export const QuoteContent = ({ quote }: { quote: Quote }) => {
  const formattedDate = new Date(quote.createdAt).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-xs font-display uppercase tracking-[0.25em] text-pragma-accent">
          <span>PRAGMA</span>
          <span className="h-px w-8 bg-pragma-accent/40" />
          <span className="text-pragma-muted">AMEXCAP</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-pragma-text leading-tight">
          {quote.title}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-pragma-muted">
          <span>Cotización #{quote.id}</span>
          <span>&middot;</span>
          <span>{formattedDate}</span>
          {quote.validUntil && (
            <>
              <span>&middot;</span>
              <span>Válida hasta: {quote.validUntil}</span>
            </>
          )}
        </div>
      </div>

      {/* Client card */}
      <Card className="border-l-4 border-l-pragma-accent">
        <p className="text-xs font-display uppercase tracking-[0.25em] text-pragma-muted mb-3">
          Preparado para
        </p>
        <p className="font-display text-xl font-bold text-pragma-text">
          {quote.clientName}
        </p>
        {quote.clientCompany && (
          <p className="text-sm text-pragma-muted mt-1">{quote.clientCompany}</p>
        )}
        <p className="text-sm text-pragma-muted">{quote.clientEmail}</p>
      </Card>

      {/* 1. Executive summary */}
      <section className="space-y-5">
        <SectionHeader kicker="01 — Resumen ejecutivo" title="Una plataforma integral, entregada por fases" />
        <Card className="space-y-4">
          <p className="text-pragma-text leading-relaxed">
            AMEXCAP es la voz de los fondos de inversión en México, con 130 socios entre fondos de
            capital de riesgo, crédito privado, crecimiento, infraestructura, energía y despachos
            especializados. Su operación, sin embargo, todavía depende de procesos manuales que
            consumen tiempo del equipo y limitan la experiencia que vive el socio.
          </p>
          <p className="text-pragma-text leading-relaxed">
            PRAGMA propone construir una{" "}
            <strong className="font-semibold text-pragma-text">plataforma integral</strong> que
            centralice la gestión de membresías, la comunicación con socios, los eventos y el sitio
            web, todo bajo una sola identidad de socio y un solo panel de administración. El
            proyecto se entrega en tres fases secuenciales para que AMEXCAP reciba funcionalidad
            útil desde el primer mes y pueda distribuir la inversión en el tiempo, financiando cada
            fase conforme entrega valor en lugar de absorber el costo total de un solo golpe.
          </p>
        </Card>
      </section>

      {/* 2. Current situation */}
      <section className="space-y-5">
        <SectionHeader kicker="02 — Situación actual" title="Seis retos operativos identificados" />
        <p className="text-pragma-muted leading-relaxed max-w-3xl">
          Durante la llamada de descubrimiento se identificaron los siguientes retos que hoy
          limitan la operación y la experiencia del socio:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PROBLEMS.map((p) => (
            <Card key={p.n} hover className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-pragma-accent/40 flex items-center justify-center font-display text-sm font-bold text-pragma-accent">
                  {p.n.toString().padStart(2, "0")}
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-base font-semibold text-pragma-text">
                    {p.title}
                  </h3>
                  <p className="text-sm text-pragma-muted leading-relaxed">{p.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Proposed solution */}
      <section className="space-y-5">
        <SectionHeader kicker="03 — Solución propuesta" title="Una sola plataforma" />
        <Card>
          <p className="text-pragma-text leading-relaxed">
            La mayoría de estos retos son síntomas de un mismo problema de fondo:{" "}
            <strong className="font-semibold text-pragma-text">
              AMEXCAP cuenta con sistemas, pero ninguno es efectivo ni cubre todas las
              funcionalidades que la asociación necesita.
            </strong>{" "}
            Algunos están abandonados, otros funcionan parcialmente, y ninguno habla con los demás.
            Cada proceso termina viviendo en un canal distinto (correo, Excel, proveedores
            externos, WhatsApp), sin un hilo común que los conecte.
          </p>
          <p className="text-pragma-text leading-relaxed mt-4">
            PRAGMA propone una{" "}
            <strong className="font-semibold text-pragma-text">plataforma integral</strong> que
            funcione como el sistema nervioso central de la asociación: una sola identidad de socio
            que conecte renovaciones, pagos, eventos, publicaciones, recolección de datos y
            comunicaciones. No son seis herramientas separadas, es una sola solución que ataca la
            raíz compartida de todos los problemas.
          </p>
        </Card>
      </section>

      {/* 4. Roadmap */}
      <section className="space-y-6">
        <SectionHeader kicker="04 — Hoja de ruta" title="Tres fases secuenciales" />
        <div className="space-y-6">
          {PHASES.map((phase) => (
            <Card key={phase.n} className="p-0 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-0">
                {/* Phase number panel */}
                <div className="bg-pragma-accent/5 border-b lg:border-b-0 lg:border-r border-pragma-border p-6 flex lg:flex-col items-center lg:items-start gap-4 lg:gap-3">
                  <div className="font-display text-5xl lg:text-6xl font-bold text-pragma-accent leading-none">
                    {phase.n.toString().padStart(2, "0")}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-display uppercase tracking-[0.2em] text-pragma-muted">
                      Fase
                    </p>
                    <p className="text-xs text-pragma-muted">{phase.duration}</p>
                    <p className="text-xs font-semibold text-pragma-accent">{phase.investment}</p>
                  </div>
                </div>

                {/* Phase body */}
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-pragma-text">
                      {phase.title}
                    </h3>
                    <p className="text-xs uppercase tracking-wider text-pragma-muted">
                      Resuelve: <span className="text-pragma-accent">{phase.solves}</span>
                    </p>
                  </div>

                  <p className="text-sm text-pragma-text leading-relaxed">{phase.intro}</p>

                  <div className="space-y-3">
                    <p className="text-xs font-display uppercase tracking-[0.2em] text-pragma-accent">
                      Alcance
                    </p>
                    <ul className="space-y-3">
                      {phase.scope.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-pragma-text leading-relaxed">
                          <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-pragma-accent" />
                          <span>
                            <strong className="font-semibold text-pragma-text">{item.head}</strong>
                            <span className="text-pragma-muted">{item.tail}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-pragma-border pt-4">
                    <p className="text-xs font-display uppercase tracking-[0.2em] text-pragma-accent mb-2">
                      Resultado esperado
                    </p>
                    <p className="text-sm text-pragma-text leading-relaxed italic">
                      {phase.result}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Optional modules */}
      <section className="space-y-5">
        <SectionHeader
          kicker="05 — Módulos opcionales"
          title="Expansiones habilitadas por la plataforma"
        />
        <p className="text-pragma-muted leading-relaxed max-w-3xl">
          Los siguientes módulos no forman parte del alcance principal, pero quedan habilitados
          gracias a los cimientos construidos y representan oportunidades naturales de expansión
          cuando la plataforma esté en marcha.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {OPTIONAL_MODULES.map((m) => (
            <Card key={m.code} hover className="space-y-3">
              <p className="font-display text-xs text-pragma-accent tracking-widest">{m.code}</p>
              <h3 className="font-display text-base font-semibold text-pragma-text leading-snug">
                {m.title}
              </h3>
              <p className="text-sm text-pragma-muted leading-relaxed">{m.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. Timeline & investment */}
      <section className="space-y-5">
        <SectionHeader kicker="06 — Cronograma e inversión" title="Inversión estimada por fase" />
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pragma-border bg-pragma-accent/5">
                  <th className="px-5 py-4 text-left font-display text-xs uppercase tracking-wider text-pragma-accent w-20">
                    Fase
                  </th>
                  <th className="px-5 py-4 text-left font-display text-xs uppercase tracking-wider text-pragma-accent">
                    Alcance
                  </th>
                  <th className="px-5 py-4 text-left font-display text-xs uppercase tracking-wider text-pragma-accent whitespace-nowrap">
                    Duración
                  </th>
                  <th className="px-5 py-4 text-right font-display text-xs uppercase tracking-wider text-pragma-accent whitespace-nowrap">
                    Inversión
                  </th>
                </tr>
              </thead>
              <tbody>
                {PHASES.map((phase) => (
                  <tr
                    key={phase.n}
                    className="border-b border-pragma-border/50 align-top"
                  >
                    <td className="px-5 py-4 font-display font-bold text-pragma-accent">
                      {phase.n.toString().padStart(2, "0")}
                    </td>
                    <td className="px-5 py-4 text-pragma-text leading-relaxed">
                      <div className="font-semibold text-pragma-text">{phase.title}</div>
                      <div className="text-xs text-pragma-muted mt-1">{phase.solves}</div>
                    </td>
                    <td className="px-5 py-4 text-pragma-muted whitespace-nowrap">
                      {phase.duration}
                    </td>
                    <td className="px-5 py-4 text-pragma-text font-semibold text-right whitespace-nowrap">
                      {phase.investment}
                    </td>
                  </tr>
                ))}
                <tr className="bg-pragma-accent/10">
                  <td className="px-5 py-4 font-display font-bold text-pragma-accent">Σ</td>
                  <td className="px-5 py-4 font-display font-bold text-pragma-text uppercase tracking-wider">
                    Total
                  </td>
                  <td className="px-5 py-4 text-pragma-text font-semibold whitespace-nowrap">
                    3 a 5 meses
                  </td>
                  <td className="px-5 py-4 font-display font-bold text-pragma-accent text-right whitespace-nowrap text-lg">
                    $700,000 MXN
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-sm text-pragma-muted italic max-w-3xl leading-relaxed">
          El modelo por fases permite que cada etapa entregue valor de forma independiente. No es
          necesario comprometerse con las tres fases desde el inicio — cada fase se puede aprobar y
          ejecutar por separado.
        </p>
      </section>

      {/* 7. Next steps */}
      <section className="space-y-5">
        <SectionHeader kicker="07 — Siguientes pasos" title="Cómo arrancamos" />
        <ol className="space-y-4">
          {NEXT_STEPS.map((step, idx) => (
            <li key={idx}>
              <Card hover className="flex items-start gap-5">
                <div className="flex-shrink-0 font-display text-2xl font-bold text-pragma-accent w-10 leading-none pt-1">
                  {(idx + 1).toString().padStart(2, "0")}
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-base font-semibold text-pragma-text">
                    {step.title}
                  </h3>
                  <p className="text-sm text-pragma-muted leading-relaxed">{step.body}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Signoff */}
      <div className="border-t border-pragma-border pt-6 space-y-1 text-sm text-pragma-muted italic">
        <p>Propuesta preparada por PRAGMA para AMEXCAP.</p>
        <p>Contacto: Santiago Coronado</p>
        <p>Fecha: abril 2026</p>
      </div>
    </div>
  );
};
