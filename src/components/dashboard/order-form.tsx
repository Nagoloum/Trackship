"use client";

import { ArrowLeftRight, ArrowLeft, Save } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useMemo, useRef } from "react";

import {
  createOrderAction,
  updateOrderAction,
  type OrderState,
} from "@/app/actions/orders";
import { useOrderFormStore } from "@/stores/order-form-store";
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
  code?: string;
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

  // Hydrate the Zustand store once from props on first render
  const { fields, hydrate, setField, swap } = useOrderFormStore();
  const hydratedRef = useRef(false);
  if (!hydratedRef.current) {
    hydrate({
      recipient_name: defaults.recipient_name ?? "",
      recipient_email: defaults.recipient_email ?? "",
      recipient_phone: defaults.recipient_phone ?? "",
      recipient_address: defaults.recipient_address ?? "",
      sender_name: defaults.sender_name ?? "",
      sender_email: defaults.sender_email ?? "",
      sender_phone: defaults.sender_phone ?? "",
      sender_address: defaults.sender_address ?? "",
    });
    hydratedRef.current = true;
  }

  const set =
    (key: Parameters<typeof setField>[0]) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setField(key, e.target.value);

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

      {/* Tracking code – editable in edit mode only */}
      {mode === "edit" && (
        <div className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm md:p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider">
            {t("sections.tracking")}
          </h2>
          <div className="space-y-2">
            <Label htmlFor="code">{t("trackingCode")}</Label>
            <Input
              id="code"
              name="code"
              defaultValue={defaults.code ?? ""}
              placeholder="TS123456789FR"
              pattern="^TS\d{9}[A-Z]{2}$"
              className="font-mono uppercase"
              autoCapitalize="characters"
              maxLength={14}
            />
            <p className="text-muted-foreground text-xs">{t("trackingCodeHelp")}</p>
          </div>
        </div>
      )}

      <Section title={t("sections.recipient")}>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="recipient_name">
            {t("recipientName")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="recipient_name"
            name="recipient_name"
            value={fields.recipient_name}
            onChange={set("recipient_name")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipient_email">{t("recipientEmail")}</Label>
          <Input
            id="recipient_email"
            name="recipient_email"
            type="email"
            value={fields.recipient_email}
            onChange={set("recipient_email")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipient_phone">{t("recipientPhone")}</Label>
          <Input
            id="recipient_phone"
            name="recipient_phone"
            value={fields.recipient_phone}
            onChange={set("recipient_phone")}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="recipient_address">{t("recipientAddress")}</Label>
          <Textarea
            id="recipient_address"
            name="recipient_address"
            rows={3}
            value={fields.recipient_address}
            onChange={set("recipient_address")}
            placeholder={t("recipientAddressPlaceholder")}
          />
        </div>
        <Field
          id="recipient_delivery_hours"
          name="recipient_delivery_hours"
          label={t("recipientDeliveryHours")}
          defaultValue={defaults.recipient_delivery_hours ?? ""}
          placeholder={t("recipientDeliveryHoursPlaceholder")}
        />
      </Section>

      {/* Swap button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={swap}
        >
          <ArrowLeftRight className="h-4 w-4" />
          {t("swapSenderRecipient")}
        </Button>
      </div>

      <Section title={t("sections.sender")}>
        <p className="text-muted-foreground -mt-2 mb-1 text-xs sm:col-span-2">
          {t("senderHelp")}
        </p>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="sender_name">{t("senderName")}</Label>
          <Input
            id="sender_name"
            name="sender_name"
            value={fields.sender_name}
            onChange={set("sender_name")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sender_email">{t("senderEmail")}</Label>
          <Input
            id="sender_email"
            name="sender_email"
            type="email"
            value={fields.sender_email}
            onChange={set("sender_email")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sender_phone">{t("senderPhone")}</Label>
          <Input
            id="sender_phone"
            name="sender_phone"
            value={fields.sender_phone}
            onChange={set("sender_phone")}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="sender_address">{t("senderAddress")}</Label>
          <Input
            id="sender_address"
            name="sender_address"
            value={fields.sender_address}
            onChange={set("sender_address")}
            placeholder={t("senderAddressPlaceholder")}
          />
        </div>
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
