"use client";

import {
  AboutSection,
  ContactSection,
  ConversionPathSection,
  HeroBlock,
  PartnersBlock,
  ServicesSection,
  StatsSection,
  TeamSection,
  TestimonialsSection,
} from "@/components/home";

export default function AppPage() {
  return (
    <main className="bg-white">
      <HeroBlock />
      <ConversionPathSection />

      <section className="py-14 sm:py-20">
        <ServicesSection />
      </section>

      <StatsSection />

      <section className="py-14 sm:py-16">
        <AboutSection />
      </section>

      <PartnersBlock />

      <section className="bg-gray-50/70 py-12 sm:py-14">
        <TestimonialsSection />
      </section>

      <section className="py-12 sm:py-14">
        <TeamSection />
      </section>

      <section className="bg-gray-50">
        <ContactSection />
      </section>
    </main>
  );
}
