#!/usr/bin/env bash
# Fusion d'une release officielle OpenWhispr dans le fork Phenisys.
#
# Objectif du fork : rester AU PLUS PRÈS de la version officielle (nouveautés et
# correctifs), en excluant la couche compte/login/cloud/workspace/billing/sync/
# MS-Calendar/enterprise (politique BYOK / local / self-hosted).
#
# Ce que le script fait :
#   1. vérifie l'arbre propre, récupère le tag officiel (sans remote permanent) ;
#   2. `git merge --no-ff` du tag ;
#   3. applique le manifeste d'exclusion (scripts/upstream_merge_resolve.py) :
#      chemins purgés maintenus supprimés + fichiers exclus arrivés sans conflit,
#      puis assertions et rapport des références orphelines ;
#   4. laisse les conflits de contenu à l'arbitrage humain (règle : l'amont
#      gagne, sauf spécificité Phenisys assumée) et affiche la marche à suivre.
#
# Usage :
#   scripts/upstream-merge.sh v1.10.0
#   scripts/upstream-merge.sh v1.10.0 --check      # simulation, aucune mutation
#   scripts/upstream-merge.sh v1.10.0 --verify     # + npm ci && tests && lint ...
#   scripts/upstream-merge.sh v1.10.0 --upstream-url https://github.com/ORG/REPO.git
set -euo pipefail

UPSTREAM_URL_DEFAULT="https://github.com/OpenWhispr/openwhispr.git"
TAG=""
UPSTREAM_URL="$UPSTREAM_URL_DEFAULT"
CHECK=0
VERIFY=0
MANIFEST="docs/upstream-merge/exclusions.txt"

while [ $# -gt 0 ]; do
  case "$1" in
    --check) CHECK=1 ;;
    --verify) VERIFY=1 ;;
    --upstream-url) UPSTREAM_URL="${2:?--upstream-url attend une URL}"; shift ;;
    --manifest) MANIFEST="${2:?--manifest attend un chemin}"; shift ;;
    -h|--help) sed -n '2,25p' "$0"; exit 0 ;;
    -*) echo "option inconnue : $1" >&2; exit 64 ;;
    *) TAG="$1" ;;
  esac
  shift
done

[ -n "$TAG" ] || { echo "usage : scripts/upstream-merge.sh <tag> [--check] [--verify] [--upstream-url URL]" >&2; exit 64; }

REPO="$(git rev-parse --show-toplevel)"
cd "$REPO"
LOCAL_REF="upstream-${TAG}"

echo "=== Fusion amont $TAG dans le fork Phenisys ==="
echo "  dépôt        : $REPO"
echo "  branche      : $(git branch --show-current)"
echo "  référence    : $LOCAL_REF"
echo "  manifeste    : $MANIFEST"

[ -f "$MANIFEST" ] || { echo "ERREUR : manifeste introuvable ($MANIFEST)" >&2; exit 66; }

if [ -n "$(git status --porcelain)" ]; then
  echo "ERREUR : arbre de travail non propre — commitez ou remisez avant de fusionner." >&2
  git status --short | head -20 >&2
  exit 65
fi

if [ -f .nvmrc ]; then
  WANT="$(tr -d 'v \n' < .nvmrc)"
  HAVE="$(node -v 2>/dev/null | tr -d 'v' | cut -d. -f1 || true)"
  if [ -n "$HAVE" ] && [ "$HAVE" != "$WANT" ]; then
    echo "ATTENTION : Node $HAVE détecté, .nvmrc demande $WANT." >&2
    echo "            Un npm ci hors Node $WANT casse le lockfile et l'ABI better-sqlite3." >&2
  fi
  # Résolution de la bonne version : nvm chargé, sinon installation nvm directe,
  # sinon PATH. Évite un faux échec de tests (ABI better-sqlite3) et un lockfile
  # régénéré avec le mauvais majeur, même quand nvm n'est pas chargé dans le shell.
  NODE_BIN=""
  if command -v nvm >/dev/null 2>&1; then
    NODE_BIN=""
    NVM_MODE=1
  else
    NVM_MODE=0
    for d in "${NVM_DIR:-$HOME/.nvm}/versions/node/v$WANT"* ; do
      if [ -x "$d/bin/npm" ]; then NODE_BIN="$d/bin"; break; fi
    done
  fi
fi

run_with_node() {
  if [ "${NVM_MODE:-0}" = "1" ]; then
    nvm exec "$(tr -d 'v \n' < .nvmrc)" "$@"
  elif [ -n "${NODE_BIN:-}" ]; then
    PATH="$NODE_BIN:$PATH" "$@"
  else
    "$@"
  fi
}

if ! git rev-parse -q --verify "refs/tags/$LOCAL_REF" >/dev/null; then
  echo "-- récupération du tag officiel (sans ajouter de remote permanent) --"
  git fetch --no-tags "$UPSTREAM_URL" "refs/tags/${TAG}:refs/tags/${LOCAL_REF}"
fi
echo "  commit amont : $(git rev-parse --short "refs/tags/$LOCAL_REF")"
echo "  merge-base   : $(git merge-base HEAD "refs/tags/$LOCAL_REF" | cut -c1-12)"

if [ "$CHECK" = "1" ]; then
  echo
  echo "-- simulation : la fusion ne sera pas effectuée --"
  python3 scripts/upstream_merge_resolve.py --manifest "$MANIFEST" --check || rc=$?
  exit "${rc:-0}"
fi

echo
echo "-- fusion (un code de sortie 1 signifie « conflits », pas « échec ») --"
set +e
git merge --no-ff --no-edit "refs/tags/$LOCAL_REF"
MERGE_RC=$?
set -e

if [ "$MERGE_RC" -eq 0 ]; then
  echo "-- fusion sans conflit : le manifeste est quand même appliqué --"
elif [ "$MERGE_RC" -eq 1 ]; then
  echo "-- conflits détectés : résolution mécanique puis arbitrage humain --"
else
  echo "ERREUR : git merge a échoué (code $MERGE_RC)" >&2
  exit "$MERGE_RC"
fi

set +e
python3 scripts/upstream_merge_resolve.py --manifest "$MANIFEST"
RESOLVE_RC=$?
set -e

echo
case "$RESOLVE_RC" in
  0) echo "Résolution mécanique OK, aucun conflit de contenu : la fusion peut être committée." ;;
  2) echo "Conflits de contenu restants : arbitrer fichier par fichier (l'amont gagne," \
          "sauf spécificité Phenisys — cf. docs/upstream-1.9.0/inventory.md de la branche" \
          "de portage, tag port/v1.9.0-reference)." ;;
  *) echo "ERREUR : résolution mécanique incomplète (code $RESOLVE_RC)." >&2 ;;
esac

if [ "$VERIFY" = "1" ]; then
  echo
  echo "-- vérifications (Node $(tr -d 'v \n' < .nvmrc)) --"
  if [ "${NVM_MODE:-0}" != "1" ] && [ -z "${NODE_BIN:-}" ]; then
    echo "Node $(tr -d 'v \n' < .nvmrc) introuvable (nvm non chargé, aucune installation locale) :" >&2
    echo "  lancer manuellement en Node $(tr -d 'v \n' < .nvmrc) :" >&2
    echo "  npm ci && npm test && npm run lint && npm run typecheck && npm run build:renderer" >&2
  else
    run_with_node npm ci
    run_with_node npm test
    run_with_node npm run lint
    run_with_node npm run typecheck
    run_with_node npm run build:renderer
  fi
fi

exit "$RESOLVE_RC"
