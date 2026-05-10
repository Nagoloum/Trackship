import { notFound } from "next/navigation";

/**
 * Catchall route under `[locale]` that triggers the locale-aware
 * `not-found.tsx`. Without it, unknown paths fall through to Next.js's
 * default global 404 (no layout, no translations) because there is no
 * top-level `app/not-found.tsx` — only the locale-scoped one.
 *
 * See https://next-intl.dev/docs/environments/error-files
 */
export default function CatchAllPage() {
  notFound();
}
