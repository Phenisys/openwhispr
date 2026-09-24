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
nvm exec 24 npm ci && nvm exec 24 npm test && nvm exec 24 npm run lint \
  && nvm exec 24 npm run typecheck && nvm exec 24 npm run build:renderer
```

**Node 24 obligatoire** (`.nvmrc`) : un `npm ci` avec une autre version casse le
lockfile et l'ABI de `better-sqlite3` (faux échecs de tests).

## Historique des décisions

- **2026-09-11 — stratégie « fusion amont » retenue**, portage commit-par-commit
  abandonné. Mesures : fusion directe de `v1.10.0` dans `main` = **103** conflits
  (37 contenu / 66 modify-delete) ; après merge de la branche de portage v1.9.0 =
  **215** (dont 42 `add/add`) ; avec ancrage `-s ours` = **306**. La branche de
  portage est conservée comme référence sous le tag `port/v1.9.0-reference`.
- La table de politique d'arbitrage (`inventory.md` / `decisions-to-port.md`) est
  récupérable depuis ce tag : `git checkout port/v1.9.0-reference -- docs/upstream-1.9.0/`.
