import reasoningService from "../services/ReasoningService";
import type { ReasoningConfig } from "../services/BaseReasoningService";
import { getSettings } from "../stores/settingsStore";
import { resolvePrompt } from "../config/prompts";

export async function generateNoteTitle(
  text: string,
  modelId: string,
  config?: Pick<ReasoningConfig, "provider" | "baseUrl" | "customApiKey" | "lanUrl">
): Promise<string> {
  try {
    const raw = await reasoningService.processText(text.slice(0, 2000), modelId, null, {
      systemPrompt: resolvePrompt("titleGeneration", { agentName: null }),
      temperature: 0.3,
      disableThinking: getSettings().noteFormattingDisableThinking,
      timeoutMs: getSettings().noteFormattingTimeoutMs,
      maxTokens: getSettings().noteFormattingMaxTokens,
      maxRetries: getSettings().noteFormattingMaxRetries,
      ...config,
    });
    const cleaned = raw.trim().replace(/^["']|["']$/g, "");
    return cleaned.length > 0 && cleaned.length < 100 ? cleaned : "";
  } catch {
    return "";
  }
}
