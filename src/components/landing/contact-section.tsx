"use client";

import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Send,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";

import { submitContactMessage, type ContactState } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/landing/services-section";
import { Textarea } from "@/components/ui/textarea";

const INITIAL_STATE: ContactState = { status: "idle" };

export function ContactSection() {
  const tc = useTranslations("landing.contact");
  const tForm = useTranslations("landing.contact.form");
  const tInfo = useTranslations("landing.contact.info");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    INITIAL_STATE
  );

  const errorMessage =
    state.status === "error"
      ? state.reason === "missing_fields"
        ? tForm("missingFields")
        : tForm("errorBody")
      : null;

  const infoItems = [
    { icon: <Mail className="h-4 w-4" />, label: tInfo("emailLabel"), value: tInfo("emailValue") },
    { icon: <MapPin className="h-4 w-4" />, label: tInfo("addressLabel"), value: tInfo("addressValue") },
    { icon: <Clock className="h-4 w-4" />, label: tInfo("hoursLabel"), value: tInfo("hoursValue") },
  ];

  return (
    <section
      id="contact"
      className="container mx-auto max-w-6xl px-4 py-20 md:py-24 scroll-mt-20"
    >
      <SectionHeader
        eyebrow={tc("eyebrow")}
        title={tc("title")}
        subtitle={tc("subtitle")}
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-5">
        {/* Info side */}
        <div className="space-y-5 lg:col-span-2">
          {infoItems.map((item) => (
            <div
              key={item.label}
              className="bg-card text-card-foreground flex items-start gap-3 rounded-xl border p-4 shadow-sm"
            >
              <span className="bg-primary/10 text-primary mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                {item.icon}
              </span>
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form side */}
        <div className="lg:col-span-3">
          {state.status === "success" ? (
            <div className="bg-card text-card-foreground rounded-xl border p-8 text-center shadow-sm">
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">
                {tForm("successTitle")}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                {tForm("successBody")}
              </p>
            </div>
          ) : (
            <form
              action={formAction}
              className="bg-card text-card-foreground space-y-4 rounded-xl border p-6 shadow-sm md:p-8"
              noValidate
            >
              <input type="hidden" name="locale" value={locale} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  id="contact-name"
                  name="name"
                  label={tForm("name")}
                  placeholder={tForm("namePlaceholder")}
                  required
                />
                <Field
                  id="contact-email"
                  name="email"
                  type="email"
                  label={tForm("email")}
                  placeholder={tForm("emailPlaceholder")}
                  required
                />
              </div>
              <Field
                id="contact-subject"
                name="subject"
                label={tForm("subject")}
                placeholder={tForm("subjectPlaceholder")}
              />
              <div className="space-y-2">
                <Label htmlFor="contact-message">
                  {tForm("message")} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  placeholder={tForm("messagePlaceholder")}
                />
              </div>

              {errorMessage && (
                <p
                  role="alert"
                  className="text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm"
                >
                  {errorMessage}
                </p>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" size="lg" disabled={pending} className="gap-2">
                  <Send className="h-4 w-4" />
                  {pending ? tForm("sending") : tForm("submit")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
