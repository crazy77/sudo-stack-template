import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIStore = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: "admin-ui" },
  ),
);
