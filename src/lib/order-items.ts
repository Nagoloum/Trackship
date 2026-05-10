import { isProductCategory } from "@/lib/product-categories";

export type OrderItem = {
  category: string | null;
  description: string | null;
  quantity: number;
};

/**
 * Coerce arbitrary input (typically `JSON.parse(items)` from the form, or a
 * row's `items` column) into a clean array of OrderItem. Drops empty rows
 * (no category AND no description), clamps quantities to at least 1, and
 * validates the category against the catalog.
 */
export function normalizeOrderItems(raw: unknown): OrderItem[] {
  if (!Array.isArray(raw)) return [];
  const out: OrderItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const categoryRaw = typeof e.category === "string" ? e.category.trim() : "";
    const category =
      categoryRaw && isProductCategory(categoryRaw) ? categoryRaw : null;
    const descRaw =
      typeof e.description === "string" ? e.description.trim() : "";
    const description = descRaw.length > 0 ? descRaw : null;
    const qRaw = e.quantity;
    const qNum =
      typeof qRaw === "number"
        ? qRaw
        : typeof qRaw === "string"
          ? Number(qRaw)
          : NaN;
    const quantity =
      Number.isFinite(qNum) && qNum >= 1 ? Math.floor(qNum) : 1;
    if (!category && !description) continue;
    out.push({ category, description, quantity });
  }
  return out;
}

/**
 * Total quantity across all items (sum). Useful for "X items" badges.
 */
export function sumItemQuantity(items: OrderItem[]): number {
  return items.reduce((sum, it) => sum + (it.quantity || 0), 0);
}
