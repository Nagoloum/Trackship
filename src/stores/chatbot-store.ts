import { create } from "zustand";

export type ChatMessage = {
  id: string;
  role: "bot" | "user";
  content: string;
};

type ChatbotState = {
  open: boolean;
  messages: ChatMessage[];
  input: string;

  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setInput: (input: string) => void;
  pushMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
};

export const useChatbotStore = create<ChatbotState>((set) => ({
  open: false,
  messages: [],
  input: "",

  setOpen: (open) => set({ open }),
  toggleOpen: () => set((s) => ({ open: !s.open })),
  setInput: (input) => set({ input }),
  pushMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),
  clearMessages: () => set({ messages: [] }),
}));
