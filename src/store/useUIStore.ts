import { create } from "zustand";

type UIState = {
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
  /** Universal search modal (`SearchModal`), opened from the navbar, any hero
   * `SearchBar`, or ⌘K / Ctrl+K. `searchSeed` pre-fills the input. */
  isSearchOpen: boolean;
  searchSeed: string;
  openSearch: (seed?: string) => void;
  closeSearch: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isMobileNavOpen: false,
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  toggleMobileNav: () =>
    set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  isSearchOpen: false,
  searchSeed: "",
  openSearch: (seed = "") =>
    set({ isSearchOpen: true, searchSeed: seed, isMobileNavOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
}));
