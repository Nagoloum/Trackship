import { getTranslations, setRequestLocale } from "next-intl/server";

import { LegalPage, legalSectionsFromTranslations } from "@/components/legal/legal-page";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");

  return (
    <LegalPage
      title={t("title")}
      intro={t("intro")}
      updated={t("updated")}
      sections={legalSectionsFromTranslations(t.raw("sections"))}
    />
  );
}
