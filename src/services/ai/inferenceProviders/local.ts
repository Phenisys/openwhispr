import type { InferenceProvider } from "./types";
import { wrapCleanupTranscript } from "../../../config/prompts";
import logger from "../../../utils/logger";

export const localProvider: InferenceProvider = {
  id: "local",
  async call({ text, model, agentName, config, ctx }) {
    if (typeof window === "undefined" || !window.electronAPI) {
      throw new Error("Local reasoning is not available in this environment");
    }

    logger.logReasoning("LOCAL_START", { model, agentName, environment: "browser" });
    const startTime = Date.now();

    logger.logReasoning("LOCAL_IPC_CALL", { model, textLength: text.length });

    const isCleanup = config.systemPrompt == null;
    const systemPrompt = config.systemPrompt ?? ctx.getSystemPrompt(agentName);
    const userContent = isCleanup ? wrapCleanupTranscript(text) : text;
    const result = await window.electronAPI.processLocalReasoning(userContent, model, agentName, {
      ...config,
      // undefined omits the key from the JSON body -> no system message sent.
      systemPrompt: systemPrompt || undefined,
    });

    const processingTimeMs = Date.now() - startTime;

    if (!result.success) {
      logger.logReasoning("LOCAL_ERROR", { model, processingTimeMs, error: result.error });
      throw new Error(result.error);
    }

    logger.logReasoning("LOCAL_SUCCESS", {
      model,
      processingTimeMs,
      resultLength: result.text.length,
    });
    return result.text;
  },
};
