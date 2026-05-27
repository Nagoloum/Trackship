"use client";

import { AlertCircle, Eye, EyeOff, LogIn } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";

import { loginAction, type LoginState } from "@/app/actions/auth";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: LoginState = { status: "idle" };

export function LoginForm({ from }: { from?: string }) {
  const t = useTranslations("auth.login");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_STATE);
  const { loginShowPassword, toggleLoginShowPassword } = useUiStore();

  const errorMessage =
    state.status === "error"
      ? state.reason === "invalid_credentials"
        ? t("errorInvalid")
        : state.reason === "missing_fields"
          ? t("errorMissing")
          : t("errorServer")
      : null;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      {from && <input type="hidden" name="from" value={from} />}

      <div className="space-y-2">
        <Label htmlFor="login-email">{t("email")}</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t("emailPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">{t("password")}</Label>
        <div className="relative">
          <Input
            id="login-password"
            name="password"
            type={loginShowPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder={t("passwordPlaceholder")}
            className="pr-10"
          />
          <button
            type="button"
            onClick={toggleLoginShowPassword}
            aria-label={loginShowPassword ? t("hidePassword") : t("showPassword")}
            aria-pressed={loginShowPassword}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute inset-y-0 right-0 flex items-center justify-center px-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded-r-md"
            tabIndex={0}
          >
            {loginShowPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="text-destructive bg-destructive/10 flex items-start gap-2 rounded-md px-3 py-2 text-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full gap-2">
        <LogIn className="h-4 w-4" />
        {pending ? t("loggingIn") : t("submit")}
      </Button>
    </form>
  );
}
