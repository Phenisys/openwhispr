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
    assert.ok(store.includes(`${maxTokensKey}: readNumber("${maxTokensKey}", 0)`), `${maxTokensKey} defaults to 0`);
    assert.ok(store.includes(`${maxRetriesKey}: readNumber("${maxRetriesKey}", 3)`), `${maxRetriesKey} defaults to 3`);
    assert.ok(store.includes(`${maxTokensKey}: number;`), `${maxTokensKey} typed`);
    assert.ok(store.includes(`${maxRetriesKey}: number;`), `${maxRetriesKey} typed`);
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
    assert.ok(scopes.includes(`maxTokens: "${tokensKey}"`), `scope maxTokens -> ${tokensKey}`);
    assert.ok(scopes.includes(`maxRetries: "${retriesKey}"`), `scope maxRetries -> ${retriesKey}`);
  }

  const store = read("stores/settingsStore.ts");
  assert.ok(store.includes("maxTokens: number;"), "ResolvedLLMConfig exposes maxTokens");
  assert.ok(store.includes("maxRetries: number;"), "ResolvedLLMConfig exposes maxRetries");
  assert.ok(store.includes("fallback?.maxTokens ??"), "inherits maxTokens from fallback scope");
  assert.ok(store.includes("fallback?.maxRetries ??"), "inherits maxRetries from fallback scope");
  assert.ok(
    store.includes("fallback?.maxTokens ??\n    0;"),
    "selectResolvedLLMConfig defaults maxTokens to 0"
  );
  assert.ok(
    store.includes("fallback?.maxRetries ??\n    3;"),
    "selectResolvedLLMConfig defaults maxRetries to 3"
  );
});

test("an explicit 0 survives resolution: no retries / auto tokens are meaningful, not falsy", () => {
  const store = read("stores/settingsStore.ts");
  // 0 means "no retries" (single attempt) and "auto tokens". The resolver must
  // use nullish coalescing so an explicit 0 does not fall through to the
  // fallback scope or the global default (was `||`, snapping the UI back to 3).
  assert.ok(
    store.includes("undefined) ??\n    fallback?.maxTokens ??\n    0;"),
    "maxTokens resolution uses ?? (0 is preserved)"
  );
  assert.ok(
    store.includes("undefined) ??\n    fallback?.maxRetries ??\n    3;"),
    "maxRetries resolution uses ?? (0 is preserved)"
  );
  assert.ok(!store.includes("undefined) ||\n    fallback?.maxTokens"), "no || fallback for maxTokens");
  assert.ok(!store.includes("undefined) ||\n    fallback?.maxRetries"), "no || fallback for maxRetries");
});

test("retry counts honor the resolved config at every retry point", () => {
  const reasoning = read("services/ReasoningService.ts");
  assert.ok(
    reasoning.includes("maxRetries: config.maxRetries"),
    "processText threads config.maxRetries into withRetry"
  );

  const openai = read("services/ai/inferenceProviders/openai.ts");
  assert.ok(openai.includes("maxRetries: config.maxRetries"), "openai provider");
  const gemini = read("services/ai/inferenceProviders/gemini.ts");
  assert.ok(gemini.includes("maxRetries: config.maxRetries"), "gemini provider");
  const tinfoil = read("services/ai/inferenceProviders/tinfoil.ts");
  assert.ok(tinfoil.includes("maxRetries: config.maxRetries"), "tinfoil provider");
});

test("scope call sites pass their settings to the request", () => {
  const audio = read("helpers/audioManager.js");
  assert.ok(audio.includes("maxTokens: settings.translationMaxTokens"), "translation call");
  assert.ok(audio.includes("maxRetries: settings.translationMaxRetries"), "translation retries");
  assert.ok(audio.includes("maxTokens: settings.dictationAgentMaxTokens"), "dictation agent call");
  assert.ok(audio.includes("maxRetries: settings.dictationAgentMaxRetries"), "dictation agent retries");
  assert.ok(audio.includes("maxTokens: settings.cleanupMaxTokens"), "cleanup call");
  assert.ok(audio.includes("maxRetries: settings.cleanupMaxRetries"), "cleanup retries");
  // The main cleanup route also carries its timeout now (was missing).
  assert.ok(
    audio.includes('kind === "cleanup"') && audio.includes("timeoutMs: settings.cleanupTimeoutMs"),
    "cleanup timeout wired"
  );

  const title = read("utils/generateTitle.ts");
  assert.ok(title.includes("maxTokens: getSettings().noteFormattingMaxTokens"), "title generation");
  assert.ok(title.includes("maxRetries: getSettings().noteFormattingMaxRetries"), "title generation retries");

  const chat = read("components/chat/useChatStreaming.ts");
  assert.ok(chat.includes("maxTokens: settings.chatAgentMaxTokens"), "chat agent stream");
  assert.ok(chat.includes("maxRetries: settings.chatAgentMaxRetries"), "chat agent stream retries");

  const noteFmt = read("helpers/noteFormattingOverrides.js");
  assert.ok(noteFmt.includes("maxTokens = noteFormatting?.maxTokens"), "note formatting overrides");
  assert.ok(noteFmt.includes("maxRetries = noteFormatting?.maxRetries"), "note formatting overrides retries");
});

test("the advanced editor exposes max tokens and retry count inputs", () => {
  const editor = read("components/settings/InferenceConfigEditor.tsx");
  assert.ok(editor.includes('setField("maxTokens")'), "max tokens editable");
  assert.ok(editor.includes('setField("maxRetries")'), "retry count editable");
  assert.ok(editor.includes("settingsPage.aiModels.advanced.maxTokensLabel"), "max tokens labelled");
  assert.ok(editor.includes("settingsPage.aiModels.advanced.retryLabel"), "retry count labelled");
});
