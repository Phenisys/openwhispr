# Inventaire du delta OpenWhispr v1.9.0 vs fork Phenisys

Merge-base : `1866ecf6` (Merge PR #1426)
Tag upstream : `v1.9.0` (`86021450`)
Branche : `feat/issue-8-upstream-1.9.0`

## Méthode

Chaque commit non-merge entre le merge-base et v1.9.0 (225 commits) est classé :

- **PORTED** : porté dans le fork (fichiers identiques ou équivalents à HEAD).
- **ALREADY_PRESENT** : le contenu existait déjà dans le fork avant ce chantier.
- **EQUIVALENT** : le fork a une implémentation équivalente (divergence assumée).
- **TO_PORT** : applicable, non encore porté.
- **NOT_APPLICABLE** : non applicable (auth/cloud purgé, Microsoft Calendar, changelog).
- **CONFLICT** : en conflit structurel avec les spécificités Phenisys ; adaptation nécessaire.

## Résumé

| Classe | Nombre |
|---|---|
| PORTED (ce chantier, 2 runs) | 27 commits |
| ALREADY_PRESENT / EQUIVALENT | 10 |
| NOT_APPLICABLE | 19 |
| TO_PORT (restant, inclut CONFLICT à documenter) | 196 |

## Commits portés (chantier issue #8)

| Commit fork | Chantier |
|---|---|
| 387af486 | fix(dictation): port 1.9.0 dictation fixes — realtime routing, anti-hallucination, blank-reply guard, phone-mic, titre |
| 1708586f | feat(notes): port 1.9.0 speaker identity + @mention owner tagging |
| 95279b4b | feat(meetings): port 1.9.0 auto-end forgotten meeting recordings (#1494) |
| 9bc0ba53 | feat(uploads): port 1.9.0 timestamped upload transcripts + SRT export (#1095) |
| ca1fa166 | feat(models): port 1.9.0 AI provider/model updates |
| 94d92a47 | fix(updater): gate update checks on the App updates toggle; map zh-Hans/zh-Hant |
| 90c2b160 + 37bc3e3c | fix(windows): restore captured target window before pasting (#859) |
| bcec1e6c | fix(logging): suppress packaged Windows console output, --console-logs (#1719) |
| fb8c885c | fix(hotkeys): release slot accelerators on unregister (#1420) |
| bcf6bdd2 | fix(dictation): VAD opt-in + dictionary-echo rescue (#1491) |
| 1aa7c8d5 | fix(settings): preserve Custom STT endpoint URL across tabs (#1459) |
| 16ac9300 | fix(ai): retry HTTP 408, last retryable error (#1734) |
| 96a30614 | fix(notes): format future timestamps as dates (#1768) |
| 09a9d959 | feat(linux): launch-at-login XDG autostart (#1493) |
| 63532922 | feat(hyprland): Lua + legacy configs (#1664) |
| bbec097c | fix(linux): push-to-talk Wayland Hyprland/KDE/GNOME48 + punctuation keysyms (#1738, #1658) |
| 3d19a730 | fix(snippets): nullish/partial settings (#1671) |
| 49555e2d | fix(snippets): nullish list crash (#1673) |
| 7ee58dd7 | fix(reasoning): strip nested think blocks (#1619) |
| ef90810b | fix(reasoning): think-tag depth in streamed deltas (#1644) |
| 8a45d442 | fix(voice-agent): completionMarker empty/omitted (#1586) |
| d357781e | fix(calendar): Teams /meet/ + Zoom webinar join URLs (#1692) |
| 4a39f18a | fix(calendar): skip time blocks w/o attendees; re-arm timer (#1615, #1486) |
| edfb6647 | fix(history): wide two-column layout (#1771) |
| c933b293 | fix(models): honor redirected cache roots (#1721) |
| 1dabe13e | fix(gcal): fetch all pages + prune stale events (#1572, #1615) |

## Exclusions documentées

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
  son propre assistant. À réévaluer chantier par chantier.

## Adaptations / CONFLICT notables

- **hotkeyManager / KDE / GNOME** : le fork a des slots GNOME étendus (agent),
  push-to-talk KDE via KGlobalAccel et un state machine activation-mode déjà présent ;
  fusion manuelle de b5c5fb44 (setActivationMode, supportsPushToTalk, getMacNativeListenerConfig ajoutés).
- **OnboardingFlow** : gardé version fork (auth-purged), push-to-talk onboarding déjà présent.
- **windowManager** : ajout de setOnboardingActive/_hideNormalAppSurfaces/endOnboardingDemo
  (b5c5fb44) adaptés au fork ; les tests upstream windowManagerMeetingNotification/AssistantPanel
  dépendent d'APIs upstream absentes (sendPrepareDictation, isMeetingInputAllowed) → non portés.
- **GPU whisper (d4c207a2, #1340)** : le fork résout le backend GPU via settings/env ;
  le port upstream (pack-on-disk, resolveGpuStartOptions) nécessite l'infra gpuBinaryManager
  complète → CONFLICT documenté, non porté dans ce chantier.
- **Speaker identity meetings (e3642b2b, 47623ee3, 098a256c, 7e13884f, 3bd66e62, 53a4e774, a221ea46, 8fb5cfa8)** :
  le fork a sa propre implémentation (1708586f) ; la rework upstream diverge → CONFLICT.
- **Tests tsx-dépendants** : activationModeSelector.test.js, openaiEndpointRetry.test.js,
  translationCoverage.test.js — le runner du fork est `node --test` natif (type-stripping,
  pas de tsx) ; ces tests upstream exigent `--import tsx` → non portés (documenté).

## Classification détaillée par commit

| Commit | Sujet | Classe | Justification |
|---|---|---|---|
| `86021450` | docs(changelog): credit outside contributors in 1.9.0 | **NOT_APPLICABLE** | changelog/docs only |
| `be67e959` | chore(release): prepare 1.9.0 | **NOT_APPLICABLE** | changelog/docs only |
| `fa11ddc9` | fix(notes): keep note content visible above the floating chat pane | **TO_PORT** |  |
| `2893be42` | fix(notes): keep markdown mirror paths inside base (#1773) | **ALREADY_PRESENT** | all changed files already identical at HEAD |
| `15b5b3fd` | fix(chat): persist conversation migration links (#1772) | **TO_PORT** |  |
| `b5c5fb44` | fix(linux): push-to-talk on Wayland (Hyprland, KDE, GNOME 48+) for | **TO_PORT** |  |
| `5d5f08c3` | fix(notes): format future timestamps as dates (#1768) | **TO_PORT** |  |
| `47da21d9` | feat(hyprland): support both Lua and legacy configs (#1664) | **TO_PORT** |  |
| `8b77a599` | fix(calendar): fail OAuth loopback immediately on state mismatch ( | **NOT_APPLICABLE** | cloud/auth layer (purged from fork) |
| `d3661cb0` | fix(ai): retry HTTP 408 request timeouts in the API retry strategy | **TO_PORT** |  |
| `523acab0` | fix(linux): map KDE punctuation hotkeys to Qt key codes (#1752) | **TO_PORT** |  |
| `3cc197ff` | fix(auth): Unify onboarding and reauthentication display (#1763) | **TO_PORT** |  |
| `c5d515b9` | fix(dictation): initialize onboarding event ref safely (#1756) | **TO_PORT** |  |
| `93821710` | feat(onboarding): rebuild guided setup experience (#1670) | **NOT_APPLICABLE** | Microsoft Calendar/Graph (not in fork) |
| `77c6661e` | fix(settings): enforce auto-end and request timeout defaults (#175 | **TO_PORT** |  |
| `4348e424` | Voice Assistant: merge the chat agent into the voice pipeline, red | **TO_PORT** |  |
| `2ef397bc` | fix(calendar): group date-only upcoming events on the local calend | **TO_PORT** |  |
| `d45d1d27` | fix(history): keep the wide two-column layout regardless of calend | **TO_PORT** |  |
| `e7f6aeb8` | style(calendar): match empty-state card border to the transcriptio | **TO_PORT** |  |
| `927594db` | copy(sidebar): upgrade banner sells unlimited, more accurate, fast | **TO_PORT** |  |
| `ff6d216f` | style(sidebar): square compact logo and shorter pill CTA on upgrad | **TO_PORT** |  |
| `973cbf54` | feat(sidebar): redesign Upgrade to Pro banner to new card style | **TO_PORT** |  |
| `a5e59ee4` | feat(calendar): redesign Coming up sidebar with join-and-take-note | **TO_PORT** |  |
| `672cc901` | feat(notes): real speaker identity in note generation and @mention | **TO_PORT** |  |
| `204e83b7` | fix(settings): keep the browsed whisper-list validation off foreig | **TO_PORT** |  |
| `7208bdf8` | fix: dismiss dictation preview when no audio detected (#1667) | **TO_PORT** |  |
| `52f90799` | chore(llm-timeout): correct comments that undersold the setting's  | **TO_PORT** |  |
| `91c11950` | feat(policy): Mirror the server-only memoryEnabled org-policy fiel | **TO_PORT** |  |
| `df2c4f9a` | chore(reasoning): drop a comment that duplicated the timeout helpe | **TO_PORT** |  |
| `4afd691d` | style(parakeet): Separate capability hooks with a blank line | **TO_PORT** |  |
| `b7dd0bc1` | style(whisper): rewrap the GPU opt-out comment and drop a redundan | **TO_PORT** |  |
| `53ec0751` | fix(notes): reject cancelled uploads before ffmpeg conversion and  | **TO_PORT** |  |
| `25f6b07e` | test(diarization): pin mic-mode speaker expectation branches | **TO_PORT** |  |
| `df826f06` | fix(uploads): anchor upload transcript timestamps to the meeting p | **TO_PORT** |  |
| `2ffbe357` | fix(diarization): skip orphan speaker embeddings in softened mic m | **TO_PORT** |  |
| `514866c3` | fix(parakeet): Localize disabled provider tab labels | **TO_PORT** |  |
| `5f268417` | test(settings): note the mid-browse policy-flip precondition in th | **TO_PORT** |  |
| `7bbc04c4` | fix(notes): abort local transcription and diarization when an uplo | **TO_PORT** |  |
| `02666397` | perf(windows): skip the paste settle when the target is already fo | **ALREADY_PRESENT** | all changed files already identical at HEAD |
| `70320880` | fix(settings): Clamp the LLM request timeout input on blur | **TO_PORT** |  |
| `aada0217` | feat(uploads): persist segment timestamps from BYOK cloud transcri | **TO_PORT** |  |
| `0a10184c` | fix(diarization): diarize the mic track for in-person meetings — | **TO_PORT** |  |
| `28bf6f44` | fix(whisper): accept any casing for the GPU opt-out flag | **TO_PORT** |  |
| `43cc03a5` | test(settings): pin the explicit-click commit sequences for model  | **TO_PORT** |  |
| `983bf58f` | fix(settings): harden browse-only provider tabs and drop dead code | **TO_PORT** |  |
| `9b3f57a4` | fix: retire dead cloud models and make the canary suites trustwort | **TO_PORT** |  |
| `4cbfe068` | test(whisper): collapse duplicate whisperServer require in inferen | **ALREADY_PRESENT** | all changed files already identical at HEAD |
| `de9e335a` | fix(windows): restore the captured target window before pasting � | **TO_PORT** |  |
| `cd4dedc7` | fix(parakeet): Clarify unsupported-macOS guidance and dedupe versi | **TO_PORT** |  |
| `f2407757` | feat(llm): Apply the configurable request timeout to the Tinfoil p | **TO_PORT** |  |
| `b7fdf80b` | fix(whisper): raise decoder anti-hallucination thresholds on local | **TO_PORT** |  |
| `d4c207a2` | fix(whisper): engage downloaded GPU packs without the env flag | **TO_PORT** |  |
| `90f79b68` | feat(models): add Gemini 3.5 and 3.1 Flash Lite models (#1702) | **TO_PORT** |  |
| `da39195a` | fix(models): Honor redirected cache roots (#1721) | **ALREADY_PRESENT** | all changed files already identical at HEAD |
| `063b5b6a` | fix(linux): Preserve focus for Sway overlays (#1718) | **TO_PORT** |  |
| `30dedcf3` | fix(logging): Suppress packaged Windows console output (#1719) | **TO_PORT** |  |
| `0c271fef` | fix(parakeet): Gate incompatible macOS runtime | **TO_PORT** |  |
| `41cf1d46` | fix(local-llm): Phase 0 correctness + hygiene fixes for local mode | **TO_PORT** |  |
| `bc306d27` | feat(meetings): Auto-end forgotten meeting recordings (#1494) | **TO_PORT** |  |
| `90cfe033` | fix: click should be the delibrate action to select model for STT  | **TO_PORT** |  |
| `13772bd6` | chore(format): fix prettier drift breaking the quality-check gate | **TO_PORT** |  |
| `773fed0a` | fix(snippets): do not crash snippet expansion when the list is nul | **ALREADY_PRESENT** | all changed files already identical at HEAD |
| `884d9bfa` | refactor(meeting): Phase 0 test seams — extract mic gate, holdba | **TO_PORT** |  |
| `ab9ae9c8` | fix(i18n): map zh-Hans and zh-Hant locale tags to Chinese UI (#169 | **TO_PORT** |  |
| `a880f259` | fix(updater): stop automatic update checks when the App updates to | **TO_PORT** |  |
| `438a614a` | fix(notes): isolate per-file unlink failures in mirror deleteNote  | **TO_PORT** |  |
| `a103a4db` | fix(linux): map GNOME punctuation hotkeys to X11 keysyms (#1658) | **TO_PORT** |  |
| `896d4dde` | fix(calendar): recognize Teams /meet/ and Zoom webinar join URLs ( | **TO_PORT** |  |
| `36f0c406` | fix(linux): treat Ptyxis and GNOME Console as terminals for paste  | **TO_PORT** |  |
| `7de403ec` | fix(snippets): handle nullish and partial settings in getDictionar | **TO_PORT** |  |
| `56a7ed3f` | fix(network): classify EAI_AGAIN and EPIPE as known cloud errors ( | **ALREADY_PRESENT** | all changed files already identical at HEAD |
| `aad659f2` | fix(notes): parse share-dialog email domains without leftover whit | **TO_PORT** |  |
| `36c9bafe` | Notes UI enhancements: gradient send/mic, voice-note chat drafts,  | **TO_PORT** |  |
| `7f08a491` | fix(dictation): Keep text when reasoning returns blank output (#16 | **TO_PORT** |  |
| `5abb0044` | fix(reasoning): track think-tag depth in streamed chat deltas (#16 | **TO_PORT** |  |
| `13ae95e6` | fix(wayland): auto paste not working on non-QWERTY layouts. (#1525 | **TO_PORT** |  |
| `78b77dde` | fix(reasoning): strip nested think blocks without leftover tags (# | **TO_PORT** |  |
| `33f86301` | fix(notification): skip Microsoft and Apple Calendar time blocks w | **NOT_APPLICABLE** | Microsoft Calendar/Graph (not in fork) |
| `ca3a297e` | fix(notification): skip Google Calendar time blocks without attend | **TO_PORT** |  |
| `2f313835` | fix(voice-agent): support extraction when completionMarker is empt | **TO_PORT** |  |
| `ac5b0898` | fix(notes): strip wrapping quotes from generated titles (#1640) | **TO_PORT** |  |
| `0e681cc8` | fix(agent): recognize localized wake words (#1604) | **TO_PORT** |  |
| `0ee37795` | fix(audio): stop classifying phone microphones as built-in (#1515) | **ALREADY_PRESENT** | all changed files already identical at HEAD |
| `f80d8f49` | fix(translation): treat whitespace-only chain results as empty (#1 | **TO_PORT** |  |
| `23fd77d5` | fix(dictionary): treat agent names as present ignoring case (#1639 | **TO_PORT** |  |
| `6c72923f` | fix(notes): escape control characters in mirrored note frontmatter | **TO_PORT** |  |
| `fbd267a2` | fix(gpu): gate the cleanup GPU banner on local inference (#1591) | **TO_PORT** |  |
| `508920bb` | Apply the configurable timeout to the Gemini and OpenAI providers | **TO_PORT** |  |
| `c5a5b8c5` | Extend the configurable LLM request timeout to streaming, fix a le | **TO_PORT** |  |
| `9c16a567` | Make the non-streaming LLM request timeout configurable | **TO_PORT** |  |
| `18746142` | fix(calendar): backfill stripped Microsoft occurrences from series | **NOT_APPLICABLE** | Microsoft Calendar/Graph (not in fork) |
| `73ac9bb7` | refactor(workspace): remove slug from settings UI (#1660) | **TO_PORT** |  |
| `b3a8368b` | feat: add shortcut to add a note to folder (#1650) | **NOT_APPLICABLE** | cloud/auth layer (purged from fork) |
| `45f3c80a` | test(llm): Keep electron mock hermetic across lazy modelDirUtils r | **TO_PORT** |  |
| `c0202dfc` | fix(dictation): single source of truth for realtime STT provider r | **TO_PORT** |  |
| `b1c96c6d` | fix(meeting): refresh WASAPI helper capability before recording st | **TO_PORT** |  |
| `5a6c7f9b` | fix(windows): ASCII-safe Whisper model cache for non-ASCII profile | **TO_PORT** |  |
| `961a1b69` | refactor(llm): single source of truth for provider/model request p | **TO_PORT** |  |
| `12749e5a` | fix(linux): stop re-paying stale portal sessions on every Wayland  | **TO_PORT** |  |
| `50238447` | fix(meetings): name the active provider in realtime streaming logs | **TO_PORT** |  |
| `a0d2bd42` | fix(sidecars): escalate stale-sidecar reaping to SIGKILL and verif | **TO_PORT** |  |
| `ab2f1e41` | test(audio): Tolerate setTimeout early-fire in streaming-settle bo | **TO_PORT** |  |
| `fdcbceca` | refactor(notes): unify the upload note save path (#1625) | **TO_PORT** |  |
| `8fbff3ed` | fix(notes): persist diarization metadata on upload and URL-ingest  | **NOT_APPLICABLE** | changelog/docs only |
| `5cf8b251` | fix(reasoning): stop gpt-oss on Tinfoil failing every request with | **TO_PORT** |  |
| `251e1ad0` | fix(gpu): stop 1.8.3's GPU regression — Vulkan iGPU default, off | **TO_PORT** |  |
| `7e4b0eb7` | docs(changelog): cover #1592 and #1593 in 1.8.3 (#1595) | **NOT_APPLICABLE** | changelog/docs only |
| `1bcf5fc5` | fix(selection): read selections without accessibility, stop losing | **TO_PORT** |  |
| `548de3d9` | fix(i18n): repair two unresolvable translation keys and guard agai | **TO_PORT** |  |
| `833946d9` | docs(changelog): cover the meeting join URL hardening (#1580) in 1 | **NOT_APPLICABLE** | changelog/docs only |
| `3688cec7` | docs(changelog): 1.8.3 ships the Pascal CUDA gate (#1585) (#1589) | **NOT_APPLICABLE** | changelog/docs only |
| `a1a802c0` | feat(gpu): offer the CUDA pack to Pascal cards (0.0.9 kernel floor | **TO_PORT** |  |
| `8569ffc9` | chore(release): prepare 1.8.3 (#1588) | **NOT_APPLICABLE** | changelog/docs only |
| `c3f6213a` | fix(calendar): safely handle whitespace hangout_link and nullish c | **TO_PORT** |  |
| `35eaa96d` | fix(billing): withhold the personal Pro checkout from workspace-co | **TO_PORT** |  |
| `273b7d64` | feat(policy): enforce the org screen-context policy on desktop (#1 | **TO_PORT** |  |
| `f56eecc2` | chore(gpu): pin whisper.cpp GPU packs to release 0.0.9 (#1584) | **TO_PORT** |  |
| `beedfd32` | fix(llm): fail-closed LLM routing — custom-endpoint leaks, key p | **TO_PORT** |  |
| `77357d6d` | fix(linux): link -lgobject-2.0 explicitly instead of pkg-config -- | **TO_PORT** |  |
| `efcc741e` | fix(gcal): fetch all pages during sync when Google Calendar API re | **TO_PORT** |  |
| `0a121c24` | fix(macos): stop the system Globe action firing alongside the Glob | **TO_PORT** |  |
| `1adf4842` | fix(gpu): isolate GPU binary packs in per-pack directories with at | **TO_PORT** |  |
| `7e17729d` | fix(gpu): stop offering the CUDA pack to cards its build cannot ru | **TO_PORT** |  |
| `f0d4fd6c` | fix(transcription): stop reporting broken engine responses as 'No  | **TO_PORT** |  |
| `9578a89a` | fix(gpu): make whisper GPU state truthful — live activation, hon | **TO_PORT** |  |
| `22f6e4bb` | fix(startup): point the Linux entry at the launcher wrapper, harde | **TO_PORT** |  |
| `60a9693b` | fix(streaming): wait for the realtime transcript tail instead of s | **TO_PORT** |  |
| `449018d3` | fix(startup): make launch at login work on Windows and start hidde | **TO_PORT** |  |
| `ab4d0546` | fix(linux): keep the autostart entry writable, named and escaped c | **TO_PORT** |  |
| `f879ebcb` | fix(meeting): stop meeting detection firing on our own dictation ( | **TO_PORT** |  |
| `2f2f8f45` | fix(notes): let a reassigned segment outrank its diarization clust | **TO_PORT** |  |
| `7acbad4f` | fix(ui): close empty-state gaps found in the audit (#1565) | **TO_PORT** |  |
| `ba6ecd64` | fix: voice-agent screen context, selection-edit retry, calendar to | **TO_PORT** |  |
| `bbee4cd9` | refactor(transcription): fail-closed STT routing — leak fixes, p | **NOT_APPLICABLE** | changelog/docs only |
| `20d3a8c1` | fix(i18n): point the translation hotkey hint at Settings → Hotke | **TO_PORT** |  |
| `1a03f8db` | fix(renderer): identify control panel by query (#1563) | **TO_PORT** |  |
| `274a6b26` | fix(linux): keep meeting notifications clickable after the first h | **TO_PORT** |  |
| `0e492e3b` | fix(prompts): clear persisted copies of retired default prompts (# | **TO_PORT** |  |
| `1b68e2d8` | fix(export): normalize meeting transcript timestamps for markdown  | **TO_PORT** |  |
| `785594e5` | fix(stt): surface and keep recordings discarded as a dictionary ec | **TO_PORT** |  |
| `461e8fdd` | fix(privacy): wait for the renderer sync before the first retentio | **TO_PORT** |  |
| `b143cbec` | fix(speaker-count): one definition of a usable expected speaker co | **TO_PORT** |  |
| `5d9bb0f5` | fix(calendar): re-arm next meeting timer when resetting provider r | **TO_PORT** |  |
| `2501c613` | fix(utils): format sub-zero, non-finite, and nullish durations saf | **TO_PORT** |  |
| `e3047151` | fix(utils): format sub-1, non-finite, and negative byte values saf | **TO_PORT** |  |
| `e9705fcd` | fix(chat): guard non-positive and non-integer note IDs in assistan | **TO_PORT** |  |
| `0e4f1a0d` | fix(dictionary): normalize untrimmed agent names in agentNameDicti | **TO_PORT** |  |
| `9445ca9e` | fix(hotkeys): normalize left-side modifier tokens and fix side ext | **TO_PORT** |  |
| `fc007430` | fix(hotkeys): preserve hotkeys ending in + during list parsing (#1 | **TO_PORT** |  |
| `1cb44be2` | fix(participants): guard non-positive, non-integer, and non-finite | **TO_PORT** |  |
| `375a2c86` | fix(sidecars): tolerate unreadable PID entries (#1374) | **TO_PORT** |  |
| `5ff05668` | fix(stt): guard empty normalized text and prompt in dictionary ech | **TO_PORT** |  |
| `73d42086` | fix(tools): normalize whitespace and guard nullish inputs in resol | **TO_PORT** |  |
| `7f4c3a66` | fix(security): block IPv6 private and metadata enterprise endpoint | **NOT_APPLICABLE** | cloud/auth layer (purged from fork) |
| `0813c9ca` | fix(members): safely handle null or missing email in filterMemberC | **TO_PORT** |  |
| `ed431917` | fix(cli): respond with HTTP 400 validation_error on route validati | **TO_PORT** |  |
| `fde916a3` | fix(parakeet): normalize non-PCM16 WAV input (#1376) | **TO_PORT** |  |
| `a988d820` | fix(diarization): assign gap segments to the nearest speaker clust | **TO_PORT** |  |
| `8b0410d0` | Fix realtime streaming stop errors and calendar API error reportin | **NOT_APPLICABLE** | Microsoft Calendar/Graph (not in fork) |
| `f8591ea6` | chore(release): prepare 1.8.2 (#1552) | **TO_PORT** |  |
| `abf66a1e` | fix(pricing): update desktop Business pricing | **TO_PORT** |  |
| `9c48b6ba` | fix(desktop): reconcile enterprise login with shared spaces | **TO_PORT** |  |
| `46e45518` | Open shared spaces: free collaboration, post-signup join screen, i | **TO_PORT** |  |
| `61d995bb` | docs: drop TROUBLESHOOTING.md addition, moved into PR description  | **ALREADY_PRESENT** | all changed files already identical at HEAD |
| `1d1bcf8d` | fix(linux): link libgobject-2.0 for AT-SPI2 text monitor build | **TO_PORT** |  |
| `9fb16767` | fix(enterprise): Enforce managed cloud identity | **TO_PORT** |  |
| `6d2d3034` | fix(upload): survive poisoned TLS connections; cap upload diarizat | **TO_PORT** |  |
| `1439ac43` | fix(test): pin the platform for screen-context capture tests | **TO_PORT** |  |
| `be441074` | chore(release): 1.8.2 | **NOT_APPLICABLE** | changelog/docs only |
| `34b9250d` | fix(voice-agent): keep screen context within budget and never fail | **TO_PORT** |  |
| `0c9f46c1` | test(enterprise): align routing coverage after main merge | **TO_PORT** |  |
| `a6b55afa` | refactor: simplify covering-workspace resolution and trim comments | **TO_PORT** |  |
| `dea65c48` | fix(billing): show the covering workspace plan instead of "Free" | **TO_PORT** |  |
| `ffe8d689` | refactor(meetings): tighten diarization completion routing | **TO_PORT** |  |
| `55806cc9` | fix(meetings): await diarization writes so queue ordering is self- | **TO_PORT** |  |
| `1dfc36cd` | fix(meetings): serialize diarization completions to preserve speak | **TO_PORT** |  |
| `573cadfb` | fix: add try catch to ipc handler | **TO_PORT** |  |
| `88701d19` | fix(meetings): always persist delayed diarization to its owning no | **TO_PORT** |  |
| `a0307fb9` | doc: add mac intel limitation to readme | **ALREADY_PRESENT** | all changed files already identical at HEAD |
| `8fb5cfa8` | fix: degrade live speaker ID gracefully when onnxruntime binding i | **TO_PORT** |  |
| `db75e281` | refactor(hotkeys): tighten unregisterSlot guard and trim review co | **TO_PORT** |  |
| `2cb2b2bd` | fix(meeting): scope the prompt countdown to its own window and kee | **TO_PORT** |  |
| `7ed358d3` | fix(enterprise): honor existing provider setup and managed route p | **TO_PORT** |  |
| `a221ea46` | fix(meeting): anchor live speaker timestamps to the first system c | **TO_PORT** |  |
| `53a4e774` | feat(meeting): enable live speaker identification for Windows loop | **TO_PORT** |  |
| `3bd66e62` | fix(meetings): make the roster-driven speaker cap raise-only | **TO_PORT** |  |
| `bb4c87a6` | refactor(dictation): tidy VAD resolver and count the echo-rescue d | **TO_PORT** |  |
| `b6807bc0` | refactor(settings): trim redundant doc comment on isTinfoilInferen | **TO_PORT** |  |
| `13dd6e7c` | fix: replacement race and dead dismissed flag | **TO_PORT** |  |
| `19c7d8c5` | fix(meeting): re-evaluate gated mic state and stop prompts expirin | **TO_PORT** |  |
| `3f73f0dd` | chore: remove dead isSecureEndpoint export and orphaned comingSoon | **TO_PORT** |  |
| `b31db6b8` | fix: restore fallback | **TO_PORT** |  |
| `8a67a39a` | fix: Tailscale MagicDNS allowed over HTTP and Self-hosted mode for | **TO_PORT** |  |
| `a3745821` | fix(policy): Hide restricted options and apply safe fallbacks | **TO_PORT** |  |
| `df52041b` | feat: provision managed Bedrock and Azure access | **TO_PORT** |  |
| `c9c0dd58` | fix(dictation-agent): make inference mode authoritative | **TO_PORT** |  |
| `f67f2a6b` | fix(meetings): harden realtime provider routing | **TO_PORT** |  |
| `15768f6c` | fix(utils): guard formatAmount against invalid input | **TO_PORT** |  |
| `79f46db1` | fix(dictation-agent): normalize provider for local and self-hosted | **TO_PORT** |  |
| `9e1ab841` | fix(translation): route local models with an empty provider throug | **TO_PORT** |  |
| `79ee1b9a` | feat(linux): Add launch at login via an XDG autostart entry | **TO_PORT** |  |
| `28cb7f82` | fix(audio): eliminate first-words loss from cold mic opens (#845)  | **TO_PORT** |  |
| `ef16852c` | chore: update stale comment | **TO_PORT** |  |
| `7e13884f` | fix: Reconciliation deleted a manual mapping whenever the live and | **TO_PORT** |  |
| `098a256c` | fix(meetings): Address speaker identity review findings | **TO_PORT** |  |
| `47623ee3` | fix(meetings): Address speaker identity review findings | **TO_PORT** |  |
| `e3642b2b` | fix(meetings): Keep speaker identities stable and manual labels pe | **TO_PORT** |  |
| `caeef3b8` | fix: failing test | **TO_PORT** |  |
| `1a0fabdc` | fix(meetings): harden the Tinfoil commit adaptation | **TO_PORT** |  |
| `e1e639b3` | feat(meetings): select Tinfoil realtime for meeting transcription | **TO_PORT** |  |
| `ad38ed49` | feat(meetings): register tinfoil-realtime meeting provider | **TO_PORT** |  |
| `7ed3ca43` | feat(meetings): add Tinfoil realtime streaming client | **TO_PORT** |  |
| `58d9af0d` | fix: Mode-switch validity guard | **TO_PORT** |  |
| `82fd37aa` | fix(settings): close stale-state gaps in explicit model selection | **TO_PORT** |  |
| `d6b0314d` | feat: add keys to github relase build | **TO_PORT** |  |
| `f23c8f8c` | fix: Refresh-token rotation race, provider filter and other cleanu | **NOT_APPLICABLE** | Microsoft Calendar/Graph (not in fork) |
| `21a63ad2` | fix: agent calendar tool, tests and outdated claude.md | **NOT_APPLICABLE** | Microsoft Calendar/Graph (not in fork) |
| `702ef1a9` | feat(calendar): Microsoft Calendar (Graph) integration | **NOT_APPLICABLE** | Microsoft Calendar/Graph (not in fork) |
| `ff3e529c` | fix: centralize duplicated error string | **TO_PORT** |  |
| `1462c23d` | fix(settings): Preserve Custom STT endpoint URL across provider ta | **TO_PORT** |  |
| `a87ba3e6` | fix: failing dictionary test | **ALREADY_PRESENT** | all changed files already identical at HEAD |
| `2b6aab3d` | fix(dictation): Make VAD opt-in and rescue dictionary-echo decodes | **TO_PORT** |  |
| `da710f26` | fix(hotkeys): release a slot's registered accelerators on unregist | **TO_PORT** |  |
| `b9b5335d` | fix: make model selection an explicit click and only bootstrap if  | **TO_PORT** |  |
| `22c52d4d` | feat(voice-agent): opt-in screen context capture with vision model | **TO_PORT** |  |

_Document généré automatiquement par le chantier issue #8 (2 runs). Les classes PORTED listées
ci-dessus correspondent aux 27 commits de la branche ; les 196 TO_PORT restants incluent des
chantiers CONFLICT documentés et des petits fixes non critiques à traiter en suivi._
