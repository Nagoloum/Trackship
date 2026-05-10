import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Circle, MapPin } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import type { TrackingEvent } from "@/lib/tracking-lookup";

export function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
  const t = useTranslations("track.details");
  const format = useFormatter();
  const locale = useLocale();

  if (events.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t("noEvents")}</p>
    );
  }

  return (
    <ol className="relative space-y-6 border-l border-border/60 pl-6">
      {events.map((event, idx) => {
        const isLatest = idx === 0;
        return (
          <li key={event.id} className="relative">
            <span
              className={[
                "absolute -left-[33px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2",
                isLatest
                  ? "border-primary bg-background"
                  : "border-border bg-background",
              ].join(" ")}
              aria-hidden
            >
              <Circle
                className={[
                  "h-2 w-2",
                  isLatest ? "fill-primary text-primary" : "fill-muted-foreground text-muted-foreground",
                ].join(" ")}
              />
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={event.status} />
              <time
                dateTime={event.event_at}
                className="text-muted-foreground text-xs"
              >
                {format.dateTime(new Date(event.event_at), {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </div>

            {event.location && (
              <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span>{event.location}</span>
              </p>
            )}

            {event.description && (
              <p
                className="mt-1 text-sm text-foreground/90"
                lang={locale}
              >
                {event.description}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
