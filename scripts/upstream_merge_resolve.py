#!/usr/bin/env python3
"""Résolution mécanique d'une fusion amont dans le fork Phenisys.

À lancer APRÈS `git merge <tag-upstream>` : applique le manifeste
`docs/upstream-merge/exclusions.txt` (voir son en-tête pour le rôle des
sections), vérifie qu'aucun chemin exclu ne subsiste et signale les références
orphelines laissées par les fichiers supprimés.

Ne touche jamais aux conflits de contenu : ceux-là sont des arbitrages humains
(règle : l'amont gagne, sauf spécificité Phenisys assumée).

Usage :
  scripts/upstream_merge_resolve.py            # applique le manifeste
  scripts/upstream_merge_resolve.py --check    # rapport seul, aucune mutation

Codes de sortie : 0 = résolution mécanique OK ; 1 = violation d'assertion ;
2 = des conflits de contenu subsistent (normal, à arbitrer à la main).
"""
from __future__ import annotations

import argparse
import fnmatch
import re
import subprocess
import sys
from pathlib import Path

CODE_EXT = (".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".json", ".yml", ".yaml")


def run(args, cwd=None):
    p = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    return p.stdout, p.stderr, p.returncode


def git(repo, *args, ok=True):
    out, err, rc = run(["git", "-C", repo, *args])
    if ok and rc != 0:
        sys.exit("FAILED: git %s\n%s" % (" ".join(args), err.strip()))
    return out


def parse_manifest(path):
    """Retourne (purged, excluded, warn) — listes et motifs."""
    purged, excluded, warn, section = [], [], [], None
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"^\[(\w+)\]", line)
        if m:
            section = m.group(1)
            continue
        if section == "purged":
            purged.append(line)
        elif section == "excluded":
            excluded.append(line)
        elif section == "warn":
            warn.append(line)
    return purged, excluded, warn


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--repo", default=None, help="racine du dépôt (défaut : git top-level)")
    ap.add_argument("--manifest", default="docs/upstream-merge/exclusions.txt")
    ap.add_argument("--check", action="store_true", help="rapport seul, aucune mutation")
    a = ap.parse_args()

    repo = a.repo or git(".", "rev-parse", "--show-toplevel").strip()
    manifest = Path(repo) / a.manifest
    if not manifest.is_file():
        sys.exit("FAILED: manifeste introuvable : %s" % manifest)

    purged, excluded, warn = parse_manifest(manifest)
    if not purged or not excluded:
        sys.exit("FAILED: manifeste vide ou mal formé (purged=%d excluded=%d)"
                 % (len(purged), len(excluded)))
    forbidden = sorted(set(purged) | set(excluded))

    merging = (Path(repo) / ".git" / "MERGE_HEAD").exists() or \
        bool(git(repo, "rev-parse", "-q", "--verify", "MERGE_HEAD", ok=False).strip())
    print("=== Résolution mécanique de fusion amont ===")
    print("  dépôt     : %s" % repo)
    print("  manifeste : %s" % a.manifest)
    print("  fusion en cours : %s%s" % ("oui" if merging else "NON",
                                        "" if merging else "  (lancez `git merge <tag>` d'abord)"))
    print("  interdits : %d chemins (%d purgés + %d exclus)"
          % (len(forbidden), len(purged), len(excluded)))

    unmerged = [l.strip() for l in
                git(repo, "diff", "--name-only", "--diff-filter=U").splitlines() if l.strip()]
    print("\n-- conflits détectés : %d --" % len(unmerged))

    mechanical = [p for p in unmerged if p in forbidden]
    content = [p for p in unmerged if p not in forbidden]
    print("  traités par le manifeste (garder supprimé) : %d" % len(mechanical))
    print("  conflits de CONTENU à arbitrer (humain)    : %d" % len(content))

    # fichiers exclus arrivés SANS conflit (donc présents dans l'arbre après fusion)
    silent = [p for p in forbidden
              if (Path(repo) / p).is_file() and p not in unmerged]
    print("  exclus arrivés sans conflit                : %d" % len(silent))

    removed, failures = [], []
    if not a.check:
        for p in sorted(set(mechanical) | set(silent)):
            out, err, rc = run(["git", "-C", repo, "rm", "-f", "-q", "--ignore-unmatch", "--", p])
            if rc != 0:
                failures.append((p, err.strip()))
            else:
                removed.append(p)
        print("\n-- supprimés : %d / %d --" % (len(removed), len(set(mechanical) | set(silent))))
        for p, e in failures[:10]:
            print("   ! échec %s : %s" % (p, e))

    # assertions
    print("\n-- assertions --")
    present = [p for p in forbidden if (Path(repo) / p).exists()]
    if present:
        print("   ECHEC : %d chemin(s) interdit(s) encore présent(s)" % len(present))
        for p in present[:10]:
            print("      %s" % p)
    else:
        print("   OK : aucun chemin du manifeste n'est présent (%d vérifiés)" % len(forbidden))

    # références orphelines laissées par les suppressions : on agrège par
    # fichier référent, car l'unité de travail est « quel fichier survivant
    # pointe encore sur un module supprimé », pas la liste des occurrences.
    removed_paths = sorted(set(mechanical) | set(silent)) or forbidden
    stems = {}
    for p in removed_paths:
        stems.setdefault(Path(p).stem, p)
    referrers = {}
    if stems:
        pattern = "|".join(re.escape(s) for s in sorted(stems, key=len, reverse=True) if len(s) >= 4)
        out, _err, rc = run(["git", "-C", repo, "grep", "-n", "-I", "-E", pattern,
                             "--", "*.js", "*.mjs", "*.cjs", "*.ts", "*.tsx", "*.jsx"])
        if rc == 0:
            spec_re = re.compile(r"""["'`]([^"'`]+)["'`]""")
            for line in out.splitlines():
                path, _sep, rest = line.partition(":")
                if path in ("".join(removed_paths),) or path in set(removed_paths):
                    continue
                for spec in spec_re.findall(rest):
                    stem = Path(spec).stem
                    if stem in stems:
                        referrers.setdefault(path, set()).add(stem)

    if referrers:
        total_refs = sum(len(v) for v in referrers.values())
        print("   ATTENTION : %d fichier(s) survivant(s) pointent encore vers un module supprimé"
              % len(referrers))
        print("      soit %d référence(s) de module à retirer du câblage (le build en révélera d'autres) :"
              % total_refs)
        for path in sorted(referrers, key=lambda k: (-len(referrers[k]), k))[:40]:
            mods = sorted(referrers[path])
            print("      %-52s %2d module(s) : %s"
                  % (path, len(mods), ", ".join(mods[:4]) + ("…" if len(mods) > 4 else "")))
    else:
        print("   OK : aucune référence orpheline de module détectée")

    # alertes non destructives sur les motifs
    tracked = [l for l in git(repo, "ls-files").splitlines() if l.strip()]
    hits = sorted(p for p in tracked if p not in forbidden
                  and any(fnmatch.fnmatch(p.lower(), w) for w in warn))
    if hits:
        print("\n-- À RELIRE : %d fichier(s) ressemblant à la couche exclue "
              "(motifs [warn], NON supprimés) --" % len(hits))
        for p in hits[:40]:
            print("     %s" % p)

    print("\n-- suite --")
    if content:
        print("  %d conflit(s) de contenu à arbitrer :" % len(content))
        for p in content:
            print("     %s" % p)
    print("  puis : npm ci (Node 24, cf .nvmrc) && npm test && npm run lint "
          "&& npm run typecheck && npm run build:renderer")
    print("  puis : PR pour merge humain")

    if present or failures:
        return 1
    if content:
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
