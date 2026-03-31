import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIStore = {
  sidebarCollapsed: boolean;
  mobileOpen: boolean;
  collapsedGroups: Record<string, boolean>;
  toggleSidebar: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleGroup: (groupId: string) => void;
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileOpen: false,
      collapsedGroups: {},
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileOpen: (open) => set({ mobileOpen: open }),
      toggleGroup: (groupId) =>
        set((state) => ({
          collapsedGroups: {
            ...state.collapsedGroups,
            [groupId]: !state.collapsedGroups[groupId],
          },
        })),
    }),
    {
      name: "admin-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        collapsedGroups: state.collapsedGroups,
      }),
    },
  ),
);
