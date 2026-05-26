# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-05-27

### Added

- Mobile-responsive Landing (`/`) and Docs hub (`/docs`). The site was previously desktop-only — zero `@media` queries existed in the codebase, fixed-width grids and a 256px sticky docs sidebar guaranteed horizontal scroll below ~1200px. This release closes that gap, translating the 390px design specs from the Claude Design handoff bundle into responsive CSS without touching desktop content.
- Mobile top nav with off-canvas drawer (`TopNav.astro`): at ≤768px the desktop links, search field, and action buttons collapse into a 36×36 search icon button plus a 36×36 hamburger that opens a drawer carrying the five nav links plus GitHub and Get-started CTAs full-width. Drawer toggle is a small Astro `<script>` that manages `aria-expanded` and auto-closes on link click or on resize past 768px.
- Breakpoint tokens `--bp-md: 768px` and `--bp-lg: 1024px` declared on `:root` in `global.css` for documentation (CSS variables can't be used inside `@media` conditions; the actual breakpoints are hard-coded at 768 and 1024 per-component).
- Global mobile padding rules: `.pr-wrap` and `.docs-wrap` drop from 32px to 16px horizontal padding at ≤768px; `img/svg { max-width: 100% }` safety added to prevent overflow.

### Changed

- Landing components stack at ≤768px:
  - `Hero.astro`: headline 84px → 44px, two-column showcase → single column, install + primary CTA stack full-width at 42px height, founding-adopter callout splits into stacked chip/seats/side panels with horizontal dividers becoming vertical, derived-row grid collapses to 3 columns (kind/name/arr) hiding the sub-copy.
  - `Pillars.astro`: alternating left/right rows force illustration-above-text on every row; intro grid stacks; the CRUD, prompt, analysis, domain (workflow + domain-grid), and OAuth dense inner grids all collapse to single column; the workflow arrow rotates 90° between vertical steps; embedded form fields go 1-column (`.field.span2` loses its span).
  - `Architecture.astro`: title 52px → 34px, padding 96px → 56px, layer tag shrinks to 48px with `.layer-body` stacking title above sub.
  - `Close.astro`: title 72px → 40px, CTAs stack full-width centered, foot column stacks brand above link list with wrapping links.
- Docs hub responsive layout:
  - `DocsSidebar.astro` is hidden at ≤1024px — cross-section traversal is handled by the topnav hamburger drawer and the in-page section headings.
  - `pages/docs/index.astro`: `.hub-wrap` gap drops from 48px to 24px at ≤1024px and padding to 16px at ≤768px.
  - `DocsHero.astro`: title 88px → 38px, headline + copy stack vertically, stats grid drops to 2-column at ≤768px and 1-column at ≤480px with row dividers instead of column dividers.
  - `FeaturedTrio.astro`: 3-column card grid stacks to 1.
  - `SectionBlock.astro`: section head stacks number/title/count vertically, dividing bar hidden.
  - `GuideRow.astro`: the 7-column desktop grid is redefined into a 3-column grid-area layout (icon/label/blurb/meta/arr) with the section ordinal and tag list hidden — meta switches from vertical-right to inline-row.
  - `ContributionCallout.astro`: layout stacks with full-width buttons.
  - `Footer.astro`: each link column wraps in `<details class="footer-col">` so the four columns collapse natively at ≤768px (with a rotating chevron). Desktop CSS forces them to read as plain expanded columns (`pointer-events: none` on summary, hidden chevron, forced list display) so the existing desktop look is unchanged.

[0.3.0]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.2.0...v0.3.0

### Added

- Kamal deployment to the `dsaenz-prod` droplet under https://mcp-rune.dev, sharing the kamal-proxy + Let's Encrypt setup used by the rest of the dsaenz ecosystem (`engineer.dsaenz.dev`, `identity.dsaenz.dev`, `dsaenz.dev`).
- Multi-stage `Dockerfile` (node:20-alpine build stage → nginx:alpine runtime); `nginx.conf` with `try_files` for Astro's pretty URLs, `/up` healthcheck for kamal-proxy, and immutable caching for `/_astro/`.
- `vendor/mcp-rune` git submodule (github.com:mcp-rune/mcp-rune) — replaces the host-only absolute symlink that the docs collection used to read from `../mcp-rune/docs/guides`. `src/content/guides` is now a relative symlink into the submodule, so it resolves identically in dev and inside the Docker build context.
- `config/deploy.yml` and `.kamal/secrets` (1Password reference for the shared Docker Hub token). No pre-build hook needed: the multi-stage image builds `dist/` itself, and kamal's `git clone --recurse-submodules` populates the guides automatically.

## [0.1.1] - 2026-05-26

### Changed

- Lifted surface and line contrast tokens (`--bg-2/3`, `--surface`, `--surface-2`, `--line/-2/-3`) so table dividers, code-block frames, and inline-code chips read as real edges instead of dissolving into the page.
- Rebuilt the Six Pillars illustrations on the landing page to match the design bundle:
  - CRUD: SVG converging dashed lines from a 10-model grid into the polymorphic-tools hub.
  - Prompt Strategies: added the `validateSection` section-progress panel with ok/warn/todo marks and per-strategy op chips.
  - Interactive MCP Apps: replaced the stub form with the full Claude-desktop chat (user bubble, gradient `k` avatar, assistant text, embedded `Create book` form with Save/Cancel, "rendered by ui://book/create" footnote).
  - Analysis Memories: added the `analysis_ingest` progress card (12,847 records, gradient bar) and the cross-boundary note; right column gained the `analysis_query` cluster bars with TTL/shown legend.
  - Domain Intelligence: wrapped the workflow in a labelled card, added the `check_business_rules` panel (one failing rule highlighted) and the `get_domain_context` knowledge card with "#billing/#identity/#workspaces" tags.
  - OAuth 2.1 + PKCE: added the per-step note, the `introspect` badge with `RFC 7662 · 8707` tag, and the full RFC ribbon (CIMD draft, OIDC Core 1.0 included).

[0.2.0]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.1.0...v0.1.1
