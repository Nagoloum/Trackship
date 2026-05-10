import { SiteHeader } from "@/components/site-header";

/**
 * Streamed instantly while the public tracking lookup runs (~200-500 ms on
 * Supabase cold). Same 9/3 grid as the real page so the layout never shifts.
 */
export default function TrackingDetailLoading() {
  return (
    <>
      <SiteHeader />
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="bg-muted mb-6 h-8 w-32 animate-pulse rounded-md" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-9">
            <div className="bg-card h-72 animate-pulse rounded-xl border shadow-sm" />
            <div className="bg-card h-96 animate-pulse rounded-xl border shadow-sm" />
          </div>
          <aside className="lg:col-span-3">
            <div className="bg-card h-96 animate-pulse rounded-xl border shadow-sm" />
          </aside>
        </div>
      </main>
    </>
  );
}
