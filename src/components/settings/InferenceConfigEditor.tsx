import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTranslation } from "react-i18next";
import { Key, Cpu, Network, Building2, Settings2 } from "lucide-react";
import {
  useSettingsStore,
  selectResolvedLLMConfig,
  setResolvedLLMConfig,
} from "../../stores/settingsStore";
import { usePolicyModeOptions } from "../../hooks/usePolicy";
import { InferenceModeSelector } from "../ui/SettingsSection";
import type { InferenceModeOption } from "../ui/SettingsSection";
import ReasoningModelSelector from "../ReasoningModelSelector";
import EnterpriseSection from "../EnterpriseSection";
import OpenAICompatiblePanel from "../OpenAICompatiblePanel";
import { Toggle } from "../ui/toggle";
import type { InferenceMode } from "../../types/electron";
import type { InferenceScope } from "../../config/inferenceScopes";
import { isProviderValidForMode, getCloudModel, getLocalModel } from "../../models/ModelRegistry";

const MODE_LABEL_PREFIX: Record<InferenceScope, string> = {
  dictationCleanup: "settingsPage.aiModels.modes",
  noteFormatting: "settingsPage.aiModels.modes",
  dictationAgent: "dictationAgent.modes",
  chatIntelligence: "agentMode.settings.modes",
  dictationTranslation: "settingsPage.aiModels.modes",
};

interface InferenceConfigEditorProps {
  scope: InferenceScope;
  onModeChange?: (mode: InferenceMode) => void;
}

