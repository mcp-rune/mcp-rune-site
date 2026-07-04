# mcp-rune-site

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.x-blue)](https://github.com/modelcontextprotocol/typescript-sdk)

User-facing website for the [mcp-rune](../mcp-rune) framework.

Built with **Astro 5** (static output) + React islands. Markdown guides are
sourced from the framework repo via a symlink so there is exactly one copy of
each guide on disk.

## Develop

```bash
git submodule update --init   # fetch the guides source (vendor/mcp-rune)
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve the built dist/
```

Requires Node **22.12+** (`package.json` `engines`). See [Configuration](#configuration) for every variable the site reads.

## Configuration

Every variable the site needs to build and run properly. Nearly all of it is committed constants in **`src/lib/site.ts`** — the single source of truth, imported everywhere (never hardcode these in a page or component). Only `GITHUB_TOKEN` comes from the environment; the submodule and Node version are toolchain requirements.

| Variable | Defined in | Purpose | Required? |
|----------|-----------|---------|-----------|
| `GITHUB_TOKEN` | environment (build-time) | Fine-grained PAT read by `src/pages/roadmap.astro` (`import.meta.env.GITHUB_TOKEN`) to fetch milestones + issues from `mcp-rune/mcp-rune` for the **/roadmap** page. | Optional — without it, `/roadmap` renders its empty state and the build still succeeds. |
| `UMAMI_WEBSITE_ID` | `src/lib/site.ts` | Umami website UUID (from the Umami dashboard) for cookieless **web analytics**. | Optional |
| `UMAMI_SRC` | `src/lib/site.ts` | URL of the self-hosted Umami tracker script (`https://analytics.dsaenz.dev/script.js`). | Optional (pair with `UMAMI_WEBSITE_ID`) |
| `SITE_URL` | `src/lib/site.ts` | Canonical site origin (`https://mcp-rune.dev`), imported by `astro.config.mjs` (`site:`) for absolute URLs. | Required — change when deploying elsewhere. |
| `RUNE_REPO` | `src/lib/site.ts` | Framework repo `owner/repo` (`mcp-rune/mcp-rune`); every GitHub source / issue / discussion / milestone link derives from it. | Required |
| `RUNE_REPO_BRANCH` | `src/lib/site.ts` | Branch the guide **source / tree / edit** links resolve against (`master`). Must match the framework repo's actual default branch — a wrong value 404s every source link. | Required |
| `vendor/mcp-rune` submodule | git submodule | Source of every guide markdown, symlinked into `src/content/guides`. | **Required** — `git submodule update --init`, or the build fails on the dangling symlink. |
| Node | `package.json` `engines` | Build/runtime Node version: `>=22.12.0`. | **Required** |

Notes:

- **`GITHUB_TOKEN`** needs only **Issues: Read-only** + **Metadata: Read-only** scoped to `mcp-rune/mcp-rune`. It is read at build time and baked into the static HTML — it never reaches the client. In production it is injected as a Kamal build secret (`config/deploy.yml` → `.kamal/secrets`); see [AGENTS.md](./AGENTS.md).
- **Web analytics** (`UMAMI_*`) render only when `import.meta.env.PROD` is true, so `astro dev` never sends events. Point them at your own Umami instance if you fork the site.
- **`src/lib/site.ts` holds every committed config value**: site origin (`SITE_URL`), GitHub repo + branch (`RUNE_REPO`, `RUNE_REPO_BRANCH`), RFCs/CLI repos, npm package (`NPM_PACKAGE`), web analytics (`UMAMI_*`), Discord/email, and star thresholds. Every page and component imports from it, and the derived source/tree/edit/issue/milestone URLs all recompute from those roots — so a fork or rebrand is a one-file edit. `RUNE_REPO_BRANCH` is the one most likely to bite if wrong (a stale value 404s every guide source link).
- **Version labels** (`src/data/version.ts`) are *derived* from `package.json` (site) and `vendor/mcp-rune/package.json` (framework) — no manual configuration.

## Layout

```
src/
  pages/
    index.astro           landing page
    docs/[slug].astro     guide detail page (one per live guide)
  layouts/
    BaseLayout.astro      <html> + global styles
    DocsLayout.astro      top nav + main + footer
  components/
    Logo.astro
    TopNav.astro
    Footer.astro
    DocsSidebar.astro     left rail with all 15 guides grouped into 7 sections
    docs/
      DocsBadge.astro     live / wip / soon pill
      Toc.astro           on-this-page list + source link
    landing/
      Hero.astro          headline · install snippet · showcase · founding callout
      Pillars.astro       six pillar rows with illustrations
      Architecture.astro  five-layer stack
      Close.astro         final CTA + footer-adjacent links
  data/
    guides.ts             single source of truth for routing, sidebar, pager
  content/
    guides/               symlink → ../../mcp-rune/docs/guides
  content.config.ts       Astro content collection (markdown loader)
  styles/global.css       design tokens + .docs-prose
```

## How guide pages are rendered

1. `src/content/guides/` is a symlink to `/Users/dsaenz/Code/mcp-rune/docs/guides`.
2. `content.config.ts` declares an Astro content collection that globs every `*.md` there.
3. `src/data/guides.ts` maps each route slug (e.g. `mcp-apps`) to its filename
   (`mcp-apps-guide.md`), its section, label, blurb, reading time, and status.
4. `src/pages/docs/[slug].astro` calls `getStaticPaths()` against the live guides
   in that data file. For each slug it loads the matching content entry, renders
   the markdown via `render()`, then wraps it in the breadcrumb / TOC / pager chrome.

To add a new guide:

1. Drop `your-new-guide.md` into `mcp-rune/docs/guides/`.
2. Add an entry to `SECTIONS` in `src/data/guides.ts` with `status: 'live'` and
   `file: 'your-new-guide.md'`.
3. `npm run build` — the new slug is automatically generated.

To promote a `wip` guide: change its status to `'live'` and add the `file:` field.

## Design source

The pristine dark theme is ported from the design bundle the user generated in
Claude Design. Reference assets and JSX prototypes are not checked into this
repo; the design system is reflected in `src/styles/global.css` (CSS variables)
and in the per-component styles.
