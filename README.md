# mcp-rune-site

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.x-blue)](https://github.com/modelcontextprotocol/typescript-sdk)

User-facing website for the [mcp-rune](../mcp-rune) framework.

Built with **Astro 5** (static output) + React islands. Markdown guides are
sourced from the framework repo via a symlink so there is exactly one copy of
each guide on disk.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve the built dist/
```

Requires Node 20+.

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
