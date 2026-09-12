# Arbitrage des conflits de contenu — fusion upstream v1.10.0

Branche `feat/upstream-v1.10.0-catchup` — base `574a829f` (fork) ↔ amont `2a00e18d` (`v1.10.0`), merge-base `1866ecf6`.

Les **66** conflits `modify/delete` et les **62** fichiers exclus arrivés sans conflit sont traités mécaniquement par `scripts/upstream-merge.sh` (manifeste `docs/upstream-merge/exclusions.txt`). Ne restent que ces **37** conflits de contenu.

## Méthode de classement

| Classement | Sens | Action |
|---|---|---|
| **MÉCANIQUE** | fichiers de plomberie (lockfile, workflows, locales, CSS) | prendre l'amont, réappliquer les bits Phenisys |
| **PRENDRE L'AMONT** | le fork a divergé par accident ; l'amont fait la même chose | prendre l'amont — supprime une taxe récurrente |
| **PRENDRE L'AMONT + PURGER** | le fork n'a fait que retirer la couche exclue | prendre l'amont, puis retirer les références à la couche exclue dans ce fichier |
| **LOGIQUE FORK À PRÉSERVER** | vraie spécificité Phenisys (PromptStudio, scopes, thème, updater, CI) | garder la logique fork, réintégrer les nouveautés amont autour |
| **À EXAMINER** | ni purge ni feature identifiée | arbitrage manuel |

La colonne **purge** = part des lignes que le fork a retirées en citant un module de la couche exclue. Élevée ⇒ le fichier n'est pas une divergence voulue, c'est du nettoyage — et ce nettoyage est le même à chaque version.

## Répartition

| Classement | Nombre |
|---|---|
| MÉCANIQUE | 1 |
| PRENDRE L'AMONT | 1 |
| PRENDRE L'AMONT + PURGER | 18 |
| LOGIQUE FORK À PRÉSERVER | 17 |

## Détail (trié par classement, puis par intensité de purge)

