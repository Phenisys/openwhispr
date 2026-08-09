const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const REGISTRY_PATH = path.join(__dirname, "../../src/config/prompts/registry.ts");
const registrySrc = fs.readFileSync(REGISTRY_PATH, "utf8");

// PROMPT_KINDS is TypeScript with internal imports that Node's native
// type-stripping can't resolve (extensionless relative imports), so parse the
// kinds + fallbacks from source the way inferenceProviderIds.test.js does.
function promptKinds() {
  const block = registrySrc.match(/PROMPT_KINDS[^=]*=\s*\{([\s\S]*?)\n\} as const/);
  assert.ok(block, "PROMPT_KINDS declared in registry.ts");
  const ids = [...block[1].matchAll(/^ {2}([A-Za-z][\w-]*):/gm)].map((m) => m[1]);
  assert.ok(ids.length > 0, "parsed at least one prompt kind");
  return ids;
}

test("registry exposes the 4 classic kinds plus the 5 fixed system prompts", () => {
  const kinds = promptKinds();
  for (const expected of [
    "cleanup",
    "dictationAgent",
    "translate",
    "chatAgent",
    "noteEnhancement",
    "meetingEnhancement",
    "titleGeneration",
    "selectionEdit",
    "toolInstructions",
  ]) {
    assert.ok(kinds.includes(expected), `kind "${expected}" missing from PROMPT_KINDS`);
  }
  assert.equal(kinds.length, 9);
});

test("every prompt kind declares a non-empty fallback", () => {
  const block = registrySrc.match(/PROMPT_KINDS[^=]*=\s*\{([\s\S]*?)\n\} as const/)[1];
  for (const id of promptKinds()) {
    const entry = block.match(new RegExp(`^\\s*${id}:\\s*\\{([\\s\\S]*?)\\n\\s*\\},?$`, "m"));
    assert.ok(entry, `kind "${id}" has no entry`);
    const fb = entry[1].match(/fallback:\s*(.+),?$/m);
    assert.ok(fb, `kind "${id}" has no fallback`);
    const value = fb[1].trim().replace(/,$/, "");
    // Either a non-empty string literal, or a reference to a declared const.
    if (value.startsWith('"') || value.startsWith("`")) {
      assert.notEqual(value, '""', `kind "${id}" fallback must not be empty`);
      assert.ok(value.length > 5, `kind "${id}" fallback looks empty`);
    } else {
      assert.match(value, /^[A-Za-z_][\w.$]*$/, `kind "${id}" fallback ref "${value}"`);
    }
  }
});

test("fixed system prompts are wired to their consumer sites", () => {
  const root = path.join(__dirname, "../../src");

  const store = fs.readFileSync(path.join(root, "stores/actionProcessingStore.ts"), "utf8");
  assert.match(store, /"noteEnhancement"/, "actionProcessingStore must resolve noteEnhancement");
  assert.match(store, /"meetingEnhancement"/, "actionProcessingStore must resolve meetingEnhancement");

  const title = fs.readFileSync(path.join(root, "utils/generateTitle.ts"), "utf8");
  assert.match(title, /"titleGeneration"/, "generateTitle must resolve titleGeneration");

  const tools = fs.readFileSync(path.join(root, "config/prompts.ts"), "utf8");
  assert.match(tools, /toolInstructions/, "getAgentSystemPrompt must honor toolInstructions");

  const selectionEdit = fs.readFileSync(
    path.join(root, "helpers/selectionEditing.js"),
    "utf8"
  );
  assert.match(
    selectionEdit,
    /selectionEditSuffix/,
    "selection editing must accept a customizable suffix"
  );

  const audioManager = fs.readFileSync(path.join(root, "helpers/audioManager.js"), "utf8");
  assert.match(
    audioManager,
    /resolvePrompt\("selectionEdit"/,
    "audioManager must pass the customizable selection-edit suffix"
  );
});
