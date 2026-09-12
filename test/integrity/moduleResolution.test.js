const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Garde-fou de résolution des modules.
//
// Le processus principal n'est ni construit ni typé : `main.js` et
// `src/helpers/ipcHandlers.js` s'exécutent tels quels, chargés par Electron.
// Un `require("./<module supprimé>")` y survit donc a `npm run typecheck` (qui
// ne parcourt que le projet TS de `src`), a `npm run lint` (statique) et a
// `npm run build:renderer` (qui ne charge pas le processus principal) — et tue
// le démarrage de l'application. Une fusion amont dans ce fork supprime
// régulièrement des modules (cf. docs/upstream-merge/exclusions.txt) : ce test
// rend la classe de régression visible en CI.

const REPO_ROOT = path.resolve(__dirname, "../..");
const CODE_EXT = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx"]);
const RESOLVE_EXT = [".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".json"];
const SKIP_DIRS = new Set([".git", "node_modules", "dist", "build", ".worktrees", "out"]);

// Mêmes règles que scripts/upstream_merge_resolve.py (scan_dangling_specifiers).
// \x60 = backtick : évite d'écrire un vrai backtick dans une expression
// régulière, que le blanchiment ci-dessous prendrait pour un gabarit.
const SPEC_RE = /(?:require\s*\(\s*|from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g;
const BACKTICK = "\u0060";

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (CODE_EXT.has(path.extname(entry.name))) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

// Neutralise commentaires et gabarits en conservant les numéros de ligne et le
// contenu des chaînes entre guillemets — c'est là que vivent les specifiers.
// Les générateurs de code (scripts/sync-nucleo-icons.js) écrivent des
// importations dans des gabarits : sans ce blanchiment, `from "./createIcon"`
// passé en chaîne passerait pour une importation de ce fichier.
function blankNonCode(text) {
  let out = "";
  let state = "code";
  let quote = "";
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (state === "code") {
      if (ch === "/" && next === "/") { state = "line"; out += "  "; i += 1; continue; }
      if (ch === "/" && next === "*") { state = "block"; out += "  "; i += 1; continue; }
      if (ch === '"' || ch === "'") { state = "string"; quote = ch; out += ch; continue; }
      if (ch === BACKTICK) { state = "template"; out += " "; continue; }
      out += ch;
      continue;
    }
    if (state === "line") {
      out += ch === "\n" ? "\n" : " ";
      if (ch === "\n") state = "code";
      continue;
    }
    if (state === "block") {
      if (ch === "*" && next === "/") { out += "  "; state = "code"; i += 1; continue; }
      out += ch === "\n" ? "\n" : " ";
      continue;
    }
    if (state === "template") {
      if (ch === "\\") { out += "  "; i += 1; continue; }
      if (ch === BACKTICK) { state = "code"; out += " "; continue; }
      out += ch === "\n" ? "\n" : " ";
      continue;
    }
    // chaîne entre guillemets : contenu conservé, échappements inclus
    if (ch === "\\") { out += text.slice(i, i + 2); i += 1; continue; }
    out += ch;
    if (ch === quote) state = "code";
  }
  return out;
}

function resolves(baseDir, spec) {
  const candidates = [spec];
  // Le TS autorise l'extension `.js` pour désigner un fichier `.ts`.
  if (/\.(js|mjs|cjs|jsx)$/.test(spec)) {
    const stem = spec.replace(/\.(js|mjs|cjs|jsx)$/, "");
    candidates.push(`${stem}.ts`, `${stem}.tsx`, `${stem}.js`, `${stem}.jsx`);
  }
  for (const ext of RESOLVE_EXT) {
    candidates.push(spec + ext, `${spec.replace(/\/$/, "")}/index${ext}`);
  }
  return candidates.some((candidate) => fs.existsSync(path.join(baseDir, candidate)));
}

test("aucune importation relative ne pointe vers un fichier absent", () => {
  const files = walk(REPO_ROOT);
  // Un parcours cassé ne doit pas passer pour un succès.
  assert.ok(files.length > 500, `parcours suspicieux : ${files.length} fichier(s) de code`);

  const dangling = [];
  for (const file of files) {
    const text = blankNonCode(fs.readFileSync(file, "utf8"));
    for (const match of text.matchAll(SPEC_RE)) {
      const spec = match[1];
      if (!spec.startsWith("./") && !spec.startsWith("../")) continue;
      if (resolves(path.dirname(file), spec)) continue;
      const line = text.slice(0, match.index).split("\n").length;
      dangling.push(`${path.relative(REPO_ROOT, file)}:${line}  ${spec}`);
    }
  }

  assert.deepEqual(
    dangling,
    [],
    `importation(s) relative(s) sans cible (le processus principal ne démarrerait pas) :\n  ${dangling.join("\n  ")}`
  );
});
