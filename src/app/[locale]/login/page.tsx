import { ShieldCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { from } = await searchParams;
  const t = await getTranslations("auth.login");

  return (
    <main className="bg-muted/30 flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo width={160} height={40} />
        </Link>

        <div className="bg-card text-card-foreground rounded-2xl border p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold leading-tight">
                {t("title")}
              </h1>
              <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
            </div>
          </div>

          <LoginForm from={from} />
        </div>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          {t("notice")}
        </p>
      </div>
    </main>
  );
}