export default function InferenceConfigEditor({ scope, onModeChange }: InferenceConfigEditorProps) {
  const { t } = useTranslation();
  const config = useSettingsStore(useShallow((s) => selectResolvedLLMConfig(s, scope)));
  const localInferenceTimeoutMs = useSettingsStore((s) => s.localInferenceTimeoutMs);
  const setLocalInferenceTimeoutMs = useSettingsStore((s) => s.setLocalInferenceTimeoutMs);

  const prefix = MODE_LABEL_PREFIX[scope];
  const { modes, isModeAllowed } = usePolicyModeOptions<InferenceModeOption>(
    [
      {
        id: "providers",
        label: t(`${prefix}.providers`),
        description: t(`${prefix}.providersDesc`),
        icon: <Key className="w-4 h-4" />,
      },
      {
        id: "local",
        label: t(`${prefix}.local`),
        description: t(`${prefix}.localDesc`),
        icon: <Cpu className="w-4 h-4" />,
      },
      {
        id: "self-hosted",
        label: t(`${prefix}.selfHosted`),
        description: t(`${prefix}.selfHostedDesc`),
        icon: <Network className="w-4 h-4" />,
      },
      {
        id: "enterprise",
        label: t(`${prefix}.enterprise`),
        description: t(`${prefix}.enterpriseDesc`),
        icon: <Building2 className="w-4 h-4" />,
      },
    ],
    "llm"
  );

  const setField = useCallback(
    <K extends keyof Omit<typeof config, "scope">>(field: K) =>
      (value: NonNullable<(typeof config)[K]>) => {
        setResolvedLLMConfig(scope, { [field]: value });
      },
    [scope]
  );

  const handleModeSelect = useCallback(
    (mode: InferenceMode) => {
      if (!isModeAllowed(mode)) return;
      if (mode === config.mode) return;

      const patch: Parameters<typeof setResolvedLLMConfig>[1] = {
        mode,
      };
      if (!isProviderValidForMode(config.provider, mode)) {
        patch.provider = "";
        patch.model = "";
      }
      setResolvedLLMConfig(scope, patch);

      if (mode === "self-hosted" || mode === "enterprise") {
        window.electronAPI?.llamaServerStop?.();
      }

      onModeChange?.(mode);
    },
    [scope, config.mode, config.provider, onModeChange, isModeAllowed]
  );

  const setMode = setField("mode");
  const setProvider = setField("provider");
  const setModel = setField("model");

  const renderModelSelector = (mode?: "cloud" | "local") => (
    <ReasoningModelSelector
      reasoningModel={config.model}
      setReasoningModel={setModel}
      localReasoningProvider={config.provider}
      setLocalReasoningProvider={setProvider}
      cloudReasoningBaseUrl={config.cloudBaseUrl ?? ""}
      setCloudReasoningBaseUrl={setField("cloudBaseUrl")}
      customReasoningApiKey={config.customApiKey ?? ""}
      setCustomReasoningApiKey={setField("customApiKey")}
      setReasoningMode={setMode}
      mode={mode}
    />
  );

  const showThinkingToggle =
    config.mode === "self-hosted" ||
    (config.mode === "providers" &&
      (config.provider === "custom" ||
        config.provider === "openrouter" ||
        !!getCloudModel(config.model)?.supportsThinking)) ||
    (config.mode === "local" && !!getLocalModel(config.model)?.supportsThinking);

  return (
    <div className="space-y-3">
      <InferenceModeSelector modes={modes} activeMode={config.mode} onSelect={handleModeSelect} />

      {config.mode === "providers" && renderModelSelector("cloud")}
      {config.mode === "local" && renderModelSelector("local")}

      {config.mode === "self-hosted" && (
        <OpenAICompatiblePanel
          baseUrl={config.remoteUrl ?? ""}
          setBaseUrl={setField("remoteUrl")}
          apiKey={config.customApiKey ?? ""}
          setApiKey={setField("customApiKey")}
          model={config.model}
          setModel={setModel}
          baseUrlPlaceholder="http://192.168.1.126:11434/v1"
          helpExamples={
            <p className="text-xs text-muted-foreground">
              {t("reasoning.selfHosted.endpointHelp")}
            </p>
          }
        />
      )}

      {showThinkingToggle && (
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground">
              {t("reasoning.disableThinking.label")}
            </h4>
            <p className="text-xs text-muted-foreground">{t("reasoning.disableThinking.help")}</p>
          </div>
          <Toggle checked={config.disableThinking} onChange={setField("disableThinking")} />
        </div>
      )}

      {config.mode === "enterprise" && (
        <EnterpriseSection
          currentProvider={config.provider}
          reasoningModel={config.model}
          setReasoningModel={setModel}
          setLocalReasoningProvider={setProvider}
        />
      )}

      {/* Advanced: request timeouts */}
      <div className="border-t border-border/40 pt-3 mt-1">
        <div className="flex items-center gap-2 mb-2">
          <Settings2 size={13} className="text-muted-foreground/50" />
          <h4 className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
            {t("settingsPage.aiModels.advanced.title")}
          </h4>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-medium text-foreground">
              {t("settingsPage.aiModels.advanced.timeoutLabel")}
            </h5>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {t("settingsPage.aiModels.advanced.timeoutHelp")}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="number"
              min={5}
              max={600}
              value={Math.round((config.timeoutMs || 30000) / 1000)}
              onChange={(e) => {
                const seconds = Math.min(600, Math.max(5, Number(e.target.value) || 30));
                setField("timeoutMs")(seconds * 1000);
              }}
              className="w-20 h-7 rounded-md border border-border/50 bg-transparent px-2 text-xs text-foreground outline-none focus:border-primary/40"
            />
            <span className="text-xs text-muted-foreground/50">
              {t("settingsPage.aiModels.advanced.secondsSuffix")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-border/20">
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-medium text-foreground">
              {t("settingsPage.aiModels.advanced.localTimeoutLabel")}
            </h5>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {t("settingsPage.aiModels.advanced.localTimeoutHelp")}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="number"
              min={30}
              max={3600}
              value={Math.round((localInferenceTimeoutMs || 300000) / 1000)}
              onChange={(e) => {
                const seconds = Math.min(3600, Math.max(30, Number(e.target.value) || 300));
                setLocalInferenceTimeoutMs(seconds * 1000);
              }}
              className="w-20 h-7 rounded-md border border-border/50 bg-transparent px-2 text-xs text-foreground outline-none focus:border-primary/40"
            />
            <span className="text-xs text-muted-foreground/50">
              {t("settingsPage.aiModels.advanced.secondsSuffix")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-border/20">
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-medium text-foreground">
              {t("settingsPage.aiModels.advanced.maxTokensLabel")}
            </h5>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {t("settingsPage.aiModels.advanced.maxTokensHelp")}
            </p>
          </div>
          <input
            type="number"
            min={0}
            max={32768}
            value={config.maxTokens || 0}
            onChange={(e) => {
              const tokens = Math.min(32768, Math.max(0, Number(e.target.value) || 0));
              setField("maxTokens")(tokens);
            }}
            className="w-24 h-7 rounded-md border border-border/50 bg-transparent px-2 text-xs text-foreground outline-none focus:border-primary/40"
          />
        </div>

        <div className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-border/20">
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-medium text-foreground">
              {t("settingsPage.aiModels.advanced.retryLabel")}
            </h5>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {t("settingsPage.aiModels.advanced.retryHelp")}
            </p>
          </div>
          <input
            type="number"
            min={0}
            max={10}
            value={config.maxRetries ?? 3}
            onChange={(e) => {
              const retries = Math.min(10, Math.max(0, Number(e.target.value) || 0));
              setField("maxRetries")(retries);
            }}
            className="w-20 h-7 rounded-md border border-border/50 bg-transparent px-2 text-xs text-foreground outline-none focus:border-primary/40"
          />
        </div>
      </div>
    </div>
  );
}
