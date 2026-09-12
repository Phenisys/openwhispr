const assert = require("node:assert/strict");
const test = require("node:test");

// SpacesTree.tsx and its in-tree keyboard handling were removed with the
// account/cloud purge, so the source-level assertion that used to live here
// went with them; the intent helper itself survives.
const load = () => import("../../src/components/notes/treeDirection.ts");

test("tree horizontal keys use logical inward and outward movement in LTR", async () => {
  const { treeHorizontalIntent } = await load();
  assert.equal(treeHorizontalIntent("ArrowRight", "ltr"), "inward");
  assert.equal(treeHorizontalIntent("ArrowLeft", "ltr"), "outward");
  assert.equal(treeHorizontalIntent("ArrowDown", "ltr"), null);
});

test("tree horizontal keys mirror logical inward and outward movement in RTL", async () => {
  const { treeHorizontalIntent } = await load();
  assert.equal(treeHorizontalIntent("ArrowLeft", "rtl"), "inward");
  assert.equal(treeHorizontalIntent("ArrowRight", "rtl"), "outward");
  assert.equal(treeHorizontalIntent("ArrowUp", "rtl"), null);
});
