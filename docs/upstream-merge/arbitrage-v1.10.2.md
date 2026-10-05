# Arbitrage des conflits de contenu — fusion upstream v1.10.2

Branche `feat/upstream-v1.10.2-catchup` — base `971554ba` (fork, = amont v1.10.0 déjà fusionné) ↔ amont `13e432ce` (`v1.10.2`), merge-base `2c20b509`.

Fusion de la release officielle **v1.10.2** (13e432ce) dans le fork Phenisys : **239 fichiers, +15132 / −4276**.

## Ce qui a été mécanique, ce qui a été arbitré

`scripts/upstream-merge.sh v1.10.2` a appliqué le manifeste d'exclusion (117 chemins purgés + 62 exclus) sur les **38 fichiers en conflit** :

- **17 conflits `modify/delete`** (fichiers de la couche exclue supprimés par le fork, modifiés par l'amont) → **gardés supprimés** par le résolveur, mécaniquement.
- **21 conflits de contenu** → arbitrage ci-dessous.
- **8 fichiers de la couche exclue ré-ajoutés par l'amont** (arrivés sans conflit) → supprimés et **inscrits au manifeste** (section `[excluded]`) :
  `src/components/MemberRoster.tsx`, `src/components/notes/NewNoteMenu.tsx`,
  `src/components/notes/SpaceGroupsSection.tsx`, `src/components/notes/SpaceMembersPanel.tsx`,
  `src/components/notes/SpaceNameField.tsx`, `src/components/notes/SpaceSettingsDialog.tsx`,
  `src/hooks/useCanCreateTeamSpace.ts`, `src/hooks/useMemberRoster.ts`, et les tests associés
  (`test/components/newNoteMenu.test.js`, `test/hooks/canCreateTeamSpace.test.js`,
  `test/services/spacesService.test.js`).
- **Câblage** : 0 import orphelin après nettoyage (assertion du résolveur, rejouée par `test/integrity/moduleResolution.test.js`).

## Classement des 21 conflits de contenu

Règle : **l'amont gagne, sauf spécificité Phenisys assumée**.

| # | Fichier | Classement | Décision / justification |
|---|---|---|---|
| 1 | `.github/workflows/build-and-notarize.yml` | MÉCANIQUE | Prendre l'amont, puis réappliquer les bits fork (builds non signés `release-interne.yml` conservés séparément). |
| 2 | `src/components/ControlPanel.tsx` | AMONT + PURGER | Le fork n'a divergé que par la purge ; prendre l'amont et retirer les imports/usages de la couche exclue (workspace, usage, upsell, teams…). |
| 3 | `src/components/ControlPanelSidebar.tsx` | AMONT + PURGER | Idem : divergence = purge seule. |
| 4 | `src/components/SettingsModal.tsx` | AMONT + PURGER | Idem. |
| 5 | `src/components/SettingsPage.tsx` | **LOGIQUE FORK À PRÉSERVER** | Spécificité **PromptStudio** (6 prompts éditables) : garder la logique fork, réintégrer les nouveautés amont autour ; retirer compte / facturation / managed. |
| 6 | `src/components/notes/NoteEditor.tsx` | AMONT + PURGER | Purge : le chip « team space » (`isTeamNote && space?.cloud_space_id`) disparaît — cohérent avec la purge. |
| 7 | `src/components/notes/PersonalNotesView.tsx` | AMONT + PURGER | Divergence accidentelle (séparation des speakers) + purge. |
| 8 | `src/components/notes/UploadAudioView.tsx` | AMONT + PURGER | Purge (auth, usage, managed, enterprise identity). |
| 9 | `src/components/notes/overview/ContainerOverview.tsx` | AMONT + PURGER | Purge (invitations, workspace, permissions). |
| 10 | `src/helpers/audioManager.js` | **LOGIQUE FORK À PRÉSERVER** | Spécificité : **prompt système vide explicite** + **réglages d'inférence par scope** (max tokens / retries / timeouts). Garder la logique fork, réintégrer les nouveautés amont ; retirer auth / sync / rapport d'usage cloud. |
| 11 | `src/helpers/ipcHandlers.js` | AMONT + PURGER | Prendre l'amont (ajout `prepareProviderUpload`) ; retirer les références à la couche exclue. |
| 12 | `src/services/ReasoningService.ts` | **LOGIQUE FORK À PRÉSERVER** | Prompt vide explicite, tokens, retries, timeouts conservés ; identité enterprise managed retirée. |
| 13 | `src/services/ai/inferenceProviders/gemini.ts` | **LOGIQUE FORK À PRÉSERVER** | Prompt vide explicite + réglages par scope conservés. **Décision notable** : l'amont a retiré le plafond `maxOutputTokens` (avis #2091/#2142 — le budget épinglé par l'appelant est calibré pour le chemin LOCAL et tronquait les longs résumés). **L'amont gagne** : Gemini ne reçoit plus de plafond. Le fork n'avait jamais touché cette ligne. |
| 14 | `src/services/ai/inferenceProviders/openai.ts` | **LOGIQUE FORK À PRÉSERVER** | Prompt vide explicite + paramètres par scope ; comportement Responses/Chat amont conservé. |
| 15 | `src/services/ai/inferenceProviders/tinfoil.ts` | **LOGIQUE FORK À PRÉSERVER** | Prompt vide explicite + paramètres par scope ; attestation amont conservée. |
| 16 | `src/services/localReasoningBridge.js` | **LOGIQUE FORK À PRÉSERVER** | Transmission de `timeoutMs` (scope) conservée, avec le contexte amont. |
| 17 | `src/stores/actionProcessingStore.ts` | **LOGIQUE FORK À PRÉSERVER** | Prompts éditables (note / réunion) : les constantes de prompts fixes sont remplacées par PromptStudio. |
| 18 | `src/stores/settingsStore.ts` | **LOGIQUE FORK À PRÉSERVER** | Sentinelle `__EMPTY__` (prompt vide explicite), scopes, héritage du fournisseur local conservés ; auth / managed / sync retirés. |
| 19 | `test/components/directionalContentPolicy.test.js` | AMONT + AJUSTER LA PURGE | L'amont modifie ce test ; l'attente `<span dir="auto">{space.name}</span>` porte sur le **chip « team space » (couche exclue)**, retiré par la fusion → l'attente est supprimée (les attentes sur les dossiers sont conservées). |
| 20 | `test/components/fieldDirectionPolicy.test.js` | AMONT + PURGER | Prendre l'amont et aligner sur les surfaces purgées. |
| 21 | `test/components/spacesTreeNoteActionClearance.test.js` | GARDER SUPPRIMÉ | Test de la couche exclue (spaces) — `git rm`. |

