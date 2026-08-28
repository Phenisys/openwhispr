const test = require("node:test");
const assert = require("node:assert/strict");
const { createRendererServer, installBrowserGlobals } = require("../lib/rendererTestHarness");

// Guards the store's module-load side effects (the module-level diarization
// completion listener and the throttled resize listener) from regressions.
test("meetingRecordingStore still loads under the renderer harness", async (t) => {
  installBrowserGlobals(t);
  const vite = await createRendererServer(t, {
    cachePrefix: "openwhispr-meeting-store-import-test-",
  });

  const store = await vite.ssrLoadModule("/stores/meetingRecordingStore.ts");

  assert.equal(typeof store.startRecording, "function");
  assert.equal(typeof store.useMeetingRecordingStore?.getState, "function");
  const initial = store.useMeetingRecordingStore.getState();
  assert.deepEqual(initial.segments, []);
  assert.equal(initial.micPartial, "");
  assert.equal(initial.systemPartial, "");
  assert.equal(initial.completedDiarization, null);
});
