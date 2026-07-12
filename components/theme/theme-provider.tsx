"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useEffectEvent,
} from "react";
import { useServerInsertedHTML } from "next/navigation";
import {
  THEME_STORAGE_KEY,
  applyResolvedTheme,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const themeBootScript = `
(function () {
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var stored = localStorage.getItem(key);
    var preference = stored === "light" || stored === "dark" || stored === "auto" ? stored : "auto";
    var dark = preference === "dark" || (preference !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var theme = dark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("auto");
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return (
      <script
        id="theme-boot"
        dangerouslySetInnerHTML={{ __html: themeBootScript }}
      />
    );
  });

  const syncResolved = useEffectEvent((next: ThemePreference) => {
    const value = resolveTheme(next);
    setResolved(value);
    applyResolvedTheme(value);
  });

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const initial = isThemePreference(stored) ? stored : "auto";
    setPreferenceState(initial);
    syncResolved(initial);
  }, [syncResolved]);

  useEffect(() => {
    if (preference !== "auto") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => syncResolved("auto");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference, syncResolved]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      localStorage.setItem(THEME_STORAGE_KEY, next);
      syncResolved(next);
    },
    [syncResolved],
  );

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
