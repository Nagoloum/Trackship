import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "@/components/landing/services-section";

type FaqItem = { q: string; a: string };

export function FaqSection() {
  const t = useTranslations("landing.faq");
  const items = t.raw("items") as FaqItem[];

  return (
    <section
      id="faq"
      className="bg-muted/30 border-y border-border/60 scroll-mt-20"
    >
      <div className="container mx-auto max-w-3xl px-4 py-20 md:py-24">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <Accordion className="bg-card mt-12 rounded-xl border px-5 shadow-sm">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="py-4 text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                <p>{item.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
