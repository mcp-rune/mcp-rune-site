# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve the built dist/
```

Node 20+. There is no test suite and no linter wired up — `npm run build` (which runs `astro build` with `@astrojs/check`'s TS typecheck via Astro) is the only verification step.

## Deployment

Kamal + Docker. `config/deploy.yml` builds a multi-stage image (Node 20 builder → nginx:alpine) and pushes to `dsaenztagarro/mcp-rune-site`, served at `https://mcp-rune.dev/` from the `dsaenz-prod` droplet. Run `kamal deploy`; `kamal app logs` tails nginx. The Docker build requires the submodule to be present in the build context (see below) — the build clones with `--recurse-submodules` automatically when Kamal does it on the server, but local Docker builds need the submodule populated first.

## Architecture

### Guide content lives in a sibling repo

The single most important architectural fact: **the guides are not in this repo**. They are sourced from `github.com:mcp-rune/mcp-rune`, pulled in as the git submodule at `vendor/mcp-rune/`, and exposed to Astro via a symlink:

```
src/content/guides → ../../vendor/mcp-rune/docs/guides
```

After cloning, run `git submodule update --init` or the symlink will resolve to nothing and the build will fail. `astro.config.mjs` sets `vite.server.fs.allow: ['..']` specifically so Vite will read through the symlink that points outside the project root.

The guide markdown files have **no frontmatter**. All descriptive metadata (slug, label, status, blurb, reading time, icon, section grouping) lives in `src/data/guides.ts`, which is the single source of truth for routing, the sidebar, breadcrumbs, and prev/next pagination.

### How a guide page is rendered

1. `src/content.config.ts` declares an Astro content collection that globs `*.md` under `src/content/guides/` (no schema — Astro derives the entry `id` from the filename minus `.md`).
2. `src/pages/docs/[slug].astro`'s `getStaticPaths()` walks `FLAT_GUIDES` from `src/data/guides.ts`, filters to `status: 'live' && file`, and emits one route per slug.
3. For each route it calls `getEntry('guides', file.replace(/\.md$/, ''))`, renders the content via Astro's `render()`, and wraps it in the breadcrumb / meta strip / TOC / pager / source-link chrome.

### Adding or promoting a guide

- New guide: drop the `*.md` into `mcp-rune/docs/guides/` (the *framework* repo, not this one), then add a `SECTIONS` entry in `src/data/guides.ts` with `status: 'live'` and `file: '<filename>.md'`. The submodule needs to be updated locally before the build sees the new file — run `npm run sync:mcp-rune` (see [`scripts/README.md`](./scripts/README.md)).
- Promote a `wip` guide: change its status to `'live'` and add the `file:` field.
- A guide can exist in `guides.ts` with `status: 'wip'` or `'soon'` and no `file` — it appears in the sidebar/hub but does not generate a route.

### Page structure

- `src/pages/index.astro` — landing (Hero, Pillars, Architecture, Close)
- `src/pages/docs/index.astro` — docs hub
- `src/pages/docs/[slug].astro` — guide detail
- `src/layouts/BaseLayout.astro` — `<html>` shell + global styles only
- `src/layouts/DocsLayout.astro` — wraps BaseLayout with TopNav + Footer

`@astrojs/react` is installed for React islands, but at the time of writing every component is `.astro`. Per-component styles are scoped inline; design tokens (CSS custom properties) live in `src/styles/global.css`.

### Image pipeline is intentionally disabled

`astro.config.mjs` sets `image.service` to the `noop` service to avoid pulling in `sharp`. If image optimization is ever needed, remove that override.

### Roadmap page is GitHub-driven at build time

`src/pages/roadmap.astro` calls `fetchRoadmap()` (in `src/lib/github-milestones.ts`) during `astro build`. It reads `GITHUB_TOKEN` from the build environment. The token never leaves the build container.

The page hits the GitHub REST API for milestones + issues in `mcp-rune/mcp-rune` and bakes the result into the static HTML. A fine-grained PAT scoped to the single `mcp-rune/mcp-rune` repo with **Issues: Read-only** + **Metadata: Read-only** is sufficient. Missing token, fetch failure, or zero milestones all render the empty-state design — intentional, not a failure mode. Run `npm test` (Vitest) to cover the mapping logic.

