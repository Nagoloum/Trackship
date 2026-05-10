/**
 * Shown the moment the user navigates inside `/dashboard/*`. Mirrors the
 * dashboard chrome (sidebar + topbar already in the layout) so only the
 * inner content area animates, giving instant feedback.
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-2">
        <div className="bg-muted h-8 w-48 animate-pulse rounded-md" />
        <div className="bg-muted/60 h-4 w-72 animate-pulse rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card h-28 animate-pulse rounded-xl border shadow-sm"
          />
        ))}
      </div>
      <div className="bg-card h-64 animate-pulse rounded-xl border shadow-sm" />
    </div>
  );
}
