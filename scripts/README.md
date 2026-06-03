# scripts/

Committed tooling that wraps repeatable repo procedures behind named
entrypoints, so contributors don't have to remember invocations.

## `sync-mcp-rune.sh`

Bumps the `vendor/mcp-rune` submodule to upstream `origin/HEAD`, verifies the
site still builds, and creates a local commit recording the new SHA.

### When to run

- After upstream `mcp-rune/mcp-rune` ships changes you want surfaced on the
  site (new guides, edits to existing guides, framework version bumps).
- Before tagging a release of this site.

### Invariant

`vendor/mcp-rune` always points at upstream `origin/HEAD`. There are no
in-repo edits to the submodule contents — guide source-of-truth lives in the
sibling repo.

### Usage

```bash
npm run sync:mcp-rune          # fetch, bump, build, commit locally
npm run sync:mcp-rune:check    # fetch + compare only; exits 1 on drift
```

The bump commit is **local only** — the script never pushes and never opens a
PR. Review with `git show HEAD`, then push direct to `master` or open a PR
per the project's normal flow (most vendor bumps have shipped via PR:
`#19`, `#23`, `#26`, …).

### Behavior

| Situation | Result |
|---|---|
| Submodule already at upstream HEAD | Prints "Nothing to bump.", exits 0. |
| Upstream has moved | Checks out new SHA, runs `npm run build`, commits locally. |
| Local edits exist inside the submodule | Errors out; nothing is touched. |
| `npm run build` fails on the new SHA | Build error surfaces; no commit is created (`set -e`). |
| `--check` + drift | Exits 1 without mutating the working tree. |

### Why a script and not a one-liner

Per the team's "canonical tooling over throwaway scripts" preference, anything
that operates on the whole submodule and will run repeatedly as upstream
evolves belongs in committed tooling with a documented entrypoint — not a
shell snippet copied between sessions.
