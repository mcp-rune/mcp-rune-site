# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1] - 2026-05-28

### Added

- **`GITHUB_TOKEN_MCP_RUNE` namespaced env var** for the Roadmap fetcher. `src/pages/roadmap.astro:16` now reads `import.meta.env.GITHUB_TOKEN_MCP_RUNE ?? import.meta.env.GITHUB_TOKEN`, so the build picks up the namespaced var first and falls back to the unprefixed one. Operators carrying a generic shell `GITHUB_TOKEN` (e.g. the `read:packages`-scoped token used for `npm install` from GitHub Packages) can keep that untouched and set `GITHUB_TOKEN_MCP_RUNE` separately for the Roadmap.
- **Kamal builder secret wiring** so production builds receive the token. `.kamal/secrets` reads `GITHUB_TOKEN_MCP_RUNE` from 1Password at `op://${OP_VAULT}/${OP_ITEM}/GITHUB_TOKEN_MCP_RUNE`; `config/deploy.yml` declares `builder.secrets: [GITHUB_TOKEN_MCP_RUNE]`; `Dockerfile` mounts it via `--mount=type=secret,id=GITHUB_TOKEN_MCP_RUNE` so the value never lands in an image layer or in `docker history`. Local `docker build` without the secret mount tolerates the absence (`|| true`) — Astro falls back to the empty-state Roadmap and the rest of the site builds normally.
- **AGENTS.md updates** documenting the new env var name, the fallback semantics, and the production wiring path (1Password → `.kamal/secrets` → `builder.secrets` → BuildKit mount).

### Fixed

- **Roadmap will actually render on `kamal deploy`** once `GITHUB_TOKEN_MCP_RUNE` is populated in 1Password. v0.4.0's verification surfaced that `mcp-rune/mcp-rune` is private and the previous deploy config wired no token — the Roadmap was rendering the empty-state design in production. This release fixes the wiring; the 1Password entry creation is a manual follow-up gated on this PR.

[0.4.1]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.4.0...v0.4.1

## [0.4.0] - 2026-05-28

### Added

- **`/roadmap` page**, GitHub-driven at build time. `src/pages/roadmap.astro` calls `fetchRoadmap()` (in `src/lib/github-milestones.ts`), which hits `/repos/mcp-rune/mcp-rune/milestones?state=all` and `/repos/mcp-rune/mcp-rune/issues?milestone={n}` for each milestone, then bakes the result into static HTML. Three sections render in order: open milestones (eyebrow **UPCOMING**), closed milestones (**NOW SHIPPING**), and the single special `future` milestone (**RESEARCHING**). Within open/closed, sorting is semver-ish on milestone titles with `localeCompare` fallback for non-numeric (theme) titles.
- **10 Roadmap components** under `src/components/roadmap/`: `RoadmapHero`, `RoadmapMilestone`, `RoadmapFuture`, `RoadmapStatusPill`, `RoadmapLegend`, `RoadmapSkeleton`, `RoadmapAnnotatedExample`, `RoadmapSuggestedStarters`, `RoadmapSyncCard`, `RoadmapInfluenceClose`. Each is `.astro` with scoped styles, translating the Claude Design handoff bundle's Roadmap page into Astro.
- **GitHub fetcher + mapper** at `src/lib/github-milestones.ts`. Filters surface only issues carrying **both** a `status:*` and an `area:*` label — this is the curation control. Accepts `status:progress` / `status:research` as aliases for `status:in-progress` / `status:researching`. Parses milestone descriptions where a first line ending in `…` / `...` becomes the `name` field (ellipsis stripped) and remaining lines become the `blurb`. The token never reaches the browser; missing token, fetch failure, or zero milestones all render the empty-state design — intentional, not a failure mode.
- **20 Vitest cases** at `src/lib/github-milestones.test.ts` covering label extraction, status alias normalization, semver-ish sort with `localeCompare` fallback, `future` title special-casing, description parsing with/without ellipsis, accent rule (lowest-open or highest-closed), and the 401/404/network-error empty-state fallback.
- **Vitest test runner**: `vitest@^2.1.8` as devDependency, `vitest.config.ts` (default `node` environment — the mapper is DOM-free), `"test": "vitest run"` script.
- **`AGENTS.md` Roadmap section** expanded from a single paragraph to a full reference: the `status:*` + `area:*` requirement that gates surfacing, the canonical status set with the two aliases, the area seed set used on mcp-rune (`apps`, `core`, `tools`, `prompts`, `extensions`, `transport`, `auth`, `docs`), the "milestones are themes, not versions" convention, the description ellipsis name/blurb split, the `shipped-in:<version>` per-issue release tag, and the local-preview workflow.

### Changed

- **Nav and footer wiring.** `TopNav.astro` swaps the placeholder `Changelog` link for `Roadmap` → `/roadmap`; the `active` prop's `'log'` key becomes `'roadmap'`. `landing/Close.astro` footer switches from `<a href="#">` placeholders to real hrefs: `Docs` → `/docs`, `GitHub` → `https://github.com/mcp-rune/mcp-rune`, `Roadmap` → `/roadmap` (CLI / API / Adopters stay placeholder until those pages exist).
- **`AGENTS.md`** is now committed (previously only present locally as `27e13a3`). Includes the framework build/architecture notes plus the expanded Roadmap reference described above.

[0.4.0]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.3.1...v0.4.0

## [0.3.1] - 2026-05-27

### Added

- Brand asset kit under `public/brand/` from the Claude Design handoff bundle (design hash `P4-DzsmqTyyF0f3_BX7a8g`, source `mcp-kit/project/brand/`) — 10 SVGs at ≈ 20 KB total: `mark.svg`, `favicon.svg`, `logo-horizontal.svg`, `logo-horizontal-clean.svg`, `logo-stacked.svg`, `github-avatar.svg`, `discord-avatar.svg`, `og-card.svg`, `readme-banner.svg`, `hero-illustration.svg`. Canonical URLs (`/brand/*.svg`) are now stable for external consumers (GitHub README, Discord/Slack workspace icons, social unfurls).

### Changed

- Nav and footer brand chip now renders the geometric `brand/mark.svg` (a runic-r chip with a triangular notch in place of the typical serif curl) instead of a text "r" inside a gradient `<span>`. The chip carries its own gradient, rounded-rect, inner border, and notch — the previous CSS-only chip was the "original chip" the new mark refines.
- `public/favicon.svg` replaced with the design's chunkier-stroked variant tuned for 16/32 px tab-bar legibility (same canonical path, `BaseLayout.astro` unchanged).
- `Logo.astro` simplified to `<img src="/brand/mark.svg">`; the `size` prop API is preserved so existing call sites in `TopNav.astro` (size 24) and `Footer.astro` (size 22) pick the new mark up automatically.
- `.brand-mark` rule in `global.css` reduced from a full gradient/text composition to sizing + a silhouette-shaped `drop-shadow` glow — the gradient, rounded rect, inner border, and runic notch are now carried by the SVG itself.

[0.3.1]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.3.0...v0.3.1

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
