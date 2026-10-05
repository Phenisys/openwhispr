const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Module = require("node:module");

const repoRoot = path.resolve(__dirname, "../..");
const updaterModulePath = require.resolve("../../src/updater.js");

// The in-app "check for updates" button resolves its feed from a packed
// update-feed.json; when that file is absent, src/updater.js falls back to a
// built-in default. A win-only extraResources entry once shipped the file on
// Windows only, so macOS and Linux builds silently checked OpenWhispr's PUBLIC
// repo. These tests pin both halves of the fix: the file ships everywhere, and
// the fallback itself is the fork.

// --- 1. Packaging guard: the feed must be declared for EVERY platform ------
test("the update feed ships on every platform and points at the fork", () => {
  const builder = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "electron-builder.json"), "utf8")
  );

  const shippedAtTopLevel = (builder.extraResources || []).some(
    (entry) =>
      entry &&
      typeof entry === "object" &&
      entry.from === "resources/update-feed.json" &&
      entry.to === "update-feed.json"
  );
  assert.ok(
    shippedAtTopLevel,
    "resources/update-feed.json must be in the TOP-LEVEL extraResources (not a platform block) so every target packages it"
  );

  const feed = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "resources/update-feed.json"), "utf8")
  );
  assert.equal(feed.owner, "Phenisys");
  assert.equal(feed.repo, "openwhispr");
});

// --- 2. Runtime guard: what the updater actually feeds electron-updater ----
// Loads the real src/updater.js with electron stubbed, captures the argument of
// autoUpdater.setFeedURL(), and returns the resolved feed.
function resolvedFeedFor(resourcesPath) {
  const captured = [];
  const originalLoad = Module._load;
  const originalResourcesPath = process.resourcesPath;
  const originalNodeEnv = process.env.NODE_ENV;

  process.env.NODE_ENV = "test"; // != "development", so setupAutoUpdater() runs
  if (resourcesPath === undefined) delete process.resourcesPath;
  else process.resourcesPath = resourcesPath;

  Module._load = function loadWithMocks(request, parent, isMain) {
    if (request === "electron-updater") {
      return {
        autoUpdater: {
          setFeedURL: (feed) => captured.push(feed),
          on() {},
          removeListener() {},
        },
      };
    }
    if (request === "electron") return { autoUpdater: { on() {}, removeListener() {} } };
    if (request === "child_process") return { execSync: () => "0" };
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    delete require.cache[updaterModulePath];
    const UpdateManager = require(updaterModulePath);
    new UpdateManager();
  } finally {
    Module._load = originalLoad;
    if (originalResourcesPath === undefined) delete process.resourcesPath;
    else process.resourcesPath = originalResourcesPath;
    process.env.NODE_ENV = originalNodeEnv;
    delete require.cache[updaterModulePath];
  }

  return captured[0];
}

test("a packed update-feed.json is the feed the updater uses", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ow-feed-"));
  try {
    fs.writeFileSync(
      path.join(dir, "update-feed.json"),
      JSON.stringify({ owner: "Phenisys", repo: "openwhispr", private: false })
    );
    const feed = resolvedFeedFor(dir);
    assert.equal(feed.owner, "Phenisys");
    assert.equal(feed.repo, "openwhispr");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("with no packed feed file the updater still points at the fork, never upstream", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ow-nofeed-"));
  try {
    const feed = resolvedFeedFor(dir);
    assert.equal(feed.owner, "Phenisys");
    assert.equal(feed.repo, "openwhispr");
    assert.notEqual(feed.owner, "OpenWhispr");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
