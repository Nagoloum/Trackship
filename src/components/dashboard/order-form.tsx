"use client";

import { ArrowLeft, Save } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useMemo } from "react";

import {
  createOrderAction,
  updateOrderAction,
  type OrderState,
} from "@/app/actions/orders";
import { ItemsEditor } from "@/components/dashboard/items-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import type { OrderItem } from "@/lib/order-items";
import { TRACKING_STATUSES, type TrackingStatus } from "@/lib/statuses";
import { cn } from "@/lib/utils";

const INITIAL_STATE: OrderState = { status: "idle" };

export type OrderFormDefaults = {
  id?: string;
  recipient_name?: string;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  recipient_address?: string | null;
  recipient_address_line2?: string | null;
  recipient_city?: string | null;
  recipient_state?: string | null;
  recipient_postal_code?: string | null;
  recipient_delivery_hours?: string | null;
  sender_name?: string | null;
  sender_address?: string | null;
  sender_phone?: string | null;
  sender_email?: string | null;
  origin?: string;
  origin_country?: string;
  destination?: string;
  destination_country?: string;
  weight_kg?: number | null;
  declared_value?: number | null;
  vat_rate?: number | null;
  items?: OrderItem[];
  current_status?: string;
  notes?: string | null;
};

export function OrderForm({
  mode,
  defaults = {},
}: {
  mode: "create" | "edit";
  defaults?: OrderFormDefaults;
}) {
  const t = useTranslations("dashboard.orders.form");
  const tStatus = useTranslations("status");
  const locale = useLocale();
  const action = mode === "create" ? createOrderAction : updateOrderAction;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  const errorMessage =
    state.status === "error"
      ? (() => {
          try {
            return t(`errors.${state.message}`);
          } catch {
            return t("errors.server");
          }
        })()
      : null;

  const statusOptions = useMemo(
    () =>
      TRACKING_STATUSES.map((s) => ({
        value: s,
        label: tStatus(s as TrackingStatus),
      })),
    [tStatus]
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      {mode === "edit" && defaults.id && (
        <input type="hidden" name="id" value={defaults.id} />
      )}

      <Section title={t("sections.recipient")}>
        <Field
          id="recipient_name"
          name="recipient_name"
          label={t("recipientName")}
          defaultValue={defaults.recipient_name}
          required
          full
        />
        <Field
          id="recipient_email"
          name="recipient_email"
          type="email"
          label={t("recipientEmail")}
          defaultValue={defaults.recipient_email ?? ""}
        />
        <Field
          id="recipient_phone"
          name="recipient_phone"
          label={t("recipientPhone")}
          defaultValue={defaults.recipient_phone ?? ""}
        />
        <Field
          id="recipient_address"
          name="recipient_address"
          label={t("recipientAddress")}
          defaultValue={defaults.recipient_address ?? ""}
          placeholder={t("recipientAddressPlaceholder")}
          full
        />
        <Field
          id="recipient_address_line2"
          name="recipient_address_line2"
          label={t("recipientAddressLine2")}
          defaultValue={defaults.recipient_address_line2 ?? ""}
          placeholder={t("recipientAddressLine2Placeholder")}
          full
        />
        <Field
          id="recipient_postal_code"
          name="recipient_postal_code"
          label={t("recipientPostalCode")}
          defaultValue={defaults.recipient_postal_code ?? ""}
        />
        <Field
          id="recipient_city"
          name="recipient_city"
          label={t("recipientCity")}
          defaultValue={defaults.recipient_city ?? ""}
        />
        <Field
          id="recipient_state"
          name="recipient_state"
          label={t("recipientState")}
          defaultValue={defaults.recipient_state ?? ""}
        />
        <Field
          id="recipient_delivery_hours"
          name="recipient_delivery_hours"
          label={t("recipientDeliveryHours")}
          defaultValue={defaults.recipient_delivery_hours ?? ""}
          placeholder={t("recipientDeliveryHoursPlaceholder")}
        />
      </Section>

      <Section title={t("sections.sender")}>
        <p className="text-muted-foreground -mt-2 mb-1 text-xs sm:col-span-2">
          {t("senderHelp")}
        </p>
        <Field
          id="sender_name"
          name="sender_name"
          label={t("senderName")}
          defaultValue={defaults.sender_name ?? ""}
          full
        />
        <Field
          id="sender_email"
          name="sender_email"
          type="email"
          label={t("senderEmail")}
          defaultValue={defaults.sender_email ?? ""}
        />
        <Field
          id="sender_phone"
          name="sender_phone"
          label={t("senderPhone")}
          defaultValue={defaults.sender_phone ?? ""}
        />
        <Field
          id="sender_address"
          name="sender_address"
          label={t("senderAddress")}
          defaultValue={defaults.sender_address ?? ""}
          placeholder={t("senderAddressPlaceholder")}
          full
        />
      </Section>

      <SectionPlain title={t("sections.product")}>
        <p className="text-muted-foreground -mt-3 mb-4 text-xs">
          {t("itemsHelp")}
        </p>
        <ItemsEditor defaultItems={defaults.items} />
      </SectionPlain>

      <Section title={t("sections.shipment")}>
        <Field
          id="origin"
          name="origin"
          label={t("origin")}
          defaultValue={defaults.origin}
          required
          placeholder={t("originPlaceholder")}
        />
        <Field
          id="origin_country"
          name="origin_country"
          label={t("originCountry")}
          defaultValue={defaults.origin_country}
          required
          placeholder="FR"
          pattern="[A-Za-z]{2}"
          maxLength={2}
          uppercase
          help={t("countryHelp")}
        />
        <Field
          id="destination"
          name="destination"
          label={t("destination")}
          defaultValue={defaults.destination}
          required
          placeholder={t("destinationPlaceholder")}
        />
        <Field
          id="destination_country"
          name="destination_country"
          label={t("destinationCountry")}
          defaultValue={defaults.destination_country}
          required
          placeholder="DE"
          pattern="[A-Za-z]{2}"
          maxLength={2}
          uppercase
          help={t("destinationCountryHelp")}
        />
        <Field
          id="weight_kg"
          name="weight_kg"
          type="number"
          step="0.01"
          min="0"
          label={t("weight")}
          defaultValue={defaults.weight_kg ?? ""}
          placeholder="2.5"
        />
        <Field
          id="declared_value"
          name="declared_value"
          type="number"
          step="0.01"
          min="0"
          label={t("declaredValue")}
          defaultValue={defaults.declared_value ?? ""}
          placeholder="120.00"
        />
        <Field
          id="vat_rate"
          name="vat_rate"
          type="number"
          step="0.1"
          min="0"
          label={t("vatRate")}
          defaultValue={defaults.vat_rate != null ? defaults.vat_rate * 100 : 20}
          placeholder="20"
          help={t("vatRateHelp")}
        />
      </Section>

      <Section title={t("sections.status")}>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="current_status">{t("currentStatus")}</Label>
          <FormSelect
            id="current_status"
            name="current_status"
            defaultValue={defaults.current_status ?? "pending"}
            options={statusOptions}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={defaults.notes ?? ""}
            placeholder={t("notesPlaceholder")}
          />
        </div>
      </Section>

      {errorMessage && (
        <p
          role="alert"
          className="text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Link
          href={
            mode === "edit" && defaults.id
              ? `/dashboard/orders/${defaults.id}`
              : "/dashboard/orders"
          }
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "gap-2"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("cancel")}
        </Link>
        <Button type="submit" size="lg" disabled={pending} className="gap-2">
          <Save className="h-4 w-4" />
          {pending
            ? t("saving")
            : mode === "create"
              ? t("create")
              : t("save")}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm md:p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider">
        {title}
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

/** Variant of Section without the inner 2-col grid (used by ItemsEditor). */
function SectionPlain({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm md:p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  id,
  name,
  label,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
  pattern,
  maxLength,
  step,
  min,
  help,
  full = false,
  uppercase = false,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  pattern?: string;
  maxLength?: number;
  step?: string;
  min?: string;
  help?: string;
  full?: boolean;
  uppercase?: boolean;
}) {
  return (
    <div className={cn("space-y-2", full && "sm:col-span-2")}>
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        maxLength={maxLength}
        step={step}
        min={min}
        autoCapitalize={uppercase ? "characters" : undefined}
        className={uppercase ? "uppercase" : undefined}
      />
      {help && <p className="text-muted-foreground text-xs">{help}</p>}
    </div>
  );
}
