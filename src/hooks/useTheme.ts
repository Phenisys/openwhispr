import { useEffect } from "react";
import { useSettings } from "./useSettings";
import {
  applyThemeClass,
  readStoredTheme,
  resolveTheme,
  type EffectiveTheme,
} from "../utils/theme";

const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export function useTheme() {
  const { theme, setTheme } = useSettings();

  useEffect(() => {
    const htmlElement = document.documentElement;

    // Determine effective theme (stored value, or system preference when auto)
    const stored = readStoredTheme(window.localStorage);
    const effectiveTheme: EffectiveTheme = resolveTheme(
      stored,
      window.matchMedia(DARK_SCHEME_QUERY).matches
    );
    applyThemeClass(htmlElement, document.body, effectiveTheme);

    // Follow the system preference while the theme is set to "auto"
    if (theme === "auto") {
      const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY);
      const handler = (e: MediaQueryListEvent) => {
        applyThemeClass(htmlElement, document.body, e.matches ? "dark" : "light");
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  return { theme, setTheme };
}
