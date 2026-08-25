/**
 * Theme resolution helpers.
 *
 * The stored theme value is one of "light" | "dark" | "auto" (system).
 * `resolveTheme` maps it to the effective "light" | "dark" used to toggle
 * the `.dark` class. Kept framework-free so the same logic can run inline
 * in index.html (anti-flash bootstrap, before React mounts) and in the
 * useTheme hook, and be unit-tested in isolation.
 */

export type StoredTheme = "light" | "dark" | "auto";
export type EffectiveTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function isStoredTheme(value: unknown): value is StoredTheme {
  return value === "light" || value === "dark" || value === "auto";
}

export function readStoredTheme(storage: Pick<Storage, "getItem">): StoredTheme {
  try {
    const raw = storage.getItem(THEME_STORAGE_KEY);
    if (raw && isStoredTheme(raw)) return raw;
  } catch {
    // localStorage may be unavailable (e.g. sandboxed/blocked) — fall through
  }
  return "auto";
}

/** Resolve a stored theme (with system preference) to the effective theme. */
export function resolveTheme(stored: StoredTheme, prefersDark: boolean): EffectiveTheme {
  if (stored === "auto") return prefersDark ? "dark" : "light";
  return stored;
}

/**
 * Apply (or remove) the `.dark` class on the document root.
 * `html` and `body` both carry the class so any code that queries either
 * sees a consistent state.
 */
export function applyThemeClass(
  root: Pick<HTMLElement, "classList">,
  body: Pick<HTMLElement, "classList">,
  effective: EffectiveTheme
): void {
  const isDark = effective === "dark";
  root.classList.toggle("dark", isDark);
  body.classList.toggle("dark", isDark);
}