| # | Fichier | Classement | Fork (+/−) | Amont (+/−) | Blocs | purge | Commit(s) fork | Motif |
|---|---|---|---|---|---|---|---|---|
| 1 | `src/index.css` | **MÉCANIQUE** | +38/−35 | +786/−29 | 5 | 0% | `fec083df` feat(theme): rebrand theme colors  | prendre l'amont, puis réappliquer les bits Phenisys (dépôt, workflow release-interne, palette) |
| 2 | `src/components/notes/PersonalNotesView.tsx` | **PRENDRE L'AMONT** | +1092/−998 | +134/−141 | 9 | 1% | `f8c2eac1` fix: correctlly separate speakers , `385a8b84` fix(meeting): use resolved speaker | divergence accidentelle (séparation des speakers) : l'amont fait la même chose → supprime une taxe récurrente |
| 3 | `src/components/TranscriptionModelPicker.tsx` | **PRENDRE L'AMONT + PURGER** | +0/−1 | +591/−297 | 1 | 100% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 4 | `src/hooks/useNotesOnboarding.ts` | **PRENDRE L'AMONT + PURGER** | +2/−4 | +18/−4 | 2 | 50% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 5 | `src/components/settings/MeetingSettings.tsx` | **PRENDRE L'AMONT + PURGER** | +1/−17 | +55/−28 | 3 | 35% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 6 | `src/components/notes/overview/OverviewNoteList.tsx` | **PRENDRE L'AMONT + PURGER** | +0/−25 | +14/−9 | 3 | 24% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 7 | `src/models/modelRegistryData.json` | **PRENDRE L'AMONT + PURGER** | +7/−55 | +233/−64 | 1 | 15% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 8 | `src/stores/meetingRecordingStore.ts` | **PRENDRE L'AMONT + PURGER** | +8/−35 | +1016/−566 | 2 | 14% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 9 | `src/components/notes/overview/ContainerOverview.tsx` | **PRENDRE L'AMONT + PURGER** | +1/−35 | +9/−8 | 2 | 11% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 10 | `src/components/ControlPanel.tsx` | **PRENDRE L'AMONT + PURGER** | +1/−207 | +307/−340 | 9 | 11% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 11 | `src/AppRouter.jsx` | **PRENDRE L'AMONT + PURGER** | +5/−92 | +105/−66 | 5 | 9% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 12 | `src/services/fileTranscription.ts` | **PRENDRE L'AMONT + PURGER** | +0/−14 | +167/−11 | 2 | 7% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 13 | `src/components/notes/UploadAudioView.tsx` | **PRENDRE L'AMONT + PURGER** | +16/−128 | +263/−171 | 9 | 7% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 14 | `src/components/SettingsModal.tsx` | **PRENDRE L'AMONT + PURGER** | +3/−29 | +22/−4 | 2 | 7% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 15 | `src/components/IntegrationsView.tsx` | **PRENDRE L'AMONT + PURGER** | +4/−72 | +267/−142 | 5 | 6% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 16 | `src/components/OnboardingFlow.tsx` | **PRENDRE L'AMONT + PURGER** | +30/−135 | +1123/−960 | 11 | 5% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 17 | `src/components/notes/NoteEditor.tsx` | **PRENDRE L'AMONT + PURGER** | +7/−231 | +291/−303 | 13 | 5% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 18 | `src/components/ControlPanelSidebar.tsx` | **PRENDRE L'AMONT + PURGER** | +1/−121 | +49/−99 | 6 | 4% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 19 | `src/types/electron.ts` | **PRENDRE L'AMONT + PURGER** | +0/−79 | +843/−81 | 1 | 3% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 20 | `src/components/HistoryView.tsx` | **PRENDRE L'AMONT + PURGER** | +1/−44 | +67/−180 | 2 | 0% | `2bccc3a3` chore(purge): remove account/login | le seul commit fork touchant ce fichier est la purge → prendre la version amont puis rejouer la purge dans ce fichier |
| 21 | `src/components/chat/useChatStreaming.ts` | **LOGIQUE FORK À PRÉSERVER** | +3/−1 | +309/−61 | 2 | 100% | `39a4652e` feat(inference): configurable per-, `e1b85f08` feat(inference): configurable per- | spécificité Phenisys : réglages d'inférence par scope (max tokens / retries), réglages d'inférence par scope (timeouts) → garder la logique fork et réintégrer les nouveautés amont autour |
| 22 | `src/stores/settingsStore.ts` | **LOGIQUE FORK À PRÉSERVER** | +149/−55 | +1245/−230 | 4 | 56% | `538bbf28` fix(prompts): explicit empty syste, `cfcdce74` fix: allow 0 retry attempts and 0  | spécificité Phenisys : prompt système vide explicite, réglages d'inférence par scope (max tokens / retries) → garder la logique fork et réintégrer les nouveautés amont autour |
| 23 | `src/components/settings/UploadSettings.tsx` | **LOGIQUE FORK À PRÉSERVER** | +23/−17 | +75/−14 | 6 | 35% | `f8ab1d58` feat(upload): expose self-hosted t, `2bccc3a3` chore(purge): remove account/login | spécificité Phenisys : upload self-hosted → garder la logique fork et réintégrer les nouveautés amont autour |
| 24 | `src/components/settings/InferenceConfigEditor.tsx` | **LOGIQUE FORK À PRÉSERVER** | +113/−24 | +187/−59 | 4 | 21% | `39a4652e` feat(inference): configurable per-, `e1b85f08` feat(inference): configurable per- | spécificité Phenisys : réglages d'inférence par scope (max tokens / retries), réglages d'inférence par scope (timeouts) → garder la logique fork et réintégrer les nouveautés amont autour |
| 25 | `src/helpers/audioManager.js` | **LOGIQUE FORK À PRÉSERVER** | +31/−17 | +1869/−861 | 6 | 12% | `538bbf28` fix(prompts): explicit empty syste, `39a4652e` feat(inference): configurable per- | spécificité Phenisys : prompt système vide explicite, réglages d'inférence par scope (max tokens / retries) → garder la logique fork et réintégrer les nouveautés amont autour |
| 26 | `src/components/SettingsPage.tsx` | **LOGIQUE FORK À PRÉSERVER** | +40/−1084 | +1116/−350 | 9 | 2% | `bba453d5` feat(prompts): make all 6 fixed sy, `2bccc3a3` chore(purge): remove account/login | spécificité Phenisys : PromptStudio (6 prompts éditables) → garder la logique fork et réintégrer les nouveautés amont autour |
| 27 | `src/components/settings/ChatAgentSettings.tsx` | **LOGIQUE FORK À PRÉSERVER** | +1/−1 | +2/−1 | 1 | 0% | `538bbf28` fix(prompts): explicit empty syste | spécificité Phenisys : prompt système vide explicite → garder la logique fork et réintégrer les nouveautés amont autour |
| 28 | `src/components/ui/PromptStudio.tsx` | **LOGIQUE FORK À PRÉSERVER** | +23/−8 | +122/−91 | 2 | 0% | `538bbf28` fix(prompts): explicit empty syste, `bba453d5` feat(prompts): make all 6 fixed sy | spécificité Phenisys : prompt système vide explicite, PromptStudio (6 prompts éditables) → garder la logique fork et réintégrer les nouveautés amont autour |
| 29 | `src/helpers/noteFormattingOverrides.js` | **LOGIQUE FORK À PRÉSERVER** | +48/−27 | +7/−5 | 2 | 0% | `39a4652e` feat(inference): configurable per-, `e1b85f08` feat(inference): configurable per- | spécificité Phenisys : réglages d'inférence par scope (max tokens / retries), réglages d'inférence par scope (timeouts) → garder la logique fork et réintégrer les nouveautés amont autour |
| 30 | `src/services/BaseReasoningService.ts` | **LOGIQUE FORK À PRÉSERVER** | +4/−0 | +7/−0 | 1 | 0% | `39a4652e` feat(inference): configurable per-, `e1b85f08` feat(inference): configurable per- | spécificité Phenisys : réglages d'inférence par scope (max tokens / retries), réglages d'inférence par scope (timeouts) → garder la logique fork et réintégrer les nouveautés amont autour |
| 31 | `src/services/ReasoningService.ts` | **LOGIQUE FORK À PRÉSERVER** | +13/−10 | +428/−179 | 2 | 0% | `538bbf28` fix(prompts): explicit empty syste, `39a4652e` feat(inference): configurable per- | spécificité Phenisys : prompt système vide explicite, réglages d'inférence par scope (max tokens / retries) → garder la logique fork et réintégrer les nouveautés amont autour |
| 32 | `src/services/ai/inferenceProviders/gemini.ts` | **LOGIQUE FORK À PRÉSERVER** | +13/−6 | +28/−8 | 2 | 0% | `538bbf28` fix(prompts): explicit empty syste, `39a4652e` feat(inference): configurable per- | spécificité Phenisys : prompt système vide explicite, réglages d'inférence par scope (max tokens / retries) → garder la logique fork et réintégrer les nouveautés amont autour |
| 33 | `src/services/ai/inferenceProviders/openai.ts` | **LOGIQUE FORK À PRÉSERVER** | +16/−10 | +77/−39 | 5 | 0% | `538bbf28` fix(prompts): explicit empty syste, `39a4652e` feat(inference): configurable per- | spécificité Phenisys : prompt système vide explicite, réglages d'inférence par scope (max tokens / retries) → garder la logique fork et réintégrer les nouveautés amont autour |
| 34 | `src/services/ai/inferenceProviders/tinfoil.ts` | **LOGIQUE FORK À PRÉSERVER** | +12/−9 | +8/−17 | 2 | 0% | `538bbf28` fix(prompts): explicit empty syste, `39a4652e` feat(inference): configurable per- | spécificité Phenisys : prompt système vide explicite, réglages d'inférence par scope (max tokens / retries) → garder la logique fork et réintégrer les nouveautés amont autour |
| 35 | `src/services/localReasoningBridge.js` | **LOGIQUE FORK À PRÉSERVER** | +1/−0 | +7/−9 | 1 | 0% | `e1b85f08` feat(inference): configurable per- | spécificité Phenisys : réglages d'inférence par scope (timeouts) → garder la logique fork et réintégrer les nouveautés amont autour |
| 36 | `src/stores/actionProcessingStore.ts` | **LOGIQUE FORK À PRÉSERVER** | +5/−33 | +29/−5 | 2 | 0% | `bba453d5` feat(prompts): make all 6 fixed sy | spécificité Phenisys : PromptStudio (6 prompts éditables) → garder la logique fork et réintégrer les nouveautés amont autour |
| 37 | `src/utils/generateTitle.ts` | **LOGIQUE FORK À PRÉSERVER** | +5/−4 | +3/−2 | 2 | 0% | `39a4652e` feat(inference): configurable per-, `e1b85f08` feat(inference): configurable per- | spécificité Phenisys : réglages d'inférence par scope (max tokens / retries), réglages d'inférence par scope (timeouts) → garder la logique fork et réintégrer les nouveautés amont autour |

