const test = require("node:test");
const assert = require("node:assert/strict");
const { createRendererServer, installBrowserGlobals } = require("../lib/rendererTestHarness");
const {
  resolveMeetingTranscriptionOptions,
} = require("../../src/helpers/meetingTranscriptionRouting.js");

// Note Recording has no cloud fallback in this fork: the hosted streaming
// provider went away with the account/cloud purge, so a mode that asks for
// "providers" without a provider the user picked fails every start with
// `noProviderSelected`. These cases pin the product decision that goes with
// that: the store defaults to local, heals the legacy managed-cloud value
// local-ward, and leaves an explicit BYOK choice authoritative — while still
// failing closed when an explicit "providers" mode has nothing to route to.

// The meeting picker's value, not dictation's: `cloudTranscriptionProvider`
// keeps its own default here so a case can prove nothing is silently inherited.
const MIGRATIONS_DONE = {
  _providerSettingsMigrated: "1",
  uploadTranscriptionMigrated: "true",
  meetingFollowsTranscription: "false",
  meetingFollowsReasoning: "false",
};

const BYOK_PROVIDERS = [
  { id: "openai", models: [{ id: "gpt-4o-mini-transcribe", default: true }] },
];

const route = (mod, state) => {
  const resolved = mod.selectResolvedMeetingTranscription(state);
  return resolveMeetingTranscriptionOptions({
    transcriptionMode: resolved.transcriptionMode,
    language: "en",
    localProvider: resolved.localTranscriptionProvider,
    whisperModel: resolved.whisperModel,
    parakeetModel: resolved.parakeetModel,
    cohereModel: resolved.cohereModel,
    selectedProvider: resolved.cloudTranscriptionProvider,
    selectedModel: resolved.cloudTranscriptionModel,
    byokProviders: BYOK_PROVIDERS,
    keyterms: [],
  });
};

async function loadStore(t, initialStorage, cachePrefix) {
  const browser = installBrowserGlobals(t, { initialStorage });
  const vite = await createRendererServer(t, { cachePrefix });
  const mod = await vite.ssrLoadModule("/stores/settingsStore.ts");
  return { mod, state: mod.useSettingsStore.getState(), storage: browser.storage };
}

test("a profile with no Note Recording preference starts on local", async (t) => {
  const { mod, state } = await loadStore(
    t,
    { ...MIGRATIONS_DONE },
    "openwhispr-meeting-mode-default-"
  );

  assert.equal(state.meetingTranscriptionMode, "local", "mode default");
  assert.equal(mod.selectResolvedMeetingTranscription(state).transcriptionMode, "local");
  assert.equal(route(mod, state).provider, "local", "starts without a provider choice");
});

test("a fresh install lands on local even though the follow-flag copy writes the cloud mode", async (t) => {
  const { mod, state, storage } = await loadStore(t, {}, "openwhispr-meeting-mode-fresh-");

  // migrateMeetingFollowFlags() derives the mode from the copied dictation
  // snapshot, which for a profile with no cloud choice is the legacy managed
  // value — the one Note Recording cannot serve any more.
  assert.equal(storage.getItem("meetingTranscriptionMode"), "openwhispr", "the copy's value");
  assert.equal(state.meetingTranscriptionMode, "local", "healed local-ward");
  assert.equal(route(mod, state).provider, "local");
});

test("a persisted legacy managed-cloud mode is healed local-ward", async (t) => {
  const { mod, state, storage } = await loadStore(
    t,
    { ...MIGRATIONS_DONE, meetingTranscriptionMode: "openwhispr" },
    "openwhispr-meeting-mode-legacy-cloud-"
  );

  assert.equal(state.meetingTranscriptionMode, "local");
  assert.equal(route(mod, state).provider, "local");
  assert.equal(
    storage.getItem("meetingTranscriptionMode"),
    "openwhispr",
    "normalized on read, never rewritten"
  );
});

test("an explicit providers choice routes to the provider picked for Note Recording", async (t) => {
  const { mod, state } = await loadStore(
    t,
    {
      ...MIGRATIONS_DONE,
      meetingTranscriptionMode: "providers",
      meetingCloudTranscriptionProvider: "openai",
      meetingCloudTranscriptionModel: "gpt-4o-mini-transcribe",
      meetingCloudTranscriptionMode: "byok",
    },
    "openwhispr-meeting-mode-explicit-providers-"
  );

  assert.equal(state.meetingTranscriptionMode, "providers", "mode kept");
  assert.equal(
    mod.selectResolvedMeetingTranscription(state).cloudTranscriptionProvider,
    "openai",
    "the choice reaches the router"
  );
  const options = route(mod, state);
  assert.equal(options.provider, "openai-realtime");
  assert.equal(options.model, "gpt-4o-mini-transcribe");
  assert.equal(options.mode, "byok");
});

test("providers with no provider selected still fails closed", async (t) => {
  const { mod, state } = await loadStore(
    t,
    {
      ...MIGRATIONS_DONE,
      meetingTranscriptionMode: "providers",
      // Set, but for dictation: Note Recording must not inherit a provider the
      // user never picked for meeting audio.
      cloudTranscriptionProvider: "openai",
    },
    "openwhispr-meeting-mode-no-provider-"
  );

  assert.equal(state.meetingTranscriptionMode, "providers", "an explicit mode is not overridden");
  assert.equal(mod.selectResolvedMeetingTranscription(state).cloudTranscriptionProvider, "");
  assert.throws(() => route(mod, state), /noProviderSelected/, "explicit, not silent");
});

test("a ≤1.6.7 BYOK profile keeps its inherited provider through the meeting copy", async (t) => {
  const { mod, state } = await loadStore(
    t,
    {
      useLocalWhisper: "false",
      cloudTranscriptionMode: "byok",
      cloudTranscriptionProvider: "openai",
    },
    "openwhispr-meeting-mode-legacy-byok-"
  );

  // migrateMeetingFollowFlags() copies the pair, so the inherited cohort keeps a
  // Note Recording provider of its own instead of relying on a live fallback.
  assert.equal(state.meetingTranscriptionMode, "providers");
  assert.equal(state.meetingCloudTranscriptionProvider, "openai");
  assert.equal(route(mod, state).provider, "openai-realtime");
});

test("a provider Note Recording cannot run fails closed with its own error", async (t) => {
  const { mod, state } = await loadStore(
    t,
    {
      ...MIGRATIONS_DONE,
      meetingTranscriptionMode: "providers",
      meetingCloudTranscriptionProvider: "custom",
    },
    "openwhispr-meeting-mode-unsupported-"
  );

  assert.equal(
    mod.selectResolvedMeetingTranscription(state).cloudTranscriptionProvider,
    "custom",
    "the choice is reported as-is"
  );
  assert.throws(() => route(mod, state), /unsupportedProvider:custom/);
});

test("an explicit local choice is left untouched", async (t) => {
  const { mod, state } = await loadStore(
    t,
    { ...MIGRATIONS_DONE, meetingTranscriptionMode: "local" },
    "openwhispr-meeting-mode-explicit-local-"
  );

  assert.equal(state.meetingTranscriptionMode, "local");
  assert.equal(route(mod, state).provider, "local");
});
