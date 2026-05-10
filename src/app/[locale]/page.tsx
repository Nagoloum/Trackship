import { setRequestLocale } from "next-intl/server";

import { ContactSection } from "@/components/landing/contact-section";
import { CoverageSection } from "@/components/landing/coverage-section";
import { CtaBanner } from "@/components/landing/cta-banner";
import { FaqSection } from "@/components/landing/faq-section";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ServicesSection } from "@/components/landing/services-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { StatsStrip } from "@/components/landing/stats-strip";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { WhyUsSection } from "@/components/landing/why-us-section";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HeroCarousel />
        <Reveal variant="fade">
          <StatsStrip />
        </Reveal>
        <Reveal>
          <ServicesSection />
        </Reveal>
        <Reveal>
          <HowItWorksSection />
        </Reveal>
        <Reveal>
          <WhyUsSection />
        </Reveal>
        <Reveal>
          <CoverageSection />
        </Reveal>
        <Reveal>
          <TestimonialsSection />
        </Reveal>
        <Reveal>
          <CtaBanner />
        </Reveal>
        <Reveal>
          <FaqSection />
        </Reveal>
        <Reveal>
          <ContactSection />
        </Reveal>
      </main>
      <SiteFooter />
    </>
  );
}
