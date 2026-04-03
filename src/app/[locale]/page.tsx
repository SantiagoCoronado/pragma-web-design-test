import type { Metadata } from "next";
import { Navbar } from "@/shared/components/layout/Navbar";
import { Footer } from "@/shared/components/layout/Footer";
import { Hero } from "@/features/landing/components/Hero";
import { Services } from "@/features/landing/components/Services";
import { About } from "@/features/landing/components/About";
import { CaseStudies } from "@/features/landing/components/CaseStudies";
import { Testimonials } from "@/features/landing/components/Testimonials";
import { Contact } from "@/features/landing/components/Contact";
import { JsonLd } from "@/shared/components/seo/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pragma.agency";

const META = {
  en: {
    title: "PRAGMA | AI & Technology Solutions",
    description:
      "Pragmatic AI solutions for real-world impact. Custom AI systems, web development, process automation, and consulting for businesses in Mexico and beyond.",
    keywords: [
      "AI consulting",
      "custom AI solutions",
      "machine learning",
      "web development",
      "process automation",
      "Mexico City",
      "PRAGMA",
    ],
    ogLocale: "en_US",
    ogAltLocale: "es_MX",
  },
  es: {
    title: "PRAGMA | Soluciones de IA y Tecnología",
    description:
      "Soluciones de IA pragmáticas para impacto real. Sistemas de IA personalizados, desarrollo web, automatización de procesos y consultoría para empresas.",
    keywords: [
      "consultoría IA",
      "soluciones de inteligencia artificial",
      "machine learning",
      "desarrollo web",
      "automatización",
      "Ciudad de México",
      "PRAGMA",
    ],
    ogLocale: "es_MX",
    ogAltLocale: "en_US",
  },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = META[locale as keyof typeof META] ?? META.en;
  const url = `${BASE_URL}/${locale}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: "PRAGMA" }],
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
      languages: {
        en: `${BASE_URL}/en`,
        es: `${BASE_URL}/es`,
      },
    },
    openGraph: {
      type: "website",
      locale: meta.ogLocale,
      alternateLocale: meta.ogAltLocale,
      url,
      siteName: "PRAGMA",
      title: meta.title,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PRAGMA",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "Pragmatic AI solutions for real-world impact. Custom AI systems, web development, and process automation.",
    email: "hello@pragma.agency",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mexico City",
      addressCountry: "MX",
    },
    sameAs: [],
  };

  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PRAGMA",
    url: `${BASE_URL}/${locale}`,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/${locale}#contact`,
    },
  };

  return (
    <>
      <JsonLd data={orgSchema} />
      <JsonLd data={servicesSchema} />
      <Navbar />
      <main>
        <Hero />
        <Services />
        <About />
        <CaseStudies />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
