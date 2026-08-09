// Provider overrides for note-formatting ReasoningService.processText calls.
// Self-hosted must forward remoteUrl as lanUrl — without it, processText
// guesses the provider from the model and can silently hit a cloud API.
export function buildNoteFormattingOverrides(noteFormatting, isCloudMode) {
  const timeoutMs = noteFormatting?.timeoutMs;

  let overrides;
  if (isCloudMode) {
    overrides = {
      provider: "openwhispr",
      baseUrl: undefined,
      customApiKey: undefined,
      lanUrl: undefined,
    };
  } else {
    const mode = noteFormatting?.mode;

    if (mode === "self-hosted") {
      overrides = {
        provider: undefined,
        baseUrl: undefined,
        customApiKey: noteFormatting?.customApiKey || undefined,
        lanUrl: noteFormatting?.remoteUrl || undefined,
      };
    } else {
      // Local must pin its provider for the same reason: an empty local selection
      // resolves to the cleanup scope's model, and processText would derive a cloud
      // provider from that id — sending note content off-device.
      const provider =
        mode === "local"
          ? "local"
          : mode === "providers"
            ? noteFormatting?.provider || undefined
            : undefined;
      const isCustom = provider === "custom";
      overrides = {
        provider,
        baseUrl: isCustom ? noteFormatting?.cloudBaseUrl || undefined : undefined,
        customApiKey: isCustom ? noteFormatting?.customApiKey || undefined : undefined,
        lanUrl: undefined,
      };
    }
  }

  // Only add the timeout when the caller resolved one (keeps the shape stable
  // for callers/tests that don't set it).
  if (timeoutMs) {
    overrides.timeoutMs = timeoutMs;
  }
  return overrides;
}
