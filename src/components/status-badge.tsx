import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  isTrackingStatus,
  STATUS_TONE,
  type StatusTone,
} from "@/lib/statuses";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral:
    "bg-muted text-muted-foreground border-border",
  info:
    "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300",
  warn:
    "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300",
  success:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
  danger:
    "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-300",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const t = useTranslations("status");
  const tone: StatusTone = isTrackingStatus(status)
    ? STATUS_TONE[status]
    : "neutral";
  const label = isTrackingStatus(status) ? t(status) : status;

  return (
    <Badge
      variant="outline"
      className={cn("border", TONE_CLASSES[tone], className)}
    >
      {label}
    </Badge>
  );
}
