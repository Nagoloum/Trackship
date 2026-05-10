/**
 * Canonical tracking statuses used everywhere in the app.
 * Keep this list in sync with the `status.*` keys in messages/*.json.
 */
export const TRACKING_STATUSES = [
  "pending",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "failed",
  "returned",
] as const;

export type TrackingStatus = (typeof TRACKING_STATUSES)[number];

export function isTrackingStatus(value: unknown): value is TrackingStatus {
  return (
    typeof value === "string" &&
    (TRACKING_STATUSES as readonly string[]).includes(value)
  );
}

/** Visual variant for the StatusBadge component. */
export type StatusTone = "neutral" | "info" | "warn" | "success" | "danger";

export const STATUS_TONE: Record<TrackingStatus, StatusTone> = {
  pending: "neutral",
  picked_up: "info",
  in_transit: "info",
  out_for_delivery: "warn",
  delivered: "success",
  failed: "danger",
  returned: "danger",
};
