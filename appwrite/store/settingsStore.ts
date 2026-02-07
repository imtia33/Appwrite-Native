import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

interface SettingsState {
  hapticsEnabled: boolean;
  compactView: boolean;
  theme: "light" | "dark" | "system";
  setHapticsEnabled: (enabled: boolean) => void;
  setCompactView: (enabled: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hapticsEnabled: true,
      compactView: false,
      theme: "system",

      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
      setCompactView: (enabled) => set({ compactView: enabled }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "app-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
