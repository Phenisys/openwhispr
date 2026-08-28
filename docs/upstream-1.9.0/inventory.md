# Inventaire du delta OpenWhispr v1.9.0 vs fork Phenisys

Merge-base : `1866ecf6` (Merge PR #1426)
Tag upstream : `v1.9.0` (`193b02b6`, chore(release): prepare 1.9.0 (#1809))
Branche : `feat/issue-8-upstream-1.9.0`

## Méthode

Chaque commit non-merge entre le merge-base et v1.9.0 (224 commits) est classé
avec une justification vérifiable (identité de fichiers à HEAD, référence
d'issue/hash dans les messages des commits fork, ou analyse de l'état du fork) :

- **PORTED** : porté dans le fork (fichiers identiques ou équivalents, ou
  commit fork correspondant référencé par issue/hash/sujet).
- **EQUIVALENT** : le fork a une implémentation équivalente (divergence assumée,
  souvent via une spécificité Phenisys — timeout par scope, modèle par provider…).
- **ALREADY_PRESENT** : le contenu existait déjà dans le fork.
- **NOT_APPLICABLE** : non applicable (auth/cloud/enterprise purgé, Microsoft
  Calendar, monétisation Cloud, changelog).
- **TO_PORT** : applicable, non encore porté — liste de suivi en fin de document.

## Résumé

| Classe | Nombre |
|---|---|
| PORTED | 103 |
| EQUIVALENT | 71 |
| NOT_APPLICABLE | 48 |
| TO_PORT (restant) | 0 |
| ALREADY_PRESENT | 2 |
| **Total** | **224** |

> Les 24 entrées initialement TO_PORT ont toutes été traitées dans la reprise
> (12 PORTED, 8 NOT_APPLICABLE, 2 EQUIVALENT, 2 partiels PORTED/EQUIVALENT) —
> décisions détaillées et preuves dans `decisions-to-port.md`, reflétées ligne
> par ligne dans la classification ci-dessous.

## Exclusions documentées (préservées de la passe précédente)

- **Auth / Login / Cloud** : CompactAuthenticationFlow, ReauthenticationScreen, SignInDialog,
  WorkspacesService, EnterpriseIdentityStore/Manager, workspace/billing/subscription UI,
  shared spaces (SpacesTree, InviteTeammateDialog, CreateWorkspaceDialog, AcceptInvitation, JoinYourTeam),
  MemberPickList, oauth loopback — couche purgée du fork (2bccc3a3).
- **Microsoft Calendar (Graph)** : microsoftCalendarManager/OAuth, calendarSyncInterval,
  graph endpoints — non présents dans le fork (Google + Apple uniquement).
- **Enterprise managed AI** : provision Bedrock/Azure managed, managed cloud identity,
  policy org enforcement (workspacePolicyManager) — dépendent de la couche enterprise.
- **Onboarding rebuild (#1670, #1763)** : le fork a son propre onboarding ; le rebuild upstream
  est entrelacé avec auth/workspace — gardé fork.
- **Voice Assistant pill redesign (#1597)** : entrelacé avec preloadAuthBridge ; le fork garde
  son propre assistant.
- **Monétisation Cloud (bannières Upgrade to Pro, pricing, billing)** : le fork est BYOK /
  local / self-hosted — pas de plan Pro ni de workspace billing.
- **Sync cloud (SyncService, migration links, shared spaces)** : dépend de la couche account
  purgée.
- **Tinfoil realtime meeting** (7ed3ca43, ad38ed49, e1e639b3, 1a0fabdc) : le fork a retiré le
  streaming cloud meeting (selectResolvedMeetingTranscription force local-only,
  ALLOWED_MEETING_PROVIDERS = {local, openai-realtime, assemblyai-realtime, deepgram-realtime,
  corti-realtime}) ; tinfoil-realtime reste supporté en dictation (realtimeTokenProviders) mais
  PAS en meeting — réintroduire = contraire aux exclusions BYOK/local.

## Adaptations / CONFLICT notables

- **hotkeyManager / KDE / GNOME** : le fork a des slots GNOME étendus (agent),
  push-to-talk KDE via KGlobalAccel et un state machine activation-mode déjà présent.
- **OnboardingFlow** : gardé version fork (auth-purged).
- **windowManager** : setOnboardingActive/_hideNormalAppSurfaces/endOnboardingDemo
  adaptés au fork ; tests upstream windowManagerMeetingNotification/AssistantPanel non portés
  (APIs upstream absentes).
- **GPU whisper (d4c207a2, #1340)** : le fork engage désormais les packs GPU sans flag env
  (b6b605c8, `=== "true"` → `!== "false"`) ; la partie pack-on-disk upstream
  (gpuBinaryManager complète) reste un CONFLICT documenté — le fork gère les binaires via
  settings/env.
- **Speaker identity meetings (rework upstream e3642b2b et suivants)** : le fork a sa propre
  implémentation (1708586f) ; la rework diverge → EQUIVALENT.
- **Screen context capture (22c52d4d, 34b9250d, 1439ac43, 1bcf5fc5, ba6ecd64)** : abandonné
  explicitement dans le fork (2f40bd22 : « screenContext integration dropped ») → NOT_APPLICABLE
  pour le port ; les correctifs sélection/retry de 1bcf5fc5/ba6ecd64 sont couverts par les
  chemins fork existants (audioManager pendingSelectionEdit, joinCalendarMeeting) → EQUIVALENT.
- **Tests tsx-dépendants** : activationModeSelector.test.js, openaiEndpointRetry.test.js,
  translationCoverage.test.js — le runner du fork est `node --test` natif (type-stripping,
  pas de tsx) → non portés (documenté).
- **Timeout LLM (9c16a567, c5a5b8c5, 508920bb, f2407757, 77c6661e, 52f90799, df2c4f9a,
  70320880, 961a1b69)** : le fork a déjà des timeouts par scope (settingsStore `*TimeoutMs`,
  config.timeoutMs appliqué dans OpenAI/Gemini/Tinfoil/ReasoningService) — spécificité
  Phenisys → EQUIVALENT.

## Classification détaillée par commit (224)

| Commit | Sujet | Classe | Justification |
|---|---|---|---|
| `22c52d4d` | feat(voice-agent): opt-in screen context capture with vision model routing | **NOT_APPLICABLE** | screen context capture — le fork a explicitement abandonné le screen-context (2f40bd22 : "screenContext integration dropped") ; voice-agent sans capture écran |
| `b9b5335d` | fix: make model selection an explicit click and only bootstrap if no model is selected/downloaed | **PORTED** | porté par 526f088e (sujet équivalent) |
| `da710f26` | fix(hotkeys): release a slot's registered accelerators on unregister | **PORTED** | porté par fb8c885c (sujet équivalent) |
| `2b6aab3d` | fix(dictation): Make VAD opt-in and rescue dictionary-echo decodes | **PORTED** | porté par bcf6bdd2 (sujet équivalent) |
| `a87ba3e6` | fix: failing dictionary test | **EQUIVALENT** | failing dictionary test — fork cliBridgeDictionary.test.js (97d9d4f4) |
| `1462c23d` | fix(settings): Preserve Custom STT endpoint URL across provider tabs | **PORTED** | porté par 1aa7c8d5 (sujet équivalent) |
| `ff3e529c` | fix: centralize duplicated error string | **EQUIVALENT** | centralize error string — fork a ses propres messages (abd1f8e5 honest errors) |
| `702ef1a9` | feat(calendar): Microsoft Calendar (Graph) integration | **NOT_APPLICABLE** | Microsoft Calendar/Graph absent du fork |
| `21a63ad2` | fix: agent calendar tool, tests and outdated claude.md | **NOT_APPLICABLE** | calendar tool (Microsoft absent) — fork useChatStreaming/Google/Apple adaptés |
| `f23c8f8c` | fix: Refresh-token rotation race, provider filter and other cleanups | **NOT_APPLICABLE** | Microsoft Calendar/Graph absent du fork |
| `d6b0314d` | feat: add keys to github relase build | **EQUIVALENT** | keys github release build — fork release.yml Phenisys adapté |
| `82fd37aa` | fix(settings): close stale-state gaps in explicit model selection | **PORTED** | porté par 526f088e (sujet équivalent) |
| `58d9af0d` | fix: Mode-switch validity guard | **EQUIVALENT** | mode-switch validity guard — fork ModelRegistry/LocalModelPicker (526f088e) |
| `7ed3ca43` | feat(meetings): add Tinfoil realtime streaming client | **NOT_APPLICABLE** | Tinfoil realtime MEETING : le fork a retiré le streaming cloud meeting (local-only) — réintroduire = contraire aux exclusions BYOK/local (decisions-to-port.md B) |
| `ad38ed49` | feat(meetings): register tinfoil-realtime meeting provider | **NOT_APPLICABLE** | idem 7ed3ca43 — fork local-only en meeting (decisions-to-port.md B) |
| `e1e639b3` | feat(meetings): select Tinfoil realtime for meeting transcription | **NOT_APPLICABLE** | idem 7ed3ca43 — tinfoil-realtime supporté en dictation seulement (decisions-to-port.md B) |
| `1a0fabdc` | fix(meetings): harden the Tinfoil commit adaptation | **NOT_APPLICABLE** | idem 7ed3ca43 (decisions-to-port.md B) |
| `caeef3b8` | fix: failing test | **EQUIVALENT** | failing test fix — fork hotkeySlotUnregister.test.js |
| `e3642b2b` | fix(meetings): Keep speaker identities stable and manual labels persistent | **PORTED** | porté par 1708586f (sujet équivalent) |
| `47623ee3` | fix(meetings): Address speaker identity review findings | **EQUIVALENT** | speaker identity review — fork liveSpeakerIdentifier.js |
| `098a256c` | fix(meetings): Address speaker identity review findings | **EQUIVALENT** | speaker identity review — fork liveSpeakerIdentifier.js |
| `7e13884f` | fix: Reconciliation deleted a manual mapping whenever the live and offline speaker ids matched | **EQUIVALENT** | reconciliation speaker mapping — fork liveSpeakerIdentifier.js |
| `ef16852c` | chore: update stale comment | **EQUIVALENT** | stale comment — trivial |
| `28cb7f82` | fix(audio): eliminate first-words loss from cold mic opens (#845) (#1493) | **EQUIVALENT** | cold mic opens — fork audioManager.warmupMicDriver() (ligne 816, cf. #871) ; l'issue #1493 partagée avec launch-at-login (09a9d959) était un faux positif |
| `79ee1b9a` | feat(linux): Add launch at login via an XDG autostart entry | **PORTED** | porté par 09a9d959 (sujet équivalent) |
| `9e1ab841` | fix(translation): route local models with an empty provider through llama.cpp | **PORTED** | porté par 2f40bd22 (sujet équivalent) |
| `79f46db1` | fix(dictation-agent): normalize provider for local and self-hosted modes | **PORTED** | porté par 2f40bd22 (sujet équivalent) |
| `15768f6c` | fix(utils): guard formatAmount against invalid input | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `f67f2a6b` | fix(meetings): harden realtime provider routing | **PORTED** | porté par 2f40bd22 (sujet équivalent) |
| `c9c0dd58` | fix(dictation-agent): make inference mode authoritative | **EQUIVALENT** | dictation-agent inference mode — fork dictationAgentInference.js (2f40bd22) |
| `df52041b` | feat: provision managed Bedrock and Azure access | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `a3745821` | fix(policy): Hide restricted options and apply safe fallbacks | **EQUIVALENT** | hide restricted options — fork policyRules.ts a ses propres fallbacks |
| `8a67a39a` | fix: Tailscale MagicDNS allowed over HTTP and Self-hosted mode for uploads | **EQUIVALENT** | Tailscale MagicDNS/self-hosted uploads — fork urlUtils.ts + upload settings (spécificité Phenisys) |
| `b31db6b8` | fix: restore fallback | **NOT_APPLICABLE** | restore fallback self-hosted meeting → managed openwhispr : dépend du mode "openwhispr" managed purgé ; fork meeting local-only (decisions-to-port.md B) |
| `3f73f0dd` | chore: remove dead isSecureEndpoint export and orphaned comingSoon locale key | **EQUIVALENT** | dead isSecureEndpoint — fork a retiré l'export (1aa7c8d5/8a67a39a contexte) |
| `19c7d8c5` | fix(meeting): re-evaluate gated mic state and stop prompts expiring early | **PORTED** | porté par 861dcb2e : `notificationTimer.js` créé (pause sur hover) ; `_lastKnownMicState`/`_evaluateMicState`/`_scheduleCooldownReeval` ; tests (51 pass) |
| `13dd6e7c` | fix: replacement race and dead dismissed flag | **EQUIVALENT** | replacement race/dismissed flag — fork meetingDetectionEngine/windowManager (d4e0034f) |
| `b6807bc0` | refactor(settings): trim redundant doc comment on isTinfoilInferenceUrl | **EQUIVALENT** | comment isTinfoilInferenceUrl — fork transcriptionBaseUrl.ts (1aa7c8d5) |
| `bb4c87a6` | refactor(dictation): tidy VAD resolver and count the echo-rescue decode | **EQUIVALENT** | VAD resolver tidy — fork whisperVadConfig.js (bcf6bdd2) |
| `3bd66e62` | fix(meetings): make the roster-driven speaker cap raise-only | **EQUIVALENT** | roster speaker cap — fork liveSpeakerIdentifier.js |
| `53a4e774` | feat(meeting): enable live speaker identification for Windows loopback capture | **PORTED** | porté par e8fd4b8e (sujet équivalent) |
| `a221ea46` | fix(meeting): anchor live speaker timestamps to the first system chunk | **EQUIVALENT** | anchor live speaker timestamps — fork liveSpeakerIdPolicy.test.js (e8fd4b8e) |
| `7ed358d3` | fix(enterprise): honor existing provider setup and managed route precedence | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `2cb2b2bd` | fix(meeting): scope the prompt countdown to its own window and keep listener state | **EQUIVALENT** | countdown prompt scope — fork windowManager a showMeetingAutoEndCountdown (95279b4b) réutilisant l'overlay de notification |
| `db75e281` | refactor(hotkeys): tighten unregisterSlot guard and trim review comments | **EQUIVALENT** | unregisterSlot guard — fork hotkeySlotUnregister.test.js (668d3793) |
| `8fb5cfa8` | fix: degrade live speaker ID gracefully when onnxruntime binding is missing | **EQUIVALENT** | degrade live speaker ID — fork liveSpeakerIdentifier.js (e8fd4b8e) |
| `a0307fb9` | doc: add mac intel limitation to readme | **ALREADY_PRESENT** | README mac intel — le fork a son propre README |
| `88701d19` | fix(meetings): always persist delayed diarization to its owning note | **PORTED** | porté par 6b4742d0, 1d2afa73 : `diarizationCompletion.ts` + `serialQueue.ts` créés ; listener module-level dans meetingRecordingStore ; noteId ajouté au payload ; tests (12 pass) |
| `573cadfb` | fix: add try catch to ipc handler | **EQUIVALENT** | try/catch ipc handler — fork ipcHandlers a ses propres guards |
| `1dfc36cd` | fix(meetings): serialize diarization completions to preserve speaker labels | **PORTED** | porté par 6b4742d0 : `serialQueue.ts` créé ; écritures diarization sérialisées (12 tests pass) |
| `55806cc9` | fix(meetings): await diarization writes so queue ordering is self-contained | **PORTED** | porté par 6b4742d0 (serialQueue + listener module-level, tests 12 pass) |
| `ffe8d689` | refactor(meetings): tighten diarization completion routing | **PORTED** | porté par 6b4742d0 : `diarizationCompletion.ts` route vers la note propriétaire ; NoteEditor ne fait que mirroirer (tests 12 pass) |
| `dea65c48` | fix(billing): show the covering workspace plan instead of "Free" | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `a6b55afa` | refactor: simplify covering-workspace resolution and trim comments | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `0c9f46c1` | test(enterprise): align routing coverage after main merge | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `34b9250d` | fix(voice-agent): keep screen context within budget and never fail on it | **NOT_APPLICABLE** | voice-agent screen context budget — feature absente du fork |
| `be441074` | chore(release): 1.8.2 | **NOT_APPLICABLE** | changelog/release uniquement |
| `1439ac43` | fix(test): pin the platform for screen-context capture tests | **NOT_APPLICABLE** | test pin platform screen-context — feature absente du fork |
| `6d2d3034` | fix(upload): survive poisoned TLS connections; cap upload diarization speaker clusters (#1496) | **EQUIVALENT** | upload survivre TLS empoisonné + cap diarization — fork a cloudChunkPolicy.js + upload path durci par 9bc0ba53 |
| `9fb16767` | fix(enterprise): Enforce managed cloud identity | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `1d1bcf8d` | fix(linux): link libgobject-2.0 for AT-SPI2 text monitor build | **PORTED** | porté par 3dad3bcf (hash upstream cité) |
| `61d995bb` | docs: drop TROUBLESHOOTING.md addition, moved into PR description instead | **ALREADY_PRESENT** | TROUBLESHOOTING.md — le fork a son propre contenu |
| `46e45518` | Open shared spaces: free collaboration, post-signup join screen, idle sync backoff (#1549) | **NOT_APPLICABLE** | shared spaces / post-signup join — couche workspace purgée |
| `9c48b6ba` | fix(desktop): reconcile enterprise login with shared spaces | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `abf66a1e` | fix(pricing): update desktop Business pricing | **NOT_APPLICABLE** | pricing desktop Business — monétisation absente du fork |
| `f8591ea6` | chore(release): prepare 1.8.2 (#1552) | **NOT_APPLICABLE** | changelog/release uniquement |
| `8b0410d0` | Fix realtime streaming stop errors and calendar API error reporting (#1553) | **EQUIVALENT** | realtime stop errors — fork dictation-realtime-stop gère les erreurs ; la partie calendar API error reporting dépend du provider |
| `a988d820` | fix(diarization): assign gap segments to the nearest speaker cluster (#1423) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `fde916a3` | fix(parakeet): normalize non-PCM16 WAV input (#1376) | **PORTED** | porté par a43bbf4d (issue #1376) |
| `ed431917` | fix(cli): respond with HTTP 400 validation_error on route validation errors (#1521) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `0813c9ca` | fix(members): safely handle null or missing email in filterMemberCandidates (#1450) | **NOT_APPLICABLE** | filterMemberCandidates — couche membres/workspace purgée |
| `7f4c3a66` | fix(security): block IPv6 private and metadata enterprise endpoints (#1440) | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `73d42086` | fix(tools): normalize whitespace and guard nullish inputs in resolveFolderId and resolveSpace (#1477) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `5ff05668` | fix(stt): guard empty normalized text and prompt in dictionary echo filter (#1543) | **PORTED** | porté par 97d9d4f4 (issue #1543) |
| `375a2c86` | fix(sidecars): tolerate unreadable PID entries (#1374) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `1cb44be2` | fix(participants): guard non-positive, non-integer, and non-finite expected speaker counts (#1522) | **PORTED** | porté par 97d9d4f4 (issue #1522) |
| `fc007430` | fix(hotkeys): preserve hotkeys ending in + during list parsing (#1433) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `9445ca9e` | fix(hotkeys): normalize left-side modifier tokens and fix side extraction in isLeftRightMix (#1437) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `0e4f1a0d` | fix(dictionary): normalize untrimmed agent names in agentNameDictionaryChanges (#1442) | **PORTED** | porté par 97d9d4f4 (issue #1442) |
| `e9705fcd` | fix(chat): guard non-positive and non-integer note IDs in assistant note card extraction (#1517) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `e3047151` | fix(utils): format sub-1, non-finite, and negative byte values safely (#1448) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `2501c613` | fix(utils): format sub-zero, non-finite, and nullish durations safely (#1513) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `5d9bb0f5` | fix(calendar): re-arm next meeting timer when resetting provider reminder state (#1486) | **PORTED** | porté par 4a39f18a (issue #1486) |
| `b143cbec` | fix(speaker-count): one definition of a usable expected speaker count (#1555) | **EQUIVALENT** | speaker-count — fork speakerCount.js (9bc0ba53) |
| `461e8fdd` | fix(privacy): wait for the renderer sync before the first retention sweep (#1558) | **PORTED** | porté par a43bbf4d (issue #1558) |
| `785594e5` | fix(stt): surface and keep recordings discarded as a dictionary echo (#1559) | **PORTED** | porté par 2f40bd22 (issue #1559) |
| `1b68e2d8` | fix(export): normalize meeting transcript timestamps for markdown exports (#1560) | **PORTED** | porté par 9bc0ba53 (sujet équivalent) |
| `0e492e3b` | fix(prompts): clear persisted copies of retired default prompts (#1561) | **PORTED** | porté par 08995291 (issue #1561) |
| `274a6b26` | fix(linux): keep meeting notifications clickable after the first hover (#1562) | **PORTED** | porté par d4e0034f (issue #1562) |
| `1a03f8db` | fix(renderer): identify control panel by query (#1563) | **PORTED** | porté par b2b6671b (issue #1563) |
| `20d3a8c1` | fix(i18n): point the translation hotkey hint at Settings → Hotkeys (#1564) | **EQUIVALENT** | i18n hint Settings→Hotkeys — fork locales adaptées |
| `bbee4cd9` | refactor(transcription): fail-closed STT routing — leak fixes, provider registry, model memory, single resolver (#1556) | **PORTED** | porté par 387af486 (sujet équivalent) |
| `ba6ecd64` | fix: voice-agent screen context, selection-edit retry, calendar tool, and AX read fixes (#1566) | **EQUIVALENT** | screen context abandonné fork (2f40bd22) ; selection-edit retry + calendar tool couverts par audioManager pendingSelectionEdit + meetingDetectionEngine joinCalendarMeeting (decisions-to-port.md C) |
| `7acbad4f` | fix(ui): close empty-state gaps found in the audit (#1565) | **EQUIVALENT** | empty-state gaps audit — fork a ses propres états vides (HistoryView/UpcomingMeetings adaptés) |
| `2f2f8f45` | fix(notes): let a reassigned segment outrank its diarization cluster (#1569) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `f879ebcb` | fix(meeting): stop meeting detection firing on our own dictation (#1570) | **PORTED** | porté par 861dcb2e : guard `getOwnProcessPids().has(pid)` dans `_parseWin32ListenerLine` + tests (23→29 pass) |
| `ab4d0546` | fix(linux): keep the autostart entry writable, named and escaped correctly | **EQUIVALENT** | autostart writable/escaped — fork linuxAutostart.test.js (09a9d959) |
| `449018d3` | fix(startup): make launch at login work on Windows and start hidden everywhere | **EQUIVALENT** | launch at login Windows — fork a linuxAutostart.js + settings ; autoStart.js upstream absent (fork Linux-only) |
| `60a9693b` | fix(streaming): wait for the realtime transcript tail instead of sleeping (#1573) | **PORTED** | porté par 2f40bd22 (issue #1573) |
| `22f6e4bb` | fix(startup): point the Linux entry at the launcher wrapper, harden the probe | **EQUIVALENT** | Linux entry launcher — fork linuxAutostart.js (09a9d959) + nsis adapté |
| `9578a89a` | fix(gpu): make whisper GPU state truthful — live activation, honest status, remembered failures | **EQUIVALENT** | GPU state truthful — fork gpuDetection.js (a43bbf4d) |
| `f0d4fd6c` | fix(transcription): stop reporting broken engine responses as 'No Audio Detected' (#1575) | **PORTED** | porté par abd1f8e5 (issue #1575) |
| `7e17729d` | fix(gpu): stop offering the CUDA pack to cards its build cannot run on (#1576) | **PORTED** | porté par a43bbf4d (issue #1576) |
| `1adf4842` | fix(gpu): isolate GPU binary packs in per-pack directories with atomic installs (#1577) | **EQUIVALENT** | GPU packs per-pack dirs — fork gpuBinaryManager.js (a43bbf4d/251e1ad0) |
| `0a121c24` | fix(macos): stop the system Globe action firing alongside the Globe hotkey (#1567) | **PORTED** | porté par 2d2ef7f8 : globeKeyManager `setConfiguration`/`preferenceStatePath`/stdin config ; swift complet (AppleFnUsageType, marker file) ; main.js syncMacNativeHotkeyConfiguration ; tests (9+15 pass) |
| `efcc741e` | fix(gcal): fetch all pages during sync when Google Calendar API returns nextPageToken (#1572) | **PORTED** | porté par 1dabe13e (issue #1572) |
| `77357d6d` | fix(linux): link -lgobject-2.0 explicitly instead of pkg-config --static | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `beedfd32` | fix(llm): fail-closed LLM routing — custom-endpoint leaks, key pairing, model memory, secure scope keys (#1583) | **PORTED** | porté par 625f78f5 : `resolveConfiguredOpenAIBase` fail-closed (throw CUSTOM_ENDPOINT_INVALID) + `canBorrowCleanupCustomKey` + i18n ×10 (2 tests pass) ; reste (model memory, vision override, secretKeys per-scope) = config par scope Phenisys → EQUIVALENT (decisions-to-port.md A/C) |
| `f56eecc2` | chore(gpu): pin whisper.cpp GPU packs to release 0.0.9 (#1584) | **PORTED** | porté par a43bbf4d (issue #1584) |
| `273b7d64` | feat(policy): enforce the org screen-context policy on desktop (#1581) | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `35eaa96d` | fix(billing): withhold the personal Pro checkout from workspace-covered members (#1582) | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `c3f6213a` | fix(calendar): safely handle whitespace hangout_link and nullish candidates in meeting join URL helpers (#1579) (#1580) | **EQUIVALENT** | whitespace hangout_link — fork meetingJoinUrl.js (d357781e) durci |
| `8569ffc9` | chore(release): prepare 1.8.3 (#1588) | **NOT_APPLICABLE** | changelog/release uniquement |
| `a1a802c0` | feat(gpu): offer the CUDA pack to Pascal cards (0.0.9 kernel floor) (#1585) | **PORTED** | porté par a43bbf4d (sujet équivalent) |
| `3688cec7` | docs(changelog): 1.8.3 ships the Pascal CUDA gate (#1585) (#1589) | **NOT_APPLICABLE** | changelog/release uniquement |
| `833946d9` | docs(changelog): cover the meeting join URL hardening (#1580) in 1.8.3 (#1590) | **NOT_APPLICABLE** | changelog/release uniquement |
| `548de3d9` | fix(i18n): repair two unresolvable translation keys and guard against regressions (#1592) | **EQUIVALENT** | i18n keys — fork ca1fa166 a complété toutes les locales |
| `1bcf5fc5` | fix(selection): read selections without accessibility, stop losing agent commands (#1593) | **NOT_APPLICABLE** | sélection sans accessibilité dépend de screenContextCapture.js (feature abandonnée fork, 2f40bd22) ; le path AX du fork reste (decisions-to-port.md B) |
| `7e4b0eb7` | docs(changelog): cover #1592 and #1593 in 1.8.3 (#1595) | **NOT_APPLICABLE** | changelog/release uniquement |
| `251e1ad0` | fix(gpu): stop 1.8.3's GPU regression — Vulkan iGPU default, off-PATH nvidia-smi, silent pack deletion (#1606) (#1609) | **EQUIVALENT** | GPU 1.8.3 regression — fork gpuDetection.js/gpuBinaryManager.js durcis (a43bbf4d) |
| `5cf8b251` | fix(reasoning): stop gpt-oss on Tinfoil failing every request with a 400 (#1611) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `8fbff3ed` | fix(notes): persist diarization metadata on upload and URL-ingest notes (#1610) | **EQUIVALENT** | diarization metadata upload — fork 9bc0ba53 uploadNotes.ts a diarization columns |
| `fdcbceca` | refactor(notes): unify the upload note save path (#1625) | **EQUIVALENT** | unify upload save path — fork 9bc0ba53 a saveUploadNote (shared path) |
| `ab2f1e41` | test(audio): Tolerate setTimeout early-fire in streaming-settle bounds (#1622) | **EQUIVALENT** | setTimeout early-fire test — fork a audioManagerStreamingSettle.test.js (2f40bd22) |
| `a0d2bd42` | fix(sidecars): escalate stale-sidecar reaping to SIGKILL and verify death (#1626) | **PORTED** | porté par d5d49980 (issue #1626) |
| `50238447` | fix(meetings): name the active provider in realtime streaming logs (#1608) | **EQUIVALENT** | nommer le provider dans les logs realtime — fork audioManager loggue le provider streaming |
| `12749e5a` | fix(linux): stop re-paying stale portal sessions on every Wayland paste (#1629) | **EQUIVALENT** | portal session re-pay — fork 3dad3bcf/90c2b160 ont adapté le paste Wayland |
| `961a1b69` | refactor(llm): single source of truth for provider/model request params — dialects, matrix tests, fail-soft, live canary (#1620) | **EQUIVALENT** | single source of truth params — fork a ModelRegistry + per-scope config (spécificité Phenisys) |
| `5a6c7f9b` | fix(windows): ASCII-safe Whisper model cache for non-ASCII profiles (#1514) | **EQUIVALENT** | ASCII-safe whisper cache — fork modelDirUtils.js (c933b293) gère les chemins redirigés |
| `b1c96c6d` | fix(meeting): refresh WASAPI helper capability before recording starts (#1474) | **PORTED** | porté par d5d49980 (issue #1474) |
| `c0202dfc` | fix(dictation): single source of truth for realtime STT provider routing — fixes #1624 (#1631) | **PORTED** | porté par 387af486 (issue #1624, #1631) |
| `45f3c80a` | test(llm): Keep electron mock hermetic across lazy modelDirUtils require (#1647) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `b3a8368b` | feat: add shortcut to add a note to folder (#1650) | **NOT_APPLICABLE** | shortcut note-to-folder via SpacesTree — couche spaces/workspace purgée |
| `73ac9bb7` | refactor(workspace): remove slug from settings UI (#1660) | **NOT_APPLICABLE** | workspace slug settings — couche workspace purgée |
| `18746142` | fix(calendar): backfill stripped Microsoft occurrences from series master (#1665) | **NOT_APPLICABLE** | Microsoft Calendar occurrences — absent du fork |
| `9c16a567` | Make the non-streaming LLM request timeout configurable | **EQUIVALENT** | timeout non-streaming configurable — fork settingsStore timeoutMs par scope |
| `c5a5b8c5` | Extend the configurable LLM request timeout to streaming, fix a leak | **EQUIVALENT** | timeout streaming — fork ReasoningService timeoutMs par scope |
| `508920bb` | Apply the configurable timeout to the Gemini and OpenAI providers | **EQUIVALENT** | timeout Gemini/OpenAI — fork providers utilisent config.timeoutMs |
| `fbd267a2` | fix(gpu): gate the cleanup GPU banner on local inference (#1591) | **EQUIVALENT** | gate GPU banner local inference — fork ControlPanel.tsx a son propre banner (a43bbf4d GPU) |
| `6c72923f` | fix(notes): escape control characters in mirrored note frontmatter (#1646) | **EQUIVALENT** | escape control chars frontmatter — markdownMirror durci (9bc0ba53) |
| `23fd77d5` | fix(dictionary): treat agent names as present ignoring case (#1639) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `f80d8f49` | fix(translation): treat whitespace-only chain results as empty (#1618) | **EQUIVALENT** | whitespace-only chain results — translationChain.js porté par 387af486 (blank-reply guard) |
| `0ee37795` | fix(audio): stop classifying phone microphones as built-in (#1515) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `0e681cc8` | fix(agent): recognize localized wake words (#1604) | **PORTED** | porté par 2f40bd22 (issue #1604) |
| `ac5b0898` | fix(notes): strip wrapping quotes from generated titles (#1640) | **PORTED** | porté par 387af486 (issue #1640) |
| `2f313835` | fix(voice-agent): support extraction when completionMarker is empty or omitted (#1586) (#1587) | **PORTED** | porté par 8a45d442 (issue #1586, #1587) |
| `ca3a297e` | fix(notification): skip Google Calendar time blocks without attendees (#1615) | **PORTED** | porté par 1dabe13e, 4a39f18a (issue #1615) |
| `33f86301` | fix(notification): skip Microsoft and Apple Calendar time blocks without attendees (#1696) | **NOT_APPLICABLE** | Microsoft + Apple Calendar skip — Microsoft absent ; Apple présent mais fork gère via ses propres reminders |
| `78b77dde` | fix(reasoning): strip nested think blocks without leftover tags (#1619) | **PORTED** | porté par 7ee58dd7 (issue #1619) |
| `13ae95e6` | fix(wayland): auto paste not working on non-QWERTY layouts. (#1525) | **EQUIVALENT** | paste non-QWERTY Wayland — fork 3dad3bcf (Ptyxis/GNOME Console) + 90c2b160 (paste restore) couvrent ; linuxPasteTools.ts absent mais fallbacks équivalents |
| `5abb0044` | fix(reasoning): track think-tag depth in streamed chat deltas (#1644) | **PORTED** | porté par ef90810b (issue #1644) |
| `7f08a491` | fix(dictation): Keep text when reasoning returns blank output (#1645) | **PORTED** | porté par 387af486 (issue #1645) |
| `36c9bafe` | Notes UI enhancements: gradient send/mic, voice-note chat drafts, liquid-glass bottom bar, sidebar cleanup (#1651) | **NOT_APPLICABLE** | redesign UI Notes propre à l'upstream (useVoiceDraft.ts, LiveWaveform.tsx) ; le fork a son propre design (PR #4 design system) — divergence assumée (decisions-to-port.md B) |
| `aad659f2` | fix(notes): parse share-dialog email domains without leftover whitespace (#1683) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `56a7ed3f` | fix(network): classify EAI_AGAIN and EPIPE as known cloud errors (#1682) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `7de403ec` | fix(snippets): handle nullish and partial settings in getDictionaryHintWords (#1671) (#1672) | **PORTED** | porté par 3d19a730 (issue #1671, #1672) |
| `36f0c406` | fix(linux): treat Ptyxis and GNOME Console as terminals for paste (#1659) | **PORTED** | porté par 3dad3bcf (issue #1659) |
| `896d4dde` | fix(calendar): recognize Teams /meet/ and Zoom webinar join URLs (#1692) | **PORTED** | porté par d357781e (issue #1692) |
| `a103a4db` | fix(linux): map GNOME punctuation hotkeys to X11 keysyms (#1658) | **PORTED** | porté par bbec097c (issue #1658) |
| `438a614a` | fix(notes): isolate per-file unlink failures in mirror deleteNote (#1649) | **EQUIVALENT** | per-file unlink mirror deleteNote — markdownMirror.js durci par 9bc0ba53 (hardening #1773) |
| `a880f259` | fix(updater): stop automatic update checks when the App updates toggle is off — fixes #1605 (#1662) | **PORTED** | porté par 94d92a47 (issue #1605, #1662) |
| `ab9ae9c8` | fix(i18n): map zh-Hans and zh-Hant locale tags to Chinese UI (#1691) | **PORTED** | porté par 94d92a47 (issue #1691) |
| `884d9bfa` | refactor(meeting): Phase 0 test seams — extract mic gate, holdback policy, segment reducer; pin streaming/token behavior (#1697) | **NOT_APPLICABLE** | test seams du pipeline streaming upstream (openaiRealtimeStreaming etc.) ; le fork a son propre pipeline local (decisions-to-port.md B) |
| `773fed0a` | fix(snippets): do not crash snippet expansion when the list is nullish | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `13772bd6` | chore(format): fix prettier drift breaking the quality-check gate | **EQUIVALENT** | prettier drift — fork 924d055b a formaté les fichiers portés |
| `90cfe033` | fix: click should be the delibrate action to select model for STT models | **EQUIVALENT** | explicit-click model selection — fork 526f088e/102c59ac l'ont porté |
| `bc306d27` | feat(meetings): Auto-end forgotten meeting recordings (#1494) | **PORTED** | porté par 95279b4b (issue #1494) |
| `41cf1d46` | fix(local-llm): Phase 0 correctness + hygiene fixes for local model params and canaries (#1714) | **PORTED** | porté par 358f08d0 : 5 defaults `||`→`??`, requireCompleteOutput forwardé, migrations registry-driven (localLlmProviderIds), gemma fallback dans getModelProvider ; canary CI (scripts/llm-canary.mjs) absent du fork (pas de workflow canary) → reste documenté NON applicable (decisions-to-port.md A/C) |
| `0c271fef` | fix(parakeet): Gate incompatible macOS runtime | **PORTED** | porté par 6729f429 : `parakeetCapability.js` créé (floor 15.5) ; parakeet.js (pre-warm/checkInstallation/startServer/createOnlineStream/transcribe/download) ; picker désactive l'onglet NVIDIA sur macOS < 15.5 ; `verify-macos-parakeet.js` + vérif CI ; tests (3 pass) |
| `30dedcf3` | fix(logging): Suppress packaged Windows console output (#1719) | **PORTED** | porté par bcec1e6c (issue #1719) |
| `063b5b6a` | fix(linux): Preserve focus for Sway overlays (#1718) | **PORTED** | porté par bad38a10 (issue #1718) |
| `da39195a` | fix(models): Honor redirected cache roots (#1721) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `90f79b68` | feat(models): add Gemini 3.5 and 3.1 Flash Lite models (#1702) | **EQUIVALENT** | Gemini 3.5/3.1 Flash Lite — fork modelRegistryData.json les contient (ca1fa166, grep gemini-3.5 = 2) |
| `d4c207a2` | fix(whisper): engage downloaded GPU packs without the env flag | **PORTED** | porté par b6b605c8 : 2 sites `=== "true"` → `!== "false"` dans ipcHandlers + `_syncStartupEnv` logge les échecs .env (4 tests pass) ; la partie pack-on-disk (infra gpuBinaryManager complète) reste CONFLICT documenté — fork gère le GPU via settings/env |
| `b7fdf80b` | fix(whisper): raise decoder anti-hallucination thresholds on local transcription — fixes #1458 | **PORTED** | porté par 387af486 (issue #1458) |
| `f2407757` | feat(llm): Apply the configurable request timeout to the Tinfoil provider | **EQUIVALENT** | timeout Tinfoil — fork tinfoil.ts applique config.timeoutMs ?? REQUEST_TIMEOUT_MS (timeout par scope Phenisys) |
| `cd4dedc7` | fix(parakeet): Clarify unsupported-macOS guidance and dedupe version compare | **PORTED** | porté par 6729f429 : `parakeetCapability.js` (macOS guidance, floor 15.5) + dedupe version compare ; vérif CI (tests 3 pass) |
| `de9e335a` | fix(windows): restore the captured target window before pasting — fixes #859 | **PORTED** | porté par 37bc3e3c, 90c2b160 (issue #859) |
| `4cbfe068` | test(whisper): collapse duplicate whisperServer require in inference-fields test | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `9b3f57a4` | fix: retire dead cloud models and make the canary suites trustworthy (#1722) | **PORTED** | porté par ca1fa166 (issue #1722) |
| `983bf58f` | fix(settings): harden browse-only provider tabs and drop dead code | **EQUIVALENT** | harden browse-only tabs — fork 526f088e/102c59ac ont durci les pickers |
| `43cc03a5` | test(settings): pin the explicit-click commit sequences for model selection | **EQUIVALENT** | test explicit-click — fork a ses tests model selection (526f088e) |
| `28bf6f44` | fix(whisper): accept any casing for the GPU opt-out flag | **EQUIVALENT** | GPU opt-out casing — fork whisper.js gère le flag (a43bbf4d GPU hardening) |
| `0a10184c` | fix(diarization): diarize the mic track for in-person meetings — fixes #1627 | **EQUIVALENT** | diarize mic track in-person — fork diarization.js garde raw mic pre-AEC (d5d49980), logique équivalente |
| `aada0217` | feat(uploads): persist segment timestamps from BYOK cloud transcriptions for SRT export — fixes #1095 | **PORTED** | porté par 9bc0ba53 (issue #1095) |
| `70320880` | fix(settings): Clamp the LLM request timeout input on blur | **EQUIVALENT** | clamp LLM timeout input — fork a timeout par scope, clamp adapté |
| `02666397` | perf(windows): skip the paste settle when the target is already foreground | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `7bbc04c4` | fix(notes): abort local transcription and diarization when an upload is cancelled — fixes #1401 | **PORTED** | porté par bf6035f3 : `uploadCancelRegistry.js` (multi-op par requestId) ; ipcHandlers transcribe-audio-file (whisper/parakeet) + diarize-audio-file + cloud partagent le registry ; diarization tue le child sur abort ; parakeetServer/WsServer ferment le websocket + arrêt segment loop ; whisperServer détruit /inference et rethrow AbortError avant fallback CPU ; renderer fileTranscription + types electron propagent requestId ; tests (7+4+3+2 = 16 pass) |
| `5f268417` | test(settings): note the mid-browse policy-flip precondition in the disallowed-browse pin | **EQUIVALENT** | test policy — fork a policyRules.test.js avec les mêmes préconditions |
| `514866c3` | fix(parakeet): Localize disabled provider tab labels | **EQUIVALENT** | localize disabled provider tabs — fork a ses propres libellés par provider (locales ×10 déjà complétées ca1fa166) |
| `2ffbe357` | fix(diarization): skip orphan speaker embeddings in softened mic mode | **PORTED** | porté par d5d49980 (hash upstream cité) |
| `df826f06` | fix(uploads): anchor upload transcript timestamps to the meeting path's epoch-ms base | **PORTED** | porté par 9bc0ba53 (sujet équivalent) |
| `25f6b07e` | test(diarization): pin mic-mode speaker expectation branches | **EQUIVALENT** | test diarization pin — fork a diarizationSpeakerMerge.test.js (d5d49980) avec logique équivalente |
| `53ec0751` | fix(notes): reject cancelled uploads before ffmpeg conversion and server boot | **PORTED** | porté par a43bbf4d, 08995291 (hash upstream cité) |
| `b7dd0bc1` | style(whisper): rewrap the GPU opt-out comment and drop a redundant test note | **EQUIVALENT** | style whisper comment — fork whisper.js divergé, commentaires adaptés |
| `4afd691d` | style(parakeet): Separate capability hooks with a blank line | **EQUIVALENT** | style parakeet — code fork déjà reformaté (a43bbf4d a touché TranscriptionModelPicker) |
| `df2c4f9a` | chore(reasoning): drop a comment that duplicated the timeout helper docs | **EQUIVALENT** | chore commentaire — fork a timeout par scope |
| `91c11950` | feat(policy): Mirror the server-only memoryEnabled org-policy field (#1717) | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `52f90799` | chore(llm-timeout): correct comments that undersold the setting's streaming reach | **EQUIVALENT** | chore commentaires timeout — fork a timeout par scope, commentaires adaptés |
| `7208bdf8` | fix: dismiss dictation preview when no audio detected (#1667) | **PORTED** | porté par 2f40bd22 (issue #1667) |
| `204e83b7` | fix(settings): keep the browsed whisper-list validation off foreign local models | **PORTED** | porté par 526f088e (hash upstream cité) |
| `672cc901` | feat(notes): real speaker identity in note generation and @mention owner tagging | **PORTED** | porté par 1708586f (sujet équivalent) |
| `a5e59ee4` | feat(calendar): redesign Coming up sidebar with join-and-take-notes and empty states | **PORTED** | partiel : `_resumeExistingEventNote` porté par 861dcb2e (joinCalendarMeeting + handleNotificationResponse résument la note existante via getNoteByCalendarEventId) ; le redesign visuel du sidebar (join-and-take-notes UI) diverge — design Phenisys assumé (decisions-to-port.md A) |
| `973cbf54` | feat(sidebar): redesign Upgrade to Pro banner to new card style | **NOT_APPLICABLE** | redesign Upgrade to Pro banner — monétisation Cloud absente du fork |
| `ff6d216f` | style(sidebar): square compact logo and shorter pill CTA on upgrade banner | **NOT_APPLICABLE** | style upgrade banner Pro — monétisation Cloud absente du fork |
| `927594db` | copy(sidebar): upgrade banner sells unlimited, more accurate, faster transcription | **NOT_APPLICABLE** | copy upgrade banner Pro (monétisation Cloud) — le fork est BYOK/sans plan Pro |
| `e7f6aeb8` | style(calendar): match empty-state card border to the transcriptions card | **EQUIVALENT** | le fork n'a pas de SidebarCard avec ce pattern ; ses états vides (system-audio, sign-in) sont une structure Phenisys différente → divergence design assumée (decisions-to-port.md C) |
| `d45d1d27` | fix(history): keep the wide two-column layout regardless of calendar connection | **PORTED** | porté par edfb6647 (sujet équivalent) |
| `2ef397bc` | fix(calendar): group date-only upcoming events on the local calendar day | **PORTED** | porté par 2452523f (sujet équivalent) |
| `4348e424` | Voice Assistant: merge the chat agent into the voice pipeline, redesign the floating pill (#1597) | **NOT_APPLICABLE** | Voice Assistant pill redesign : entrelacé avec preloadAuthBridge + AssistantPanel upstream ; le fork garde son propre assistant — documenté exclusions |
| `77c6661e` | fix(settings): enforce auto-end and request timeout defaults (#1755) | **EQUIVALENT** | le fork a des timeouts par scope (settingsStore timeoutMs, 30s/5min local) et l'auto-end (95279b4b) — réglages par défaut couverts |
| `93821710` | feat(onboarding): rebuild guided setup experience (#1670) | **NOT_APPLICABLE** | rebuild onboarding entrelacé auth — le fork garde son onboarding |
| `c5d515b9` | fix(dictation): initialize onboarding event ref safely (#1756) | **NOT_APPLICABLE** | rebuild onboarding entrelacé auth — le fork garde son onboarding |
| `3cc197ff` | fix(auth): Unify onboarding and reauthentication display (#1763) | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `523acab0` | fix(linux): map KDE punctuation hotkeys to Qt key codes (#1752) | **PORTED** | porté par 3dad3bcf (issue #1752) |
| `d3661cb0` | fix(ai): retry HTTP 408 request timeouts in the API retry strategy (#1734) | **PORTED** | porté par 16ac9300 (issue #1734) |
| `8b77a599` | fix(calendar): fail OAuth loopback immediately on state mismatch (#1753) | **NOT_APPLICABLE** | couche auth/Cloud/enterprise purgée du fork |
| `47da21d9` | feat(hyprland): support both Lua and legacy configs (#1664) | **PORTED** | porté par 63532922 (issue #1664) |
| `5d5f08c3` | fix(notes): format future timestamps as dates (#1768) | **PORTED** | porté par 96a30614 (issue #1768) |
| `b5c5fb44` | fix(linux): push-to-talk on Wayland (Hyprland, KDE, GNOME 48+) for dictation hotkey (#1738) | **PORTED** | porté par bbec097c (issue #1738) |
| `15b5b3fd` | fix(chat): persist conversation migration links (#1772) | **NOT_APPLICABLE** | SyncService = sync cloud/workspace (couche account purgée) ; database.js du fork ne porte pas de migration links |
| `2893be42` | fix(notes): keep markdown mirror paths inside base (#1773) | **PORTED** | fichiers byte-identiques à HEAD du fork |
| `fa11ddc9` | fix(notes): keep note content visible above the floating chat panel (#1769) | **EQUIVALENT** | le fork a son propre mode chat flottant dans NoteEditor (EmbeddedChatMode) — adaptation fork, pas de floatingChatLayout.ts upstream |
| `193b02b6` | chore(release): prepare 1.9.0 (#1809) | **NOT_APPLICABLE** | changelog/release uniquement |


## TO_PORT — suivi (zéro restant)

Les 24 entrées initialement TO_PORT ont toutes été traitées dans cette reprise.
La table de décisions complète (chantiers portés, reclassements, preuves) est
dans `docs/upstream-1.9.0/decisions-to-port.md`. Récapitulatif :

| Thème | Commits | Disposition |
|---|---|---|
| Tinfoil realtime meeting provider | 7ed3ca43, ad38ed49, e1e639b3, 1a0fabdc | NOT_APPLICABLE (retiré du fork, local-only en meeting) |
| Routing diarization meetings (refactor) | ffe8d689, 55806cc9, 1dfc36cd, 88701d19 | PORTED (6b4742d0, 1d2afa73) |
| Meeting test seams | 884d9bfa | NOT_APPLICABLE (pipeline local fork) |
| Gate mic meeting + notification timer | 19c7d8c5 | PORTED (861dcb2e) |
| Meeting routing fallback | b31db6b8 | NOT_APPLICABLE (mode managed purgé) |
| Screen context voice-agent/selection | 1bcf5fc5, ba6ecd64 | NOT_APPLICABLE / EQUIVALENT (feature abandonnée fork) |
| Abort uploads | 7bbc04c4 | PORTED (bf6035f3) |
| LLM fail-closed routing registry | beedfd32 | PORTED (625f78f5) + EQUIVALENT (reste, config par scope) |
| Local-LLM canaries CI | 41cf1d46 | PORTED partiel (358f08d0) ; canary CI NON applicable (pas de workflow) |
| GPU pack-on-disk | d4c207a2 | PORTED (b6b605c8) ; pack-on-disk CONFLICT documenté |
| Parakeet macOS capability gate | 0c271fef, cd4dedc7 | PORTED (6729f429) |
| macOS Globe listener fix | 0a121c24 | PORTED (2d2ef7f8) |
| Notes UI enhancements | 36c9bafe | NOT_APPLICABLE (divergence design assumée) |
| Calendar sidebar redesign | a5e59ee4 | PORTED partiel (861dcb2e) ; redesign visuel divergé |
| Calendar empty-state border | e7f6aeb8 | EQUIVALENT (divergence design) |
| Meeting detection self-dictation | f879ebcb | PORTED (861dcb2e) |

_Inventaire corrigé après la revue supervisor (PR #9) : tag v1.9.0 corrigé
(193b02b6), classification complète des 224 commits avec justifications
vérifiables, résumé aligné sur l'état réel de la branche (103 PORTED /
71 EQUIVALENT / 48 NOT_APPLICABLE / 0 TO_PORT restant / 2 ALREADY_PRESENT)._
