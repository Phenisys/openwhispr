import type { SettingsState } from "../stores/settingsStore";

export interface InferenceScopeStoreKeys {
  mode: keyof SettingsState;
  provider: keyof SettingsState;
  model: keyof SettingsState;
  cloudMode?: keyof SettingsState;
  cloudBaseUrl?: keyof SettingsState;
  remoteUrl?: keyof SettingsState;
  customApiKey?: keyof SettingsState;
  disableThinking?: keyof SettingsState;
  timeoutMs?: keyof SettingsState;
  maxTokens?: keyof SettingsState;
  maxRetries?: keyof SettingsState;
}

export interface InferenceScopeDefinition {
  storeKeys: InferenceScopeStoreKeys;
  fallbackScope?: string;
}

export const INFERENCE_SCOPES = {
  dictationCleanup: {
    storeKeys: {
      mode: "cleanupMode",
      provider: "cleanupProvider",
      model: "cleanupModel",
      cloudMode: "cleanupCloudMode",
      cloudBaseUrl: "cleanupCloudBaseUrl",
      remoteUrl: "cleanupRemoteUrl",
      customApiKey: "cleanupCustomApiKey",
      disableThinking: "cleanupDisableThinking",
      timeoutMs: "cleanupTimeoutMs",
      maxTokens: "cleanupMaxTokens",
      maxRetries: "cleanupMaxRetries",
    },
  },
  dictationAgent: {
    storeKeys: {
      mode: "dictationAgentMode",
      provider: "dictationAgentProvider",
      model: "dictationAgentModel",
      cloudMode: "dictationAgentCloudMode",
      cloudBaseUrl: "dictationAgentCloudBaseUrl",
      remoteUrl: "dictationAgentRemoteUrl",
      customApiKey: "dictationAgentCustomApiKey",
      disableThinking: "dictationAgentDisableThinking",
      timeoutMs: "dictationAgentTimeoutMs",
      maxTokens: "dictationAgentMaxTokens",
      maxRetries: "dictationAgentMaxRetries",
    },
  },
  noteFormatting: {
    storeKeys: {
      mode: "noteFormattingMode",
      provider: "noteFormattingProvider",
      model: "noteFormattingModel",
      cloudMode: "noteFormattingCloudMode",
      cloudBaseUrl: "noteFormattingCloudBaseUrl",
      remoteUrl: "noteFormattingRemoteUrl",
      customApiKey: "noteFormattingCustomApiKey",
      disableThinking: "noteFormattingDisableThinking",
      timeoutMs: "noteFormattingTimeoutMs",
      maxTokens: "noteFormattingMaxTokens",
      maxRetries: "noteFormattingMaxRetries",
    },
    fallbackScope: "dictationCleanup",
  },
  chatIntelligence: {
    storeKeys: {
      mode: "chatAgentMode",
      provider: "chatAgentProvider",
      model: "chatAgentModel",
      cloudMode: "chatAgentCloudMode",
      cloudBaseUrl: "chatAgentCloudBaseUrl",
      remoteUrl: "chatAgentRemoteUrl",
      customApiKey: "chatAgentCustomApiKey",
      disableThinking: "chatAgentDisableThinking",
      timeoutMs: "chatAgentTimeoutMs",
      maxTokens: "chatAgentMaxTokens",
      maxRetries: "chatAgentMaxRetries",
    },
  },
  dictationTranslation: {
    storeKeys: {
      mode: "translationMode",
      provider: "translationProvider",
      model: "translationModel",
      cloudMode: "translationCloudMode",
      cloudBaseUrl: "translationCloudBaseUrl",
      remoteUrl: "translationRemoteUrl",
      customApiKey: "translationCustomApiKey",
      disableThinking: "translationDisableThinking",
      timeoutMs: "translationTimeoutMs",
      maxTokens: "translationMaxTokens",
      maxRetries: "translationMaxRetries",
    },
  },
} as const satisfies Record<string, InferenceScopeDefinition>;

export type InferenceScope = keyof typeof INFERENCE_SCOPES;
