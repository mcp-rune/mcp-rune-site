#!/usr/bin/env bash
#
# sync-mcp-rune.sh — bring vendor/mcp-rune in line with upstream HEAD.
#
# Default mode: fetch upstream, fast-forward the submodule pointer, run
# `npm run build` as the verification step, then create a local commit
# bumping the submodule SHA. No push, no PR — that's a human decision.
#
# Check mode (--check): fetch + compare only. Exits 0 if the submodule is
# already at upstream HEAD, 1 if drift is detected. Suitable for pre-commit
# or CI guards.
#
# See scripts/README.md for context.

set -euo pipefail

CHECK_ONLY=0
case "${1:-}" in
  --check) CHECK_ONLY=1 ;;
  "") ;;
  *)
    echo "usage: $0 [--check]" >&2
    exit 2
    ;;
esac

cd "$(git rev-parse --show-toplevel)"
SUBMODULE="vendor/mcp-rune"

git submodule update --init "$SUBMODULE" >/dev/null

git -C "$SUBMODULE" fetch --tags --quiet origin

RECORDED_SHA="$(git ls-tree HEAD "$SUBMODULE" | awk '{print $3}')"
UPSTREAM_SHA="$(git -C "$SUBMODULE" rev-parse origin/HEAD)"

printf '  recorded : %s\n  upstream : %s\n' "$RECORDED_SHA" "$UPSTREAM_SHA"

if [[ "$RECORDED_SHA" == "$UPSTREAM_SHA" ]]; then
  echo "==> Submodule already at upstream HEAD. Nothing to bump."
  exit 0
fi

if [[ "$CHECK_ONLY" == "1" ]]; then
  echo "==> Drift detected (check mode). Run without --check to bump." >&2
  exit 1
fi

if ! git -C "$SUBMODULE" diff --quiet HEAD; then
  echo "ERROR: Local edits inside $SUBMODULE; aborting to avoid clobbering work." >&2
  exit 1
fi

echo "==> Checking out $UPSTREAM_SHA inside $SUBMODULE"
git -C "$SUBMODULE" checkout --quiet --detach "$UPSTREAM_SHA"

echo "==> Verifying with npm run build"
npm run build

VERSION="$(git -C "$SUBMODULE" describe --tags --abbrev=0 2>/dev/null || echo "$UPSTREAM_SHA")"
SHORT_SHA="$(git -C "$SUBMODULE" rev-parse --short "$UPSTREAM_SHA")"

git add "$SUBMODULE"
git commit -m "Bump mcp-rune submodule to $VERSION ($SHORT_SHA)"

echo "==> Local commit created. Review with: git show HEAD"
echo "    Push or open a PR when ready — this script intentionally does neither."