## Recettes par classement

```bash
# PRENDRE L'AMONT  /  PRENDRE L'AMONT + PURGER  /  MÉCANIQUE
git checkout upstream-v1.10.0 -- <fichier> && git add <fichier>

# LOGIQUE FORK À PRÉSERVER : partir de l'amont, puis réappliquer le delta fork
git checkout upstream-v1.10.0 -- <fichier>
git diff 1866ecf6..origin/main -- <fichier> | git apply -3   # résoudre les rejets
git add <fichier>

# revenir au conflit d'origine d'un fichier :
git checkout -m -- <fichier>
```

## Inspecter / trancher un fichier

```bash
# le conflit en cours (marqueurs <<<<<<< ======= >>>>>>>)
git diff --diff-filter=U -- <fichier>
# ce que le FORK a changé depuis la base :
git diff 1866ecf6..origin/main -- <fichier>
# ce que l'AMONT a changé depuis la base :
git diff 1866ecf6..upstream-v1.10.0 -- <fichier>
```

## Après arbitrage

```bash
git add -A && git commit                       # finalise le merge
nvm exec 24 npm ci && nvm exec 24 npm test && nvm exec 24 npm run lint \
  && nvm exec 24 npm run typecheck && nvm exec 24 npm run build:renderer
```

Puis le nettoyage du câblage : `scripts/upstream_merge_resolve.py` liste les fichiers qui
importent encore une cible absente du disque (chaque importation relative est résolue sur
le disque, extensions implicites et `index` compris) ; le build et les tests guident le reste.

> **2026-09-12 — mesure corrigée.** La première version du résolveur rapprochait les
> références par *stem* de fichier trouvé dans n'importe quelle chaîne : elle annonçait
> **141** fichiers / **259** références, dont l'essentiel était faux (l'identifiant de
> fournisseur `"corti"` comptait comme un import de `corti.ts`, et le mot `openwhispr`
> comme un import de `openwhispr.ts`). Le scan résout désormais chaque specifier relatif
> sur le disque : **12 imports réellement cassés dans 7 fichiers** ont été corrigés, dont
> sept dans le processus principal (`main.js`, `ipcHandlers.js`, `googleCalendarOAuth.js`,
> `enterpriseAiProviders.js`) qui empêchaient l'application de démarrer. L'assertion est
> devenue bloquante (code de sortie 1) et un test la rejoue à chaque `npm test`
> (`test/integrity/moduleResolution.test.js`).
