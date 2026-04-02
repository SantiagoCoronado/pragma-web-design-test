import { Navbar } from "@/shared/components/layout/Navbar";
import { Footer } from "@/shared/components/layout/Footer";
import { Hero } from "@/features/landing/components/Hero";
import { Services } from "@/features/landing/components/Services";
import { About } from "@/features/landing/components/About";
import { CaseStudies } from "@/features/landing/components/CaseStudies";
import { Testimonials } from "@/features/landing/components/Testimonials";
import { Contact } from "@/features/landing/components/Contact";

export default function HomePage() {
  return (
    <>
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