In production the token is wired as a Kamal builder secret (`.kamal/secrets` line `GITHUB_TOKEN=$(op read "op://${OP_VAULT}/${OP_ITEM}/GITHUB_TOKEN")`), declared in `config/deploy.yml` under `builder.secrets`, and mounted into the `node:22-alpine` build stage in `Dockerfile` via `--mount=type=secret,id=GITHUB_TOKEN`. The secret never lands on disk in the image — only the rendered static HTML does.

#### What surfaces on the Roadmap

An issue appears on the Roadmap **only if it carries both a `status:*` label and an `area:*` label, and is assigned to a milestone.** Issues missing any of those are filtered out — this is the curation control. The Roadmap intentionally shows a small set of headline work items, not every PR or ticket.

The page renders three sections, in order: open milestones (eyebrow: **UPCOMING**), closed milestones (eyebrow: **NOW SHIPPING**), then the single special `future` milestone (eyebrow: **RESEARCHING**). Within open/closed, milestones sort by `compareVersions` (semver-ish; non-numeric titles fall back to `localeCompare`).

#### Status labels (required, one per issue)

| Label | Pill | Aliases |
|---|---|---|
| `status:shipped` | green "shipped" | — |
| `status:in-progress` | purple "in progress" | `status:progress` |
| `status:planned` | gray "planned" | — |
| `status:researching` | yellow "researching" | `status:research` |
| `status:blocked` | red "blocked" | — |

The mapping lives in `STATUS_ALIASES` at `src/lib/github-milestones.ts:66-74`. Canonical names are recommended; the aliases exist so the site doesn't break if a repo uses the alternate spelling.

#### Area labels (required, one per issue)

`area:<name>` — the suffix becomes the area pill text (lowercased internally; rendered in the UI per the pill component's style). The site has no allowlist; any `area:*` works. The mcp-rune repo's current seed set:

- `area:apps` — MCP apps surface (list-view, model-form, record-detail, formatters, registry)
- `area:core` — core seams (DataLayer, BaseModel, BaseTool, ApiClient)
- `area:tools` — tool framework (BaseTool, CRUD tools, registries)
- `area:prompts` — prompt system (strategies, generators, derivation)
- `area:extensions` — ApiExtension framework (custom-actions, search, future extensions)
- `area:transport` — HTTP server, stdio, session management
- `area:auth` — OAuth2 service, token flows
- `area:docs` — user-facing guides, examples, README

Adding a new area is a label-creation operation on the mcp-rune repo; no site code change required.

#### Milestones are themes, not release versions

GitHub milestones group issues by initiative ("MCP apps overhaul", "Convention-free seams"), not by version number. Title freely. Closed → **NOW SHIPPING**. Open → **UPCOMING**. The exact title `future` (case-insensitive, special-cased at `src/lib/github-milestones.ts:135-136`) → **RESEARCHING** and is always rendered last.

Milestone description format (parsed at `parseDescription`, `github-milestones.ts:118-133`):

- If the **first line** ends with `…` or `...`, that line (ellipsis stripped) becomes the milestone's `name` field — shown as the headline on the card.
- Remaining lines become the `blurb` body.
- A description without an ellipsis renders the entire body as the blurb (no separate name).

Milestone `due_on` (optional) renders as `Q{quarter} {year}` in the target field (`github-milestones.ts:102-108`).

#### Release tags: `shipped-in:<version>`

Theme milestones may span multiple releases. The `shipped-in:0.50.0`, `shipped-in:0.51.0`, … labels record which release an issue actually landed in — independent of which milestone (theme) it belongs to. Apply this label only when the issue closes with merged code; create the label on demand when a new release ships.

#### Local preview

```bash
GITHUB_TOKEN=<your-pat> npm run dev
```

The PAT needs `repo` scope (or, for a fine-grained token, Issues: Read-only + Metadata: Read-only on `mcp-rune/mcp-rune`).

Without the token the Roadmap renders the empty-state design — no warnings or errors. `npm test` exercises the milestone/issue → Roadmap mapping logic in isolation; no network call needed for the test suite.
