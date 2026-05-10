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
    // The vertical rail is an absolute element so the dots can sit perfectly
    // on it; each list item has a left padding (pl-10) leaving 40px for
    // the dot + breathing room. The rail is at left-[14px] which centres on
    // the 16px-wide dots positioned at left-[6px].
    <ol className="relative space-y-6 pl-10">
      <span
        aria-hidden
        className="bg-border/70 absolute top-2 bottom-2 left-3.5 w-px"
      />
      {events.map((event, idx) => {
        const isLatest = idx === 0;
        return (
          <li key={event.id} className="relative">
            <span
              aria-hidden
              className={[
                "bg-background absolute top-1 left-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2",
                isLatest ? "border-primary" : "border-border",
              ].join(" ")}
            >
              <Circle
                className={[
                  "h-1.5 w-1.5",
                  isLatest
                    ? "fill-primary text-primary"
                    : "fill-muted-foreground text-muted-foreground",
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
