# Fusion amont — mode opératoire

Objectif du fork : **rester au plus proche de la version officielle d'OpenWhispr**
(nouveautés et correctifs), en excluant la couche **compte / login / cloud /
workspace / billing / sync / MS-Calendar / enterprise** (politique BYOK / local /
self-hosted).

## En une commande

```bash
scripts/upstream-merge.sh v1.10.0          # fusion + résolution mécanique
scripts/upstream-merge.sh v1.10.0 --check  # simulation, aucune mutation
scripts/upstream-merge.sh v1.10.0 --verify # + npm ci / tests / lint / typecheck / build
```

Le script récupère le tag officiel **sans ajouter de remote permanent**, fait un
`git merge --no-ff`, applique le manifeste d'exclusion, puis affiche ce qui reste
à arbitrer.

## Ce qui est mécanique, ce qui est humain

| Étape | Nature | Outil |
|---|---|---|
| Chemins que le fork a purgés (`[purged]`) | mécanique | `scripts/upstream_merge_resolve.py` |
| Fichiers exclus arrivant **sans conflit** (`[excluded]`) | mécanique | `scripts/upstream_merge_resolve.py` |
| Fichiers ressemblant à la couche exclue (`[warn]`) | alerte seulement | rapport du résolveur |
| Conflits de contenu | **humain** | `docs/upstream-merge/arbitrage-<tag>.md` |

Le manifeste `exclusions.txt` est la **forme mécanique de la divergence** : c'est
lui qui évite de rejouer la purge à la main à chaque version. Toute entrée ajoutée
est une décision d'exclusion — à relire et à versionner comme du code.

## Après l'arbitrage

```bash
git add -A && git commit                       # finalise le merge
scripts/upstream-merge.sh <tag> --verify       # sélectionne un Node 24 sain puis vérifie
# ou, à la main (avec un Node 24 RÉCENT sur le PATH) :
npm ci && npm test && npm run lint && npm run typecheck && npm run build:renderer
```

**Node 24 obligatoire — et RÉCENT** (`.nvmrc`). Deux pièges distincts :

1. **Majeur ≠ 24** : `npm ci` casse le lockfile et l'ABI de `better-sqlite3`
   (faux échecs de tests).
2. **Node 24 ANCIEN** (ex. **24.1.0**, version par défaut de certains `nvm`) :
   le **runner de tests** casse. Avec `--import tsx`, les exports nommés des
   modules `.ts` importés dynamiquement se résolvent mal → des **milliers de faux
   échecs** (`TypeError: X is not a function`). Symptôme typique : `npm test` rouge
   en masse **alors que** lint / typecheck / build passent. Remède : un Node 24
   récent (`fnm install 24 && fnm use 24`, ou `nvm install 24.21`) — **vérifié bon
   en 24.21.0**, qui est aussi ce que la CI `setup-node "24"` résout.

`scripts/upstream-merge.sh --verify` sélectionne désormais lui-même le Node 24 le
plus récent installé (nvm **et** fnm) et le **valide par une sonde tsx** : si aucun
n'est sain, il s'arrête avec un message explicite (code 70) plutôt que de rapporter
de faux échecs. Il ne retombe jamais sur un autre majeur.

## Historique des décisions

- **2026-09-11 — stratégie « fusion amont » retenue**, portage commit-par-commit
  abandonné. Mesures : fusion directe de `v1.10.0` dans `main` = **103** conflits
  (37 contenu / 66 modify-delete) ; après merge de la branche de portage v1.9.0 =
  **215** (dont 42 `add/add`) ; avec ancrage `-s ours` = **306**. La branche de
  portage est conservée comme référence sous le tag `port/v1.9.0-reference`.
- La table de politique d'arbitrage (`inventory.md` / `decisions-to-port.md`) est
  récupérable depuis ce tag : `git checkout port/v1.9.0-reference -- docs/upstream-1.9.0/`.
