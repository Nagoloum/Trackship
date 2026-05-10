import { useFormatter, useLocale, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import type { TrackingEvent } from "@/lib/tracking-lookup";

export function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
  const t = useTranslations("track.details");
  const format = useFormatter();
  const locale = useLocale();

  if (events.length === 0) {
    return <p className="text-muted-foreground text-sm">{t("noEvents")}</p>;
  }

  // Each event is a flex row: left gutter (dot + connecting rail segment),
  // right content. The rail is a *part of the gutter* — it grows with the
  // content height, so the line never drifts away from the dots regardless
  // of how many lines of description an event has.
  return (
    <ol className="ts-timeline">
      {events.map((event, idx) => {
        const isLatest = idx === 0;
        const isLast = idx === events.length - 1;
        return (
          <li
            key={event.id}
            className="ts-timeline-item flex gap-4"
            style={{ animationDelay: `${Math.min(idx, 6) * 70}ms` }}
          >
            {/* Gutter: dot + rail segment */}
            <div className="flex flex-col items-center" aria-hidden>
              <span
                className={[
                  "ts-timeline-dot bg-background relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                  isLatest ? "border-primary" : "border-muted-foreground/40",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    isLatest
                      ? "bg-primary ts-timeline-pulse"
                      : "bg-muted-foreground/70",
                  ].join(" ")}
                />
              </span>
              {!isLast && (
                <span
                  className={[
                    "w-px flex-1 mt-1",
                    isLatest
                      ? "bg-linear-to-b from-primary/70 to-border/70"
                      : "bg-border/70",
                  ].join(" ")}
                />
              )}
            </div>

            {/* Content */}
            <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
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
                {isLatest && (
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                    {t("latest")}
                  </span>
                )}
              </div>

              {event.location && (
                <p className="text-muted-foreground mt-1.5 flex items-center gap-1 text-sm">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="wrap-break-word">{event.location}</span>
                </p>
              )}

              {event.description && (
                <p
                  className="text-foreground/90 mt-1 wrap-break-word text-sm leading-relaxed"
                  lang={locale}
                >
                  {event.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
