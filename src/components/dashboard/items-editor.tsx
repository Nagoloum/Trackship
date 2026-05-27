"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useRef } from "react";

import { useItemsEditorStore } from "@/stores/items-editor-store";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OrderItem } from "@/lib/order-items";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";

export function ItemsEditor({
  defaultItems,
  name = "items",
}: {
  defaultItems?: OrderItem[];
  name?: string;
}) {
  const t = useTranslations("dashboard.orders.form");
  const tCategory = useTranslations("productCategory");

  const { items, hydrate, updateItem, removeItem, addItem } = useItemsEditorStore();

  // Hydrate the store once from props on first render
  const hydratedRef = useRef(false);
  if (!hydratedRef.current) {
    hydrate(defaultItems);
    hydratedRef.current = true;
  }

  const categoryOptions = useMemo(
    () => PRODUCT_CATEGORIES.map((c) => ({ value: c, label: tCategory(c) })),
    [tCategory]
  );

  const serialised = JSON.stringify(
    items.map((it) => ({
      category: it.category || null,
      description: it.description || null,
      quantity: Number.isFinite(it.quantity) && it.quantity >= 1 ? Math.floor(it.quantity) : 1,
    }))
  );

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={serialised} />

      <ul className="space-y-4">
        {items.map((item, i) => (
          <li
            key={i}
            className="bg-muted/30 grid gap-4 rounded-lg border p-4 sm:grid-cols-12"
          >
            <div className="space-y-2 sm:col-span-5">
              <Label htmlFor={`item-${i}-category`}>
                {t("productCategory")}
              </Label>
              <FormSelect
                id={`item-${i}-category`}
                name={`__item_${i}_category`}
                value={item.category ?? ""}
                onChange={(v) => updateItem(i, { category: v || null })}
                options={categoryOptions}
                placeholder={tCategory("_placeholder")}
              />
            </div>

            <div className="space-y-2 sm:col-span-5">
              <Label htmlFor={`item-${i}-description`}>
                {t("productDescription")}
              </Label>
              <Textarea
                id={`item-${i}-description`}
                rows={1}
                value={item.description ?? ""}
                onChange={(e) =>
                  updateItem(i, { description: e.target.value || null })
                }
                placeholder={t("productDescriptionPlaceholder")}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`item-${i}-quantity`}>{t("quantity")}</Label>
              <Input
                id={`item-${i}-quantity`}
                type="number"
                min={1}
                step={1}
                value={item.quantity}
                onChange={(e) =>
                  updateItem(i, {
                    quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                  })
                }
              />
            </div>

            <div className="flex justify-end sm:col-span-12">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(i)}
                className="text-destructive hover:bg-destructive/10 gap-1.5"
                disabled={items.length === 1 && !item.category && !item.description}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("removeItem")}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        {t("addItem")}
      </Button>
    </div>
  );
}
