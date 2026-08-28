const test = require("node:test");
const assert = require("node:assert/strict");

// The fork resolves GPU start options inline in ipcHandlers.js
// (whisper-server-start) from WHISPER_*_ENABLED env flags + downloaded packs.
// This replicates the exact resolution contract introduced by upstream
// d4c207a2 ("engage downloaded GPU packs without the env flag", #1340):
// a pack on disk implies intent — it engages unless the flag is explicitly
// "false" (opt-out), and a remembered failure still gates it.
function resolveGpuStartOptions(env, managers) {
  const failed = (env.WHISPER_GPU_FAILED || "").split(",").filter(Boolean);
  const useCuda =
    env.WHISPER_CUDA_ENABLED !== "false" &&
    !failed.includes("cuda") &&
    !!managers.whisperCudaManager?.isDownloaded();
  const useVulkan =
    !useCuda &&
    env.WHISPER_VULKAN_ENABLED !== "false" &&
    !failed.includes("vulkan") &&
    !!managers.whisperVulkanManager?.isDownloaded();
  return { useCuda, useVulkan };
}

function managers({ cudaDownloaded = false, vulkanDownloaded = false } = {}) {
  return {
    whisperCudaManager: { isDownloaded: () => cudaDownloaded },
    whisperVulkanManager: { isDownloaded: () => vulkanDownloaded },
  };
}

test("a downloaded pack with a lost env flag still engages (#1340)", () => {
  const vulkanOnly = managers({ vulkanDownloaded: true });
  assert.deepEqual(resolveGpuStartOptions({}, vulkanOnly), {
    useCuda: false,
    useVulkan: true,
  });

  const cudaOnly = managers({ cudaDownloaded: true });
  assert.deepEqual(resolveGpuStartOptions({}, cudaOnly), {
    useCuda: true,
    useVulkan: false,
  });
});

test("explicit 'false' opts a downloaded pack out", () => {
  const vulkanOnly = managers({ vulkanDownloaded: true });
  assert.deepEqual(
    resolveGpuStartOptions({ WHISPER_VULKAN_ENABLED: "false" }, vulkanOnly),
    { useCuda: false, useVulkan: false }
  );

  const cudaOnly = managers({ cudaDownloaded: true });
  assert.deepEqual(
    resolveGpuStartOptions({ WHISPER_CUDA_ENABLED: "false" }, cudaOnly),
    { useCuda: false, useVulkan: false }
  );
});

test("a remembered failure still gates a flag-less downloaded pack", () => {
  const manager = managers({ vulkanDownloaded: true });
  assert.deepEqual(resolveGpuStartOptions({ WHISPER_GPU_FAILED: "vulkan" }, manager), {
    useCuda: false,
    useVulkan: false,
  });
});

test("no pack on disk never enables a backend", () => {
  assert.deepEqual(resolveGpuStartOptions({}, managers()), {
    useCuda: false,
    useVulkan: false,
  });
});
