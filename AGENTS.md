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

- New guide: drop the `*.md` into `mcp-rune/docs/guides/` (the *framework* repo, not this one), then add a `SECTIONS` entry in `src/data/guides.ts` with `status: 'live'` and `file: '<filename>.md'`. The submodule needs to be updated locally before the build sees the new file.
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
