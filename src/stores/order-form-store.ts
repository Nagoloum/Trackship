import { create } from "zustand";

export type SwappableFields = {
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_address: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
};

type OrderFormState = {
  fields: SwappableFields;
  hydrate: (defaults: Partial<SwappableFields>) => void;
  setField: (key: keyof SwappableFields, value: string) => void;
  swap: () => void;
};

const EMPTY: SwappableFields = {
  recipient_name: "",
  recipient_email: "",
  recipient_phone: "",
  recipient_address: "",
  sender_name: "",
  sender_email: "",
  sender_phone: "",
  sender_address: "",
};

export const useOrderFormStore = create<OrderFormState>((set) => ({
  fields: { ...EMPTY },

  hydrate: (defaults) =>
    set({
      fields: {
        recipient_name: defaults.recipient_name ?? "",
        recipient_email: defaults.recipient_email ?? "",
        recipient_phone: defaults.recipient_phone ?? "",
        recipient_address: defaults.recipient_address ?? "",
        sender_name: defaults.sender_name ?? "",
        sender_email: defaults.sender_email ?? "",
        sender_phone: defaults.sender_phone ?? "",
        sender_address: defaults.sender_address ?? "",
      },
    }),

  setField: (key, value) =>
    set((s) => ({ fields: { ...s.fields, [key]: value } })),

  swap: () =>
    set((s) => ({
      fields: {
        recipient_name: s.fields.sender_name,
        recipient_email: s.fields.sender_email,
        recipient_phone: s.fields.sender_phone,
        recipient_address: s.fields.sender_address,
        sender_name: s.fields.recipient_name,
        sender_email: s.fields.recipient_email,
        sender_phone: s.fields.recipient_phone,
        sender_address: s.fields.recipient_address,
      },
    })),
}));
