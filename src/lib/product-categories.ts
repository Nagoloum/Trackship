/**
 * Canonical product categories for orders. The key is what's stored in
 * `orders.product_category`; the human label comes from the message catalog
 * (`productCategory.{key}`) so it can be localised.
 */
export const PRODUCT_CATEGORIES = [
  "electronics",
  "clothing",
  "books",
  "documents",
  "food",
  "cosmetics",
  "toys",
  "furniture",
  "home",
  "sports",
  "health",
  "tools",
  "jewelry",
  "spare_parts",
  "other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function isProductCategory(value: unknown): value is ProductCategory {
  return (
    typeof value === "string" &&
    (PRODUCT_CATEGORIES as readonly string[]).includes(value)
  );
}
