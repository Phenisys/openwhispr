const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "../../src");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

test("settings expose per-scope max tokens (0 = auto) and retry counts (default 3)", () => {
  const store = read("stores/settingsStore.ts");
  for (const scope of [
    "cleanup",
    "dictationAgent",
    "noteFormatting",
    "chatAgent",
    "translation",
  ]) {
    const maxTokensKey = `${scope}MaxTokens`;
    const maxRetriesKey = `${scope}MaxRetries`;
    assert.match(store, new RegExp(`${maxTokensKey}: readNumber\\("${maxTokensKey}", 0\\)`));
    assert.match(store, new RegExp(`${maxRetriesKey}: readNumber\\("${maxRetriesKey}", 3\\)`));
    assert.match(store, new RegExp(`${maxTokensKey}: number;`));
    assert.match(store, new RegExp(`${maxRetriesKey}: number;`));
  }
});

test("every inference scope maps its maxTokens and maxRetries store keys", () => {
  const scopes = read("config/inferenceScopes.ts");
  const pairs = {
    cleanup: ["cleanupMaxTokens", "cleanupMaxRetries"],
    dictationAgent: ["dictationAgentMaxTokens", "dictationAgentMaxRetries"],
    noteFormatting: ["noteFormattingMaxTokens", "noteFormattingMaxRetries"],
    chatAgent: ["chatAgentMaxTokens", "chatAgentMaxRetries"],
    translation: ["translationMaxTokens", "translationMaxRetries"],
  };
  for (const keys of Object.values(pairs)) {
    const [tokensKey, retriesKey] = keys;
    assert.match(scopes, new RegExp(`maxTokens: "${tokensKey}"`), `scope maxTokens -> ${tokensKey}`);
    assert.match(scopes, new RegExp(`maxRetries: "${retriesKey}"`), `scope maxRetries -> ${retriesKey}`);
  }

  const store = read("stores/settingsStore.ts");
  assert.match(store, /maxTokens: number;/, "ResolvedLLMConfig exposes maxTokens");
  assert.match(store, /maxRetries: number;/, "ResolvedLLMConfig exposes maxRetries");
  assert.match(store, /fallback\?\.maxTokens \|\|/, "inherits maxTokens from fallback scope");
  assert.match(store, /fallback\?\.maxRetries \|\|/, "inherits maxRetries from fallback scope");
  assert.match(
    store,
    /fallback\?\.maxTokens \|\|\s*\n\s*0;/,
    "selectResolvedLLMConfig defaults maxTokens to 0"
  );
  assert.match(
    store,
    /fallback\?\.maxRetries \|\|\s*\n\s*3;/,
    "selectResolvedLLMConfig defaults maxRetries to 3"
  );
});

test("retry counts honor the resolved config at every retry point", () => {
  const reasoning = read("services/ReasoningService.ts");
  assert.match(
    reasoning,
    /maxRetries: config\.maxRetries/,
    "processText threads config.maxRetries into withRetry"
  );

  const openai = read("services/ai/inferenceProviders/openai.ts");
  assert.match(openai, /maxRetries: config\.maxRetries/, "openai provider");
  const gemini = read("services/ai/inferenceProviders/gemini.ts");
  assert.match(gemini, /maxRetries: config\.maxRetries/, "gemini provider");
  const tinfoil = read("services/ai/inferenceProviders/tinfoil.ts");
  assert.match(tinfoil, /maxRetries: config\.maxRetries/, "tinfoil provider");
});

test("scope call sites pass their settings to the request", () => {
  const audio = read("helpers/audioManager.js");
  assert.match(audio, /maxTokens: settings\.translationMaxTokens/, "translation call");
  assert.match(audio, /maxRetries: settings\.translationMaxRetries/, "translation retries");
  assert.match(audio, /maxTokens: settings\.dictationAgentMaxTokens/, "dictation agent call");
  assert.match(audio, /maxRetries: settings\.dictationAgentMaxRetries/, "dictation agent retries");
  assert.match(audio, /maxTokens: settings\.cleanupMaxTokens/, "cleanup call");
  assert.match(audio, /maxRetries: settings\.cleanupMaxRetries/, "cleanup retries");
  // The main cleanup route also carries its timeout now (was missing).
  assert.match(audio, /kind === "cleanup"[\s\S]*timeoutMs: settings\.cleanupTimeoutMs/, "cleanup timeout wired");

  const title = read("utils/generateTitle.ts");
  assert.match(title, /maxTokens: getSettings\(\)\.noteFormattingMaxTokens/, "title generation");
  assert.match(title, /maxRetries: getSettings\(\)\.noteFormattingMaxRetries/, "title generation retries");

  const chat = read("components/chat/useChatStreaming.ts");
  assert.match(chat, /maxTokens: settings\.chatAgentMaxTokens/, "chat agent stream");
  assert.match(chat, /maxRetries: settings\.chatAgentMaxRetries/, "chat agent stream retries");

  const noteFmt = read("helpers/noteFormattingOverrides.js");
  assert.match(noteFmt, /maxTokens = noteFormatting\?\.maxTokens/, "note formatting overrides");
  assert.match(noteFmt, /maxRetries = noteFormatting\?\.maxRetries/, "note formatting overrides retries");
});

test("the advanced editor exposes max tokens and retry count inputs", () => {
  const editor = read("components/settings/InferenceConfigEditor.tsx");
  assert.match(editor, /setField\("maxTokens"\)/, "max tokens editable");
  assert.match(editor, /setField\("maxRetries"\)/, "retry count editable");
  assert.match(editor, /settingsPage\.aiModels\.advanced\.maxTokensLabel/, "max tokens labelled");
  assert.match(editor, /settingsPage\.aiModels\.advanced\.retryLabel/, "retry count labelled");
});
