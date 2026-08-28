const test = require("node:test");
const assert = require("node:assert/strict");
const { createRendererServer, installBrowserGlobals } = require("../lib/rendererTestHarness");

const enTranslations = require("../../src/locales/en/translation.json");

// beedfd32 (#1583): an unmanaged Custom endpoint must fail closed instead of
// silently rerouting the prompt + custom API key to api.openai.com.
test("unmanaged Custom endpoints fail closed instead of falling back to OpenAI", async (t) => {
  installBrowserGlobals(t);
  const vite = await createRendererServer(t, {
    cachePrefix: "openwhispr-openai-base-fail-closed-test-",
  });

  const { resolveConfiguredOpenAIBase } = await vite.ssrLoadModule("/services/ai/openaiBase.ts");
  const CUSTOM_ENDPOINT_INVALID = enTranslations.reasoning.custom.endpointInvalid;

  for (const baseUrl of [
    "",
    "http://public.example.com/v1",
    "https://api.groq.com/openai/v1",
  ]) {
    assert.throws(() => resolveConfiguredOpenAIBase("custom", baseUrl), {
      message: CUSTOM_ENDPOINT_INVALID,
    });
  }
});

test("a non-custom provider resolves the default OpenAI endpoint", async (t) => {
  installBrowserGlobals(t);
  const vite = await createRendererServer(t, {
    cachePrefix: "openwhispr-openai-base-default-test-",
  });

  const { resolveConfiguredOpenAIBase } = await vite.ssrLoadModule("/services/ai/openaiBase.ts");
  assert.equal(
    resolveConfiguredOpenAIBase("openai", ""),
    "https://api.openai.com/v1",
    "the default provider must keep the default endpoint"
  );
});
