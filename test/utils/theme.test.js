const test = require("node:test");
const assert = require("node:assert/strict");

const load = () => import("../../src/utils/theme.ts");

test("isStoredTheme accepts only light/dark/auto", async () => {
  const { isStoredTheme } = await load();
  assert.equal(isStoredTheme("light"), true);
  assert.equal(isStoredTheme("dark"), true);
  assert.equal(isStoredTheme("auto"), true);
  assert.equal(isStoredTheme("system"), false);
  assert.equal(isStoredTheme(""), false);
  assert.equal(isStoredTheme(null), false);
  assert.equal(isStoredTheme(undefined), false);
  assert.equal(isStoredTheme(42), false);
});

test("readStoredTheme returns the persisted value when valid", async () => {
  const { readStoredTheme } = await load();
  const storage = { getItem: () => "dark" };
  assert.equal(readStoredTheme(storage), "dark");
  assert.equal(readStoredTheme({ getItem: () => "light" }), "light");
});

test("readStoredTheme falls back to auto for unknown or missing values", async () => {
  const { readStoredTheme } = await load();
  assert.equal(readStoredTheme({ getItem: () => "neon" }), "auto");
  assert.equal(readStoredTheme({ getItem: () => null }), "auto");
});

test("readStoredTheme falls back to auto when storage throws", async () => {
  const { readStoredTheme } = await load();
  const throwing = {
    getItem: () => {
      throw new Error("storage blocked");
    },
  };
  assert.equal(readStoredTheme(throwing), "auto");
});

test("resolveTheme maps stored theme to effective theme", async () => {
  const { resolveTheme } = await load();
  // Explicit choices win regardless of system preference
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
  // auto follows the system preference
  assert.equal(resolveTheme("auto", true), "dark");
  assert.equal(resolveTheme("auto", false), "light");
});

test("applyThemeClass toggles .dark on root and body together", async () => {
  const { applyThemeClass } = await load();
  const classes = { values: new Set() };
  const element = {
    classList: {
      toggle: (cls, on) => {
        if (on) classes.values.add(cls);
        else classes.values.delete(cls);
      },
    },
  };
  const body = {
    classList: {
      toggle: (cls, on) => {
        if (on) classes.values.add(`body:${cls}`);
        else classes.values.delete(`body:${cls}`);
      },
    },
  };

  applyThemeClass(element, body, "dark");
  assert.deepEqual([...classes.values], ["dark", "body:dark"]);

  applyThemeClass(element, body, "light");
  assert.deepEqual([...classes.values], []);
});
