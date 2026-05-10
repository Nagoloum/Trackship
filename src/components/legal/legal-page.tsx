import { Calendar } from "lucide-react";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/site-header";

type Section = {
  heading: string;
  body: string | string[];
};

export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: Section[];
}) {
  return (
    <>
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <header className="border-border/60 mb-10 border-b pb-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-3 text-balance">{intro}</p>
          <p className="text-muted-foreground mt-4 inline-flex items-center gap-2 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            {updated}
          </p>
        </header>

        <article className="space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold">{section.heading}</h2>
              <Body body={section.body} />
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

function Body({ body }: { body: string | string[] }) {
  const paragraphs = Array.isArray(body) ? body : [body];
  return (
    <div className="text-muted-foreground mt-3 space-y-3 text-sm leading-relaxed md:text-base">
      {paragraphs.map((p, i) => (
        <Paragraph key={i} text={p} />
      ))}
    </div>
  );
}

/**
 * Lightweight markdown-ish: lines starting with "- " become a bullet list.
 */
function Paragraph({ text }: { text: string }) {
  const lines = text.split("\n");
  const isList = lines.every((l) => l.trim().startsWith("- ") || l.trim() === "");
  if (isList) {
    return (
      <ul className="list-inside list-disc space-y-1.5 pl-1">
        {lines
          .filter((l) => l.trim().startsWith("- "))
          .map((l, i) => (
            <li key={i}>{l.trim().slice(2)}</li>
          ))}
      </ul>
    );
  }
  return <p>{text}</p>;
}

export function legalSectionsFromTranslations(
  raw: unknown
): { heading: string; body: string | string[] }[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (s): s is { heading: string; body: string | string[] } =>
      typeof s === "object" &&
      s !== null &&
      typeof (s as { heading?: unknown }).heading === "string" &&
      (typeof (s as { body?: unknown }).body === "string" ||
        Array.isArray((s as { body?: unknown }).body))
  );
}

export type { Section, ReactNode };
