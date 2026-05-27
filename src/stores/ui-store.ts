import { create } from "zustand";

type UiState = {
  // Mobile sidebar (dashboard)
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  // Site header (public)
  siteHeaderMenuOpen: boolean;
  setSiteHeaderMenuOpen: (open: boolean) => void;
  siteHeaderScrolled: boolean;
  setSiteHeaderScrolled: (scrolled: boolean) => void;

  // Language switcher
  languageSwitcherOpen: boolean;
  setLanguageSwitcherOpen: (open: boolean) => void;

  // Login form password visibility
  loginShowPassword: boolean;
  toggleLoginShowPassword: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  siteHeaderMenuOpen: false,
  setSiteHeaderMenuOpen: (open) => set({ siteHeaderMenuOpen: open }),

  siteHeaderScrolled: false,
  setSiteHeaderScrolled: (scrolled) => set({ siteHeaderScrolled: scrolled }),

  languageSwitcherOpen: false,
  setLanguageSwitcherOpen: (open) => set({ languageSwitcherOpen: open }),

  loginShowPassword: false,
  toggleLoginShowPassword: () =>
    set((s) => ({ loginShowPassword: !s.loginShowPassword })),
}));
