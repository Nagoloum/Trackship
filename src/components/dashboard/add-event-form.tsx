"use client";

import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useEffect, useRef } from "react";

import {
  addTrackingEventAction,
  type EventState,
} from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TRACKING_STATUSES, type TrackingStatus } from "@/lib/statuses";

const INITIAL_STATE: EventState = { status: "idle" };

function nowLocalInput() {
  // datetime-local expects YYYY-MM-DDTHH:mm in the local timezone.
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AddEventForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const t = useTranslations("dashboard.orders.events");
  const tStatus = useTranslations("status");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    addTrackingEventAction,
    INITIAL_STATE
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success" && formRef.current) {
      formRef.current.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-card text-card-foreground space-y-4 rounded-xl border p-5 shadow-sm md:p-6"
    >
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="locale" value={locale} />

      <h3 className="text-sm font-semibold uppercase tracking-wider">
        {t("addTitle")}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event-status">
            {t("status")} <span className="text-destructive">*</span>
          </Label>
          <select
            id="event-status"
            name="status"
            defaultValue={currentStatus}
            required
            className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 h-10 w-full rounded-lg border px-3 text-sm transition-colors outline-none"
          >
            {TRACKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {tStatus(s as TrackingStatus)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-date">{t("date")}</Label>
          <Input
            id="event-date"
            name="event_at"
            type="datetime-local"
            defaultValue={nowLocalInput()}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="event-location">{t("location")}</Label>
          <Input
            id="event-location"
            name="location"
            placeholder={t("locationPlaceholder")}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="event-description">{t("description")}</Label>
          <Textarea
            id="event-description"
            name="description"
            rows={2}
            placeholder={t("descriptionPlaceholder")}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="update_current"
          defaultChecked
          className="border-input text-primary focus-visible:ring-3 focus-visible:ring-ring/50 h-4 w-4 rounded border accent-[var(--color-primary)]"
        />
        <span>{t("setAsCurrent")}</span>
      </label>

      {state.status === "error" && (
        <p
          role="alert"
          className="text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm"
        >
          {t("error")}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={pending} className="gap-2">
          <Plus className="h-4 w-4" />
          {pending ? t("adding") : t("add")}
        </Button>
      </div>
    </form>
  );
}
