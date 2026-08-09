const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "../../src");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

test("settings expose per-scope timeouts plus a local timeout with sane defaults", () => {
  const store = read("stores/settingsStore.ts");
  for (const key of [
    "cleanupTimeoutMs",
    "dictationAgentTimeoutMs",
    "noteFormattingTimeoutMs",
    "chatAgentTimeoutMs",
    "translationTimeoutMs",
    "localInferenceTimeoutMs",
  ]) {
    assert.match(store, new RegExp(`${key}: readNumber\\("${key}", \\d+\\)`), `${key} hydrated`);
    assert.match(store, new RegExp(`${key}: number;`), `${key} declared in SettingsState`);
  }
  // Network scopes default to 30 s, local to 5 min.
  assert.match(store, /cleanupTimeoutMs: readNumber\("cleanupTimeoutMs", 30000\)/);
  assert.match(store, /localInferenceTimeoutMs: readNumber\("localInferenceTimeoutMs", 300000\)/);
});

test("every inference scope maps its timeoutMs store key", () => {
  const scopes = read("config/inferenceScopes.ts");
  for (const key of [
    "cleanupTimeoutMs",
    "dictationAgentTimeoutMs",
    "noteFormattingTimeoutMs",
    "chatAgentTimeoutMs",
    "translationTimeoutMs",
  ]) {
    assert.match(scopes, new RegExp(`timeoutMs: "${key}"`), `scope timeoutMs -> ${key}`);
  }
  // The resolved config carries the timeout through to request time.
  const store = read("stores/settingsStore.ts");
  assert.match(store, /timeoutMs: number;/, "ResolvedLLMConfig exposes timeoutMs");
  assert.match(store, /fallback\?\.timeoutMs \|\|/, "inherits timeout from fallback scope");
  assert.match(store, /timeoutMs \|\|[\s\S]*30000/, "selectResolvedLLMConfig falls back to 30 s");
});

test("request timeouts honor the resolved config at every abort point", () => {
  const reasoning = read("services/ReasoningService.ts");
  assert.match(reasoning, /config\.timeoutMs \?\? 30000/, "processText uses scope timeout");
  assert.match(reasoning, /config\.timeoutMs \?\? 60000/, "agent stream uses scope timeout");

  const openai = read("services/ai/inferenceProviders/openai.ts");
  assert.match(openai, /config\.timeoutMs \?\? REQUEST_TIMEOUT_MS/, "openai provider");
  const gemini = read("services/ai/inferenceProviders/gemini.ts");
  assert.match(gemini, /config\.timeoutMs \?\? 30000/, "gemini provider");
  const tinfoil = read("services/ai/inferenceProviders/tinfoil.ts");
  assert.match(tinfoil, /config\.timeoutMs \?\? REQUEST_TIMEOUT_MS/, "tinfoil provider");
});

test("local llama timeout is configurable end to end", () => {
  const llama = read("helpers/llamaServer.js");
  assert.match(llama, /timeout: options\.timeoutMs \?\? 300000/, "llamaServer honors timeoutMs");
  const bridge = read("helpers/modelManagerBridge.js");
  assert.match(bridge, /timeoutMs: options\.timeoutMs/, "modelManagerBridge forwards timeout");
  const localBridge = read("services/localReasoningBridge.js");
  assert.match(localBridge, /timeoutMs: config\.timeoutMs/, "localReasoningBridge forwards timeout");
});

test("scope call sites pass their settings timeout to the request", () => {
  const audio = read("helpers/audioManager.js");
  assert.match(audio, /timeoutMs: settings\.translationTimeoutMs/, "translation call");
  assert.match(audio, /timeoutMs: settings\.dictationAgentTimeoutMs/, "dictation agent call");
  assert.match(audio, /timeoutMs: settings\.cleanupTimeoutMs/, "cleanup call");

  const title = read("utils/generateTitle.ts");
  assert.match(title, /timeoutMs: getSettings\(\)\.noteFormattingTimeoutMs/, "title generation");

  const chat = read("components/chat/useChatStreaming.ts");
  assert.match(chat, /timeoutMs: settings\.chatAgentTimeoutMs/, "chat agent stream");

  const noteFmt = read("helpers/noteFormattingOverrides.js");
  assert.match(noteFmt, /timeoutMs = noteFormatting\?\.timeoutMs/, "note formatting overrides");
});

test("the advanced editor exposes the scope timeout and the local timeout", () => {
  const editor = read("components/settings/InferenceConfigEditor.tsx");
  assert.match(editor, /setField\("timeoutMs"\)/, "scope timeout editable");
  assert.match(editor, /setLocalInferenceTimeoutMs\(/, "local timeout editable");
  assert.match(editor, /settingsPage\.aiModels\.advanced\.title/, "advanced section labelled");
});
