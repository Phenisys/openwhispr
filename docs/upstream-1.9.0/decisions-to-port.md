# Décisions TO_PORT v1.9.0 (t_2a0848a0) — décisions FINALES après examen complet

Chaque entrée TO_PORT reçoit une classification avec preuve vérifiable.

## A. PORTÉS dans cette reprise (commits séparés par chantier)

| # | Commit(s) upstream | Chantier | Commits fork | Preuve |
|---|---|---|---|---|
| 1 | f879ebcb | Ignorer notre propre dictation dans la détection mic (#1392) | 861dcb2e | ownProcessPids.js présent (95279b4b) ; guard `getOwnProcessPids().has(pid)` ajouté dans `_parseWin32ListenerLine` + tests (23→29 pass) |
| 2 | 19c7d8c5 | Notification dismiss timer pausable + re-evaluate gated mic | 861dcb2e | `notificationTimer.js` créé ; windowManager utilise NotificationDismissTimer (pause sur hover) ; `_lastKnownMicState`/`_evaluateMicState`/`_scheduleCooldownReeval` ajoutés ; tests (51 pass) |
| 3 | 88701d19, 1dfc36cd, 55806cc9, ffe8d689 | Persist delayed diarization + serialization + owning-note routing | 6b4742d0, 1d2afa73 | `diarizationCompletion.ts` + `serialQueue.ts` créés ; listener module-level dans meetingRecordingStore ; NoteEditor ne fait que mirroirer `completedDiarization` ; noteId ajouté au payload ; tests (12 pass) |
| 4 | d4c207a2 | GPU packs engage sans env flag + log saveAllKeysToEnvFile | b6b605c8 | 2 sites `=== "true"` → `!== "false"` dans ipcHandlers ; `_syncStartupEnv` logge les échecs d'écriture .env ; test adapted (4 pass) |
| 5 | 0a121c24 | macOS Globe action suppression (#1567) | 2d2ef7f8 | globeKeyManager `setConfiguration`/`preferenceStatePath`/stdin config ; swift complet (AppleFnUsageType, marker file) ; main.js syncMacNativeHotkeyConfiguration ; `_notifyHotkeyChanged` sur slots IPC ; tests (9+15 pass) |
| 6 | 41cf1d46 (partiel) | localReasoningBridge `??` + forward requireCompleteOutput | 358f08d0 | 5 defaults `||`→`??` ; requireCompleteOutput forwardé ; chaîne modelManagerBridge→llamaServer déjà OK |
| 7 | 41cf1d46 (partiel) | getModelProvider: fallback gemma → local | 358f08d0 | `modelId.includes("gemma")` ajouté à la heuristique locale |
| 8 | 41cf1d46 (partiel) | migrations registry-driven (localLlmProviderIds) | 358f08d0 | `localLlmProviderIds` dérivé de modelRegistryData.localProviders ; migrateProviderSettings + migrateAgentMode l'utilisent |
| 9 | a5e59ee4 (partiel) | Resume existing note on calendar join (_resumeExistingEventNote) | 861dcb2e | joinCalendarMeeting + handleNotificationResponse résument la note existante via getNoteByCalendarEventId au lieu de dupliquer |
| 10 | 0c271fef, cd4dedc7 | Parakeet macOS capability gate (#862) | 6729f429 | `parakeetCapability.js` créé (floor 15.5) ; parakeet.js (pre-warm/checkInstallation/startServer/createOnlineStream/transcribe/download) ; picker désactive l'onglet NVIDIA sur macOS < 15.5 ; `verify-macos-parakeet.js` + vérif CI ; tests (3 pass) |
| 11 | beedfd32 (partiel) | LLM fail-closed Custom endpoint routing (#1583) | 625f78f5 | `resolveConfiguredOpenAIBase` fail-closed (throw CUSTOM_ENDPOINT_INVALID au lieu de rerouter vers api.openai.com) ; `canBorrowCleanupCustomKey` ; `endpointInvalid` i18n ×10 ; tests (2 pass) |
| 12 | 7bbc04c4 | Abort local transcription + diarization on upload cancel (#1401) | bf6035f3 | `uploadCancelRegistry.js` créé (multi-op par requestId) ; ipcHandlers transcribe-audio-file (whisper/parakeet) + diarize-audio-file + cloud partagent le registry ; diarization tue le child sur abort ; parakeetServer/WsServer ferment le websocket + arrêt segment loop ; whisperServer détruit /inference et rethrow AbortError avant fallback CPU ; renderer fileTranscription + types electron propagent requestId ; tests (7+4+3+2 = 16 pass) |

## B. RECLASSÉS NOT_APPLICABLE (couche purgée / feature absente) — preuve vérifiable

| Commit(s) | Raison |
|---|---|
| 7ed3ca43, ad38ed49, e1e639b3, 1a0fabdc | Tinfoil realtime MEETING: le fork a retiré le streaming cloud meeting (selectResolvedMeetingTranscription force local-only, ALLOWED_MEETING_PROVIDERS = {local, openai-realtime, assemblyai-realtime, deepgram-realtime, corti-realtime}, getMeetingTranscriptionOptions retourne toujours local). Le fork supporte tinfoil-realtime en dictation (realtimeTokenProviders) mais PAS en meeting — réintroduire = contraire aux exclusions BYOK/local. |
| b31db6b8 | Restore fallback self-hosted meeting → managed openwhispr: dépend du mode "openwhispr" managed purgé. Fork: meeting local-only, pas de managed pipeline. |
| 884d9bfa | Meeting Phase 0 test seams (mic gate/holdback/segment reducer): refactor de test de l'implémentation streaming upstream (openaiRealtimeStreaming etc.). Fork a son propre pipeline local. |
| 36c9bafe | Notes UI redesign (gradient, voice drafts, liquid-glass, sidebar): redesign massif UI propre à l'upstream. Le fork a son propre design (PR #4 design system). Divergence design assumée. |
| 1bcf5fc5 | selection sans accessibilité: dépend de screenContextCapture.js (feature abandonnée fork, 2f40bd22 "screenContext integration dropped") → feature absente. La sélection AX du fork reste. |

## C. RECLASSÉS EQUIVALENT (divergence assumée / déjà couvert) — preuve vérifiable

| Commit(s) | Raison |
|---|---|
| ba6ecd64 | voice-agent screen context (abandonné fork) + selection-edit retry + calendar tool: fork couvre via ses propres chemins (audioManager pendingSelectionEdit, meetingDetectionEngine joinCalendarMeeting) → EQUIVALENT |
| beedfd32 (reste) | model memory par provider, vision override, secretKeys per-scope custom: le fork a sa propre config par scope (settingsStore inferenceScopes) + cleanupCustomApiKey bespoke → divergences Phenisys assumées, fail-closed déjà porté |
| e7f6aeb8 | empty-state card border: le fork n'a pas de SidebarCard avec ce pattern ; ses états vides (system-audio, sign-in) sont une structure Phenisys différente → EQUIVALENT (divergence design) |
| 41cf1d46 (reste) | canary CI + dead code removal: fork n'a pas de workflow canary ; promptTemplate/inference-config restent (fork ne charge pas llama-server avec --jinja de façon prouvée) → NOT_APPLICABLE/EQUIVALENT documenté |

## Résultat

- Zéro TO_PORT applicable restant.
- 12 chantiers PORTÉS (commits séparés, type: sujet, sans trailer) — le
  12e (7bbc04c4, abort uploads) est porté par bf6035f3.
- 5 NOT_APPLICABLE + 4 EQUIVALENT documentés avec preuves.
- L'inventaire docs/upstream-1.9.0/inventory.md est mis à jour en conséquence
  (103 PORTED / 71 EQUIVALENT / 48 NOT_APPLICABLE / 0 TO_PORT / 2 ALREADY_PRESENT).
