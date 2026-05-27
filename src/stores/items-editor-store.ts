import { create } from "zustand";

import type { OrderItem } from "@/lib/order-items";

const EMPTY_ITEM: OrderItem = { category: null, description: null, quantity: 1 };

type ItemsEditorState = {
  items: OrderItem[];
  hydrate: (defaultItems?: OrderItem[]) => void;
  updateItem: (index: number, patch: Partial<OrderItem>) => void;
  removeItem: (index: number) => void;
  addItem: () => void;
};

export const useItemsEditorStore = create<ItemsEditorState>((set) => ({
  items: [{ ...EMPTY_ITEM }],

  hydrate: (defaultItems) =>
    set({
      items:
        defaultItems && defaultItems.length > 0
          ? defaultItems
          : [{ ...EMPTY_ITEM }],
    }),

  updateItem: (index, patch) =>
    set((s) => ({
      items: s.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    })),

  removeItem: (index) =>
    set((s) => ({
      items:
        s.items.length === 1
          ? [{ ...EMPTY_ITEM }]
          : s.items.filter((_, i) => i !== index),
    })),

  addItem: () =>
    set((s) => ({ items: [...s.items, { ...EMPTY_ITEM }] })),
}));