## Décisions d'arbitrage notables (récapitulatif)

1. **Gemini — pas de plafond `maxOutputTokens`** : l'amont gagne (#2091/#2142) ; le fork n'avait pas de spécificité sur cette ligne.
2. **`directionalContentPolicy.test.js`** : l'attente sur `space.name` (chip team-space, couche exclue) est retirée — c'est **le test** qui était resté accroché à une surface purgée, pas le code.
3. **`policyEffectiveVisionOverride.test.js`** (nouveau de l'amont) : le sous-test qui présupposait le **cloud managé** (`mode === "openwhispr"`) est adapté à la réalité du fork (**BYOK → `providers`**).
4. **Spécificités Phenisys préservées** : purge compte/cloud/spaces/teams/billing/sync/enterprise, PromptStudio (6 prompts éditables + prompt vide explicite), réglages d'inférence par scope, upload self-hosted, update feed → `Phenisys/openwhispr`.

## Répartition

| Classement | Nombre |
|---|---|
| MÉCANIQUE | 1 |
| AMONT (+ PURGER / AJUSTER LA PURGE) | 10 |
| LOGIQUE FORK À PRÉSERVER | 9 |
| GARDER SUPPRIMÉ | 1 |

## Correction post-fusion (hors conflits)

Le premier passage laissait deux défauts que la vérification a révélés, corrigés dans la foulée : `maxOutputTokens` réintroduit côté Gemini (voir décision n°1) et le format Prettier (`src/services/ai/inferenceProviders/tinfoil.ts`, `src/helpers/ipcHandlers.js`).

## Vérification

- `scripts/upstream_merge_resolve.py` : **EXIT 0** — aucun chemin interdit, aucun import orphelin.
- Node 24.21.0, `REQUIRE_DB_TESTS=1` : `npm test` **3906/3913, 0 fail** (7 skipped) ; `npm run lint`, `npm run typecheck`, `npm run build:renderer` verts.
- `node --check main.js` OK.

## Recettes utilisées

```bash
# AMONT / AMONT + PURGER
git checkout upstream-v1.10.2 -- <fichier>   # puis retirer les refs de la couche exclue

# LOGIQUE FORK À PRÉSERVER : partir de l'amont, puis réappliquer le delta fork
git checkout upstream-v1.10.2 -- <fichier>
git diff 2c20b509..phenisys/main -- <fichier> | git apply -3   # rejets réglés à la main
```

## Note sur l'historique amont

La PR contient des commits amont porteurs du trailer `Co-authored-by` (auteurs OpenWhispr : Joshua, Idris Gadi, Gabriel Stein, Henry Su, …). Ce sont des commits **de l'amont**, préservés tels quels : le fork reste au plus près de la version officielle et **réécrire l'historique amont créerait une divergence** qui rendrait les fusions suivantes plus coûteuses. Les commits **propres au fork** n'en contiennent aucun.
