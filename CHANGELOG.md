# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.11.2] - 2026-06-10

> Surfaces the upstream docs reorganization (mcp-rune#305) in the docs hub sidebar/pager: the API family is consolidated in chapter VI, chapter II opens with its derivation primer, and chapter IX opens with its hands-on quickstart. Routing-only change on the site side; all the content moves live in the vendored `mcp-rune` submodule.

### Changed

- **`src/data/guides.ts`** — three placement moves so the sidebar and pager match the rewritten docs:
  - **`api-config` removed from chapter I, added to chapter VI as `api-configuration`** (slug renamed). The static `api` block is consumed by `ModelService`, `ApiClient`, and `ApiConvention` — chapter VI's three other guides — so it now sits with them as the chapter's third entry. The slug rename keeps the sidebar's "API ..." family (`API client`, `API configuration`, `API convention`) sorted together.
  - **`derivation-overview` promoted to lead chapter II** (was the closing entry). Now opens the chapter as a primer, with the five deep-dive guides following.
  - **`analysis-quickstart` promoted to lead chapter IX** (was the fifth entry). It is Quickstart Part 2 and the chapter's only hands-on tutorial.
- **`vendor/mcp-rune`** — bumped submodule to track the upstream PR (`mcp-rune/mcp-rune` PR #305, commit `051d8a0`). Final pointer will rebase onto the v0.102.6 tag once that PR merges; the feature-branch bump shipping with this PR is purely so site CI can build against the renamed `api-configuration.md` file.

[0.11.2]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.11.1...v0.11.2

## [0.11.1] - 2026-06-10

> Fixes the three CTAs at the bottom of `/cli` so they each point at the right target, and pulls in the rewritten Quickstart and the new Flags & prompts reference from upstream.

### Added

- **`RUNE_CLI_REPO` and `RUNE_CLI_REPO_URL` constants in `src/lib/site.ts`** — mirroring the existing `RUNE_REPO` / `RUNE_REPO_URL` centralization pattern so the scaffolder repo is identified once and consumed everywhere. The scaffolder lives in its own repo (`mcp-rune/mcp-rune-cli`); reusing `RUNE_REPO_URL` (the framework repo) for CLI-targeted links was the root cause of the broken "CLI source on GitHub" CTA.

### Fixed

- **`src/components/cli/CliCtaBand.astro` · "CLI source on GitHub"** — now points at `https://github.com/mcp-rune/mcp-rune-cli` (the scaffolder) instead of `https://github.com/mcp-rune/mcp-rune` (the framework). The CTA had silently shipped against the wrong repo since the band was introduced in v0.10.0.
- **`src/components/cli/CliCtaBand.astro` · "All flags & prompts"** — now deep-links to `https://github.com/mcp-rune/mcp-rune-cli#flags--prompts` (a new exhaustive prompt+flag matrix added in `mcp-rune-cli` v0.10.2) instead of the generic on-site `/docs` index. Opens in a new tab with `noopener noreferrer`; arrow glyph changed from `→` to `↗` to match the other external-link CTA.

### Changed

- **`vendor/mcp-rune`** — bumped submodule to **v0.102.4**: rewritten Quickstart (`docs/guides/01-getting-started/quickstart.md`) now leads with the `rune` CLI — `npm install -g @mcp-rune/create` → `rune new my-server --preset simple --models Note` → `rune inspect` — instead of the bookshelf-via-`npx @mcp-rune/create` flow that never mentioned the `rune` command. The bookshelf demo survives as a one-paragraph "Want a fuller demo?" pointer.

[0.11.1]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.11.0...v0.11.1

## [0.11.0] - 2026-06-09

> Upgrades the framework dependency to v0.102.0 (DomainAdapter + InMemoryDomainAdapter + DomainModule), registers the new domain-adapters guide, and cleans up dead navigation links across the site.

### Added

- **`src/data/guides.ts`** — new `domain-adapters` guide (Section VIII) covering `DomainAdapter`, `InMemoryDomainAdapter`, rule evaluation semantics, and the remote-adapter roadmap introduced in framework v0.102.0.

### Changed

- **`src/data/guides.ts`** — updated `domain-knowledge` blurb to reflect the new `DomainModule`/`InMemoryDomainAdapter` wiring pattern that replaced flat arrays.
- **`vendor/mcp-rune`** — bumped submodule to v0.102.0: `DomainAdapter` + `InMemoryDomainAdapter` + `DomainModule` + `domain-definitions.ts`; updated example vocabulary from media-rights to bookshelf/tasks across all guides.

### Fixed

- **`src/components/TopNav.astro`** — removed dead "Reference" and "Adopters" nav links (both `href="#"`); nav is now Docs / CLI / Roadmap.
- **`src/components/Footer.astro`** — wired all footer links that have real destinations (Framework guide pages, `/cli`, GitHub, Discussions); removed entries with no corresponding page (Generators, Inspector, Types, Architecture, Adopter charter, RFCs).

## [0.10.0] - 2026-06-09

> Redesigns the CLI page from a 6-section feature reference into a 4-section identity-first landing page. The redesign follows the same "identity, not inventory" principle as the Landing v2 redesign: each section describes what the CLI *is*, not what it enumerates. Also adds the mcp-rune brand lockup to the landing hero.

### Added

- **`src/components/cli/CliSellingPoints.astro`** — new 4-card identity band: *One verb · Two presets · Ready to run · Local-link mode*. Each card is a claim about the CLI's character with no version-coupled facts (no flag enumerations, no package counts, no millisecond stats). Replaces CliPresets + CliPrompts + CliLocalLink as the second section.
- **`src/components/cli/CliCtaBand.astro`** — new CTA band replacing CliNextSteps. Three actions: "Read the Quickstart →" (`/docs/quickstart`), "All flags & prompts →" (`/docs`), "CLI source on GitHub ↗". No npm script table, no WIP badges.
- **`src/components/landing/Hero.astro`** — 88 px mcp-rune brand lockup added above the announce pill for name recognition on first paint; scales to 56 px on mobile (≤768 px).

### Changed

- **`src/components/cli/CliHero.astro`** — tightened to headline + tagline + lede + signature line + terminal demo. Removed: 4-stat strip (1 verb / 2 presets / 4 prompts / 560 ms — drift-prone), 4 signature chips (reference-manual chrome), pill sub-label "one verb · two presets · four prompts". Pill now reads `CLI · @mcp-rune/create`. Lede rewritten: "rune new is the entire CLI. Pick a preset, answer the prompts or skip them with --yes, and walk away with a project that boots on the first try."
- **`src/components/cli/CliPresets.astro`** — rewritten as intent-driven narrative compare. "Simple is for trying it now; advanced is for a server you intend to keep." Two terminals kept; all spec content (package counts, audit counts, scaffold ms, file-tree callouts, WHAT YOU GET tag rows) removed. Footer line: "Advanced asks a few questions; --yes skips them all and takes the defaults."
- **`src/pages/cli.astro`** — section order now Hero → SellingPoints → Presets → CtaBand (4 sections, down from 6).

### Removed

- **`src/components/cli/CliPrompts.astro`** — 4-prompt gallery. The dedicated section was the most drift-prone part of the page (every prompt renamed/added required a card update). The idea survives as the footer note in CliPresets ("Advanced asks a few questions; --yes skips them").
- **`src/components/cli/CliOnDisk.astro`** — file tree + stats section. Directory tree, file/dir counts, and "bytes on disk" stats are all version-coupled. Nothing here belongs on a landing page.
- **`src/components/cli/CliLocalLink.astro`** — before/after package.json diff section. Local-link mode survives as one selling-point card in CliSellingPoints; the before/after JSON is documentation that belongs in `/docs/cli`.
- **`src/components/cli/CliNextSteps.astro`** — npm script table. Duplicates content the user sees in their generated `package.json`; the WIP badge on `npm run inspect` required manual upkeep.
- **`src/components/cli/CliSectionHeader.astro`** — section header component used only by the deleted sections.

[0.11.0]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.9.1...v0.10.0

## [0.9.1] - 2026-06-08

> Brings the live docs in sync with framework `v0.101.0`. Bumps the `vendor/mcp-rune` submodule from `v0.73.9` to `v0.101.0` (the docs restructure around the Model + the three peer layers — see [`mcp-rune` v0.101.0 release notes](https://github.com/mcp-rune/mcp-rune/releases/tag/v0.101.0)), rebuilds `src/data/guides.ts` to mirror the new chapter structure, and audits per-guide extension annotations against the new chapters.

### Changed

- **`vendor/mcp-rune`** submodule bumped from `617e0b2` (v0.73.9) to `e7788ad` (v0.101.0). This makes every new chapter under `src/content/guides/` resolve — `02-the-model/{defining-a-model,attributes-and-kinds,associations,validation-and-defaults,definition-vs-consumption,derivation-overview}.md`, `04-tools/{the-three-layers,polymorphic-tools}.md`, `06-the-three-layers-up-close/{model-service,model-layer,analysis-layer,search-request-shaper}.md`, etc.
- **`src/data/guides.ts`** rebuilt to 11 sections × 46 guides, matching the new framework structure (Foundations → The Three Layers Up Close → Intelligence → Extending → Reference). Section numbering shifted: section II is now **The Model** (new), section IV is **Tools** (was Tools & Services), section VI is **The Three Layers Up Close** (was Adapters), section X is **Extensions**.
- **`src/components/Footer.astro`** Framework column: `'Prompt DSL'` → `'Prompts'` to match section II's new label in the framework docs.

### Added

- Two extension annotations added during the audit:
  - `attributes-and-kinds` → `{ kind: 'plugin', what: 'Register custom kinds via AppRegistry({ kinds })' }`. The new chapter explicitly walks through `'string:isbn'` and the `AppRegistry({ kinds: … })` extension path.
  - `authoring-extensions` → `{ kind: 'plugin', what: 'Walk through writing an extension end to end' }`. Symmetry with the other "Author X extensions" entries in section X.

[0.9.1]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.9.0...v0.9.1

## [0.9.0] - 2026-06-08

> Restructures the landing page along the Landing v2 design's narrative arc. The hero is now outcome-first ("Turn your data model into a complete MCP server."), the book-model showcase is its own section, and two new bands — a problem statement with a before/after comparison and a For Teams / API Owners triptych — are inserted into the flow. Two existing sections get small copy tweaks; Architecture and Close are unchanged.

### Added

- **`src/components/landing/Pain.astro`** — new section between Hero and Showcase. "THE PROBLEM" eyebrow, blockquote ("Most MCP frameworks scale tool count with model count — 10 models × 5 verbs = 50 handlers…"), and a five-row before/after comparison table contrasting hand-wired wiring against schema-derived output.
- **`src/components/landing/Showcase.astro`** — extracts the source-model → derived-surfaces book example out of the hero into a standalone section under "ONE SPEC → SIX SURFACES / Declare once. Derive everything." Same chrome, code panel, and six-row derived list as before, now with its own intro pair.
- **`src/components/landing/ForTeams.astro`** — new section between Apps and Architecture. "FOR TEAMS & API OWNERS" eyebrow, "Your product already has a data model. Make it AI-accessible." headline, and three use-case cards (SaaS with an API · Internal tools · Data platforms).

### Changed

- **`src/components/landing/Hero.astro`** — rewritten as the v2 outcome-first hero. Headline → "Turn your data model into a complete MCP server." with the second clause in the white→purple gradient. Subhead leads with the pain ("Every MCP integration starts the same way…") before pivoting to the resolution. The logo lockup, book-model showcase, and founding-adopter callout are removed (branding lives in `TopNav`; the showcase is its own section now; the founding callout will return on a dedicated band). Meta strip gains a "Ship by lunch" accent.
- **`src/components/landing/Pillars.astro`** — pillar 01 title changed from *"Eight tools serve every model in your domain."* to *"A fixed tool set serves every model in your domain."* (matches the framing the comparison table introduces upstream).
- **`src/components/landing/Retrieval.astro`** — section eyebrow changed from `RETRIEVAL · GRAPHRAG` to `RETRIEVAL · SEMANTIC GRAPH`.
- **`src/pages/index.astro`** — section order is now Hero → Pain → Showcase → Pillars → Retrieval → Apps → ForTeams → Architecture → Close. Page `<title>` updated to "mcp-rune — turn your data model into a complete MCP server".

[0.9.0]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.8.5...v0.9.0

## [0.8.5] - 2026-06-08

### Added

- `LICENSE` — MIT license file (copyright David Sáenz Tagarro).

### Changed

- `README.md` — badge row added under the title: MIT licence shield, MCP SDK version.

[0.8.5]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.8.4...v0.8.5

## [0.8.4] - 2026-06-06

> Consolidates every per-guide metadata decision in `src/data/guides.ts`. The docs hub previously read `extension:` / `series:` from YAML frontmatter on each markdown file in `vendor/mcp-rune` and reconciled them back through a hand-maintained slug-translation table in `src/data/extensions.ts`. The legend went silent (*"0 of 28 guides expose one"*) when mcp-rune reorganised guides into numbered subdirectories and the table fell out of sync. The right shape is a single source of truth on the site side: the framework repo no longer carries site-presentation classification at all, and the site registry now declares which guides expose an extension point, what kind, and which form a multi-part series. Also bumps `vendor/mcp-rune` from v0.73.2 to v0.73.9 (carries the upstream frontmatter strip plus six unrelated package updates), refreshes the four landing-page app screenshots, and adjusts the matching `<img height>` to fit.

### Added

- **`Guide.extension?: ExtensionPoint` and `Guide.series?: SeriesInfo` fields in `src/data/guides.ts`** — populated on the 20 guides that document a configurable seam and on the two Quickstart parts. The `ExtensionKind`, `ExtensionPoint`, and `SeriesInfo` types now live here too; `src/data/extensions.ts` re-exports them for backwards-compatible imports.

### Changed

- **`src/data/extensions.ts`** — `loadExtensions` and `loadSeries` now derive their maps from `FLAT_GUIDES` synchronously (still wrapped in `async` so the four callers don't need to change). No `getCollection('guides')` call, no `ENTRY_ID_TO_SLUG` lookup table, no drift-check assertion — all gone.
- **`src/content.config.ts`** — the guides content collection schema is now `z.object({})`. The collection still loads every markdown so `[slug].astro` can render its body; no fields are validated because there's no frontmatter to validate.
- **`src/pages/docs/[slug].astro`** — `getEntry('guides', entryId)` is keyed by `guide.file!.replace(/\.md$/, '')` again (path-based). With no frontmatter `slug:` overriding the entry id, the glob loader's filename-derived default is what we want.
- **`vendor/mcp-rune`** — bumped from `0f3b243` (v0.73.2) to `617e0b2` (v0.73.9). Brings in `mcp-rune#217` (strip site-decoration frontmatter from docs/guides) plus v0.73.3–v0.73.8 type/export polish, OAuth/pgvector cleanup, and README/LICENSE updates. `MCP_RUNE_VERSION_LABEL` auto-tracks via `vendor/mcp-rune/package.json`.
- **`public/screenshots/01-app.png` through `04-app.png`** — refreshed app screenshots (higher-resolution captures).
- **`src/components/landing/Apps.astro`** — `<img height="378">` → `<img height="316">` to match the new screenshot aspect ratio.

### Notes

- The framework-side companion PR ([`mcp-rune#217`](https://github.com/mcp-rune/mcp-rune/pull/217)) stripped the `extension:` / `series:` frontmatter from 22 guide markdown files. Any third-party renderer that consumed those fields from upstream now needs to source the classification itself.
- The drift mode that originally hid the badges (mismatched entry-id lookups) is now structurally impossible — there's only one place that declares which guides are extensible.

[0.8.4]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.8.3...v0.8.4

## [0.8.3] - 2026-06-05

> Collapses the dual-token Roadmap fetcher (`GITHUB_TOKEN_MCP_RUNE` preferred, `GITHUB_TOKEN` fallback) down to a single `GITHUB_TOKEN`. The namespaced variant existed so a generic shell `GITHUB_TOKEN` (e.g. a `read:packages`-scoped PAT for npm install against GitHub Packages) wouldn't collide with the Roadmap's `Issues:Read` PAT — but in practice the production 1Password item was already keyed `GITHUB_TOKEN`, and carrying the alias through `src/pages/roadmap.astro`, `.kamal/secrets`, `config/deploy.yml`, `Dockerfile`, and `AGENTS.md` was busywork on every rotation. The 1Password entry has been renamed to `GITHUB_TOKEN`; the codebase now reads the unprefixed name everywhere.

### Changed

- **`src/pages/roadmap.astro`** — frontmatter now reads `import.meta.env.GITHUB_TOKEN` directly; the `GITHUB_TOKEN_MCP_RUNE ?? GITHUB_TOKEN` coalesce and its explanatory comment are gone.
- **`.kamal/secrets`** — the line populated from 1Password is now `GITHUB_TOKEN=$(op read "op://${OP_VAULT}/${OP_ITEM}/GITHUB_TOKEN")`. The 1Password key was already `GITHUB_TOKEN`; only the local secret-binding name changed.
- **`config/deploy.yml`** — `builder.secrets` lists `GITHUB_TOKEN` instead of `GITHUB_TOKEN_MCP_RUNE`.
- **`Dockerfile`** — BuildKit secret id, the `cat /run/secrets/...` source path, and the env var exported into `npm run build` all renamed to `GITHUB_TOKEN`; the surrounding comment is updated to match.
- **`AGENTS.md`** — the Roadmap section, Kamal wiring paragraph, and local-preview snippet drop the dual-var explanation and document a single `GITHUB_TOKEN=<pat> npm run dev`.

### Notes

- Operators with a pre-existing shell `GITHUB_TOKEN` for an unrelated purpose (npm install against GitHub Packages, `gh` CLI) now need to override it for `npm run dev` if that token lacks `Issues:Read` on `mcp-rune/mcp-rune`: `GITHUB_TOKEN=$(op read "op://CLI/Production/GITHUB_TOKEN") npm run dev`. Missing or wrong-scope tokens still soft-fall back to the empty-state Roadmap, same as before — nothing breaks loudly.
- Historical CHANGELOG entries (v0.4.1) that introduced the `GITHUB_TOKEN_MCP_RUNE` alias are intentionally left untouched as an audit trail of when the alias existed.

[0.8.3]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.8.2...v0.8.3

## [0.8.2] - 2026-06-04

> Submodule-only. Bumps `vendor/mcp-rune` to v0.72.0, which lands the full illustration gallery: 29 newly-ported authoring modules, 76 new SVG artifacts, and 56 `<!-- illustration: id -->` markers across 38 guides. No site code changes — the remark plugin from v0.8.0 + the CSS slim-down from v0.8.1 are sufficient to render the new gallery. Fresh `npm run build` confirms 30 guide pages now inline at least one SVG (model-form-customization and mcp-apps both inline 5, tool-creation inlines 4, project-structure inlines 3, several others inline 2 each).

### Changed

- **`vendor/mcp-rune`** — bumped from `e91f175` to `4da609f` (mcp-rune v0.72.0). Brings in 29 new `docs/illustrations/pages/*.mjs` modules, 76 new `docs/illustrations/svgs/*.svg` files, and `<!-- illustration: … -->` markers across `docs/guides/*.md` and `docs/guides/summary-strategies/*.md`.

### Notes

- The 9 per-strategy `summary-strategies/<slug>.md` sub-guides have markers in place but are not yet registered as routable pages in `src/data/guides.ts` — they will pick up the SVGs automatically once added to the route map.
- 4 of 5 `model-form-customization` figures emit raw HTML form mockups (matching the pilot's `ds.css` form classes — `.fs`, `.frow`, `.checks`, `.field-stacked`, `.sel`, `.prevtag`) rather than SVG. Those classes need to be added to `src/styles/illustrations.css` for the mockups to render correctly on the site; flagged as a follow-up.

[0.8.2]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.8.1...v0.8.2

## [0.8.1] - 2026-06-04

> Polish pass on the illustration-substitution shape introduced in v0.8.0, after seeing the first live render at `/docs/quickstart`. Two issues surfaced. First, the plugin emitted a collapsed `<details><summary>ASCII</summary>…</details>` toggle below each figure as a copy-paste + screen-reader fallback; in practice it read as visual noise — the SVG's `aria-label` already covers screen-readers and the source `.md` keeps the ASCII for off-site readers, so the toggle is now removed and the rendered output is SVG-only. Second, the figure wrapper had its own background, border, and border-radius — but `illus.mjs`'s `svg()` helper already draws a framed `<rect>` as the SVG's first child, producing a visible double-frame. The figure is now reduced to a semantic wrapper for vertical spacing and overflow handling; the SVG owns the visible frame.

### Changed

- **`src/lib/remark-illustrations.mjs`** — `renderFigure()` no longer appends a `<details class="ill-src">` wrapper around the original ASCII. The figure emits just the SVG. The `escapeHtml` helper is renamed `escapeAttribute` and tightened (now also escapes `"`) since the only remaining escaping site is the `data-illustration` attribute value.
- **`src/styles/illustrations.css`** — `figure.ill` stripped to `margin`, `padding: 0`, and `overflow-x: auto`. The previous `background`, `border`, and `border-radius` are gone — `illus.mjs`'s `svg()` helper already draws those on the outer SVG `<rect>`. All `details.ill-src` rules are gone too, since the plugin no longer emits the element.
- **`src/lib/remark-illustrations.test.ts`** — the substitution test now asserts the original ASCII does **not** appear in the rendered HTML and `<details>` is absent, instead of the previous assertion that both appeared.
- **`vendor/mcp-rune`** — bumped from `4d62952` to `e91f175` (mcp-rune v0.71.1) to pull in the matching README updates.

[0.8.1]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.8.0...v0.8.1

## [0.8.0] - 2026-06-04

> Adds the site-side remark plugin that consumes the build-time SVG illustrations shipped by the companion mcp-rune v0.71.0 release. Guides under `vendor/mcp-rune/docs/guides/` keep their ASCII fences for off-site readers; on the site, a fenced block immediately preceded by a `<!-- illustration: id -->` HTML comment is rewritten into an inlined `<figure>` containing the matching SVG from `vendor/mcp-rune/docs/illustrations/svgs/`, with the original ASCII tucked into a collapsible `<details>` for screen-readers and copy-paste. Missing svgs, malformed markers, or markers that don't precede a fence all soft-fall back to the ASCII — the site build never fails on an illustration issue.

### Added

- **`src/lib/remark-illustrations.mjs`** — remark plugin that walks the mdast, matches `<!-- illustration: id -->` comments adjacent to fenced ASCII code blocks, reads `vendor/mcp-rune/docs/illustrations/svgs/<id>.svg`, and replaces the marker + fence pair with a single `<figure class="ill ill-rendered">` wrapping the inlined SVG and a `<details class="ill-src">` containing the original ASCII. SVG content is cached per-id for the lifetime of the build process. Missing files emit a `console.warn` with the source file path and continue.
- **`src/lib/remark-illustrations.test.ts`** — vitest covering the substitution path, the short marker form (no `#fig`), the missing-svg soft-fail, the bare-fence (no marker) untouched path, and the misplaced-marker (no fence after) warn path. 5/5 passing.
- **`src/styles/illustrations.css`** — small subset of the pilot `ds.css` covering only the embedded-figure rules (`.ill`, `.ill svg`, `details.ill-src`, `.tree` family). Imported globally from `src/styles/global.css`.

### Changed

- **`astro.config.mjs`** — registers `remarkIllustrations` in the `markdown.remarkPlugins` array alongside the existing `remarkCodePairs`. Both run before Shiki so unmarked/unpaired fences still get the default highlighting treatment.
- **`scripts/sync-mcp-rune.sh`** — after the submodule fast-forward and before `npm run build`, runs `node docs/illustrations/scripts/check-illustrations.mjs` inside `vendor/mcp-rune` to fail the sync if a page module was edited without rebuilding its SVG. Falls through gracefully if the submodule doesn't yet have the illustrations pipeline (i.e. a sync rolled back to a pre-v0.71.0 commit).
- **`vendor/mcp-rune`** — bumped from `428e90a` to `4d62952` (the mcp-rune v0.71.0 feature branch HEAD) so the symlinked guides surface the new illustration pipeline. The rendered `/docs/quickstart` page now inlines the `quickstart--fan.svg` in place of its ASCII fence.

[0.8.0]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.7.0...v0.8.0

## [0.7.0] - 2026-06-01

### Added

- **New guide: Extension Recipes.** Registers `extension-recipes.md` at the top of Section VIII (Adapters & Extensions) in `src/data/guides.ts` as the section's "start here" entry. The guide is an inverse map ("I want to do X — which seam does that?") with copy-pasteable starting points for the common extension patterns. `read: '9 min'`, icon `book`, tags `extensions`/`cookbook`.
- **New extension kind `hub`** added to the curation schema. `src/content.config.ts` extends the zod enum and `src/data/extensions.ts` extends the `ExtensionKind` TypeScript union. The new recipes guide carries `extension.kind: hub` in its frontmatter, so it shows up in the "Extension points only" filter on the docs hub.
- **Community / contact chrome ported from the `community.jsx` reference** ([c2f987e](https://github.com/mcp-rune/mcp-rune-site/commit/c2f987e)):
  - `src/lib/community.ts` — single source of truth for repo, Discord, email, star threshold (50) and seed (0). Email is `hello@mcp-rune.dev`.
  - `src/components/RuneStarButton.astro` — SSR seeds "Be star #N" invitation; client enhancement resolves `?stars=` URL override > 1h `localStorage` cache > live GitHub fetch > seed. Two variants (pill, drawer).
  - `src/components/RuneContactStrip.astro` — Discord + email framed by intent, slotted into `Footer` between columns and bottom row.
- **`MCP_RUNE_VERSION` / `SITE_VERSION` constants** at `src/data/version.ts`, each read from the respective `package.json` — a submodule bump auto-propagates everywhere the version is rendered (TopNav, Footer, DocsHero, DocsSidebar, `[slug].astro`, landing Hero + Close).

### Changed

- **`vendor/mcp-rune` bumped from `cdf9ade` to `a0a6750` (v0.59.0)** — eight upstream commits, including the [`Audit and align 31 guides with v0.58.1 source` (#169)](https://github.com/mcp-rune/mcp-rune/pull/169) sweep that rewrites passages in 11 existing guides (`analysis-memories`, `api-config`, `api-convention`, `api-extensions`, `attribute-kinds`, `custom-app`, `data-layer`, `domain-knowledge`, `extension-recipes`, `service-layer`, `summary-strategies`) against the v0.58.1 source. Also picks up the `extension-recipes` cookbook ([#164](https://github.com/mcp-rune/mcp-rune/pull/164)) and the co-location convention for multi-surface extensions ([#165](https://github.com/mcp-rune/mcp-rune/pull/165)). `FLAT_GUIDES.length` grows from 31 → 32; the sidebar version label auto-updates to `v0.59.0`.
- **`GuideIcon` documentation.** Adds a JSDoc block to the `GuideIcon` type in `src/data/guides.ts` and tightens the comment on the `Guide.icon` field. The block names `src/components/docs/DocIcon.astro` as the switch site for the 16 inline SVGs, explains the `stroke="currentColor"` mechanism, and points to `.row-icon` in `GuideRow.astro` (and the `.guide-row.ext` reskin to `#5bb8f5`) as the ancestor CSS that drives the rendered color. Adding a new icon now reads as a two-step recipe in the type's tooltip.
- **Hardcoded version strings replaced.** Seven `v0.1.0-alpha` / `0.1.0` sites across TopNav, Footer, DocsHero, DocsSidebar, `[slug].astro`, landing Hero + Close switched to the new `MCP_RUNE_VERSION_LABEL` / `SITE_VERSION_LABEL` constants. Drops the inconsistent `-alpha` suffix.

### Removed

- **Non-functional "Search docs" stubs.** Desktop search bar, mobile search icon, and sidebar "Filter guides…" placeholder removed; orphaned CSS cleaned up.

[0.7.0]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.6.2...v0.7.0

## [0.6.2] - 2026-05-29

### Changed

- **`vendor/mcp-rune` bumped from `5a04ddf` to `cdf9ade`** to pick up the framework's hand-authored JSDoc `@typedef` siblings for type-only TS blocks ([mcp-rune#151](https://github.com/mcp-rune/mcp-rune/pull/151)). The 20 JS panes that previously rendered the `/** Types are a TypeScript-only artifact … */` placeholder now show idiomatic JSDoc — the same format `tsc --checkJs` validates. Also picks up the new `--report-placeholders` flag on the upstream `dualize` tool. No site-side code change; the existing `remark-code-pairs` plugin + `CodeSnippet` primitive handle everything.

[0.6.2]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.6.1...v0.6.2

## [0.6.1] - 2026-05-29

### Changed

- **`vendor/mcp-rune` bumped from `e79b507` to `5a04ddf`** to pick up the framework's `npm run docs:dualize` tool + complete TS/JS dual-variant coverage ([mcp-rune#149](https://github.com/mcp-rune/mcp-rune/pull/149)). Every concrete code example in every guide now ships both a TypeScript and a JavaScript variant. The hub now renders **~258 `CodeSnippet` wrappers** across the 31 detail pages (was 13 after v0.6.0's hero pilot). No site-side code change; the existing `remark-code-pairs` plugin + `CodeSnippet` primitive handle the convention.

[0.6.1]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.6.0...v0.6.1

## [0.6.0] - 2026-05-29

### Added

- **`CodeSnippet` primitive** at `src/components/docs/CodeSnippet.astro` — the signature plate of the design's `Components.html` specimen sheet (P-01). Segmented TS ⇄ JS switch in the header, filename extension follows the language choice, language tints (TS `#8aa6ff`, JS `#f0c674`) on the chip, copy button. Vanilla `<script>` for tab state mirrors the existing "Extension points only" toggle pattern in `src/pages/docs/index.astro` — no React island. Language preference persists across guides via `localStorage` under key `mcp-rune:lang` so a reader who picks JS once stays on JS throughout the docs.
- **`remark-code-pairs` plugin** at `src/lib/remark-code-pairs.mjs`. Detects two adjacent fenced blocks tagged `ts` and `js` with matching `file=` meta (extension stripped) and replaces them with a single `CodeSnippet` HTML wrapper, with each variant pre-rendered through Shiki (`github-dark-default`). Strictly additive — unpaired blocks render as standard Shiki output. Registered in `astro.config.mjs:markdown.remarkPlugins`.
- **Runtime tab handler** at `src/scripts/code-snippet.ts`. One handler wires every `[data-code-snippet]` on the page: tab clicks broadcast across siblings (pick TS on one snippet, all snippets switch), `aria-pressed` toggles, copy button writes the active pane to the clipboard, language choice persists.
- **Dev-only `/components` specimen page** at `src/pages/components.astro` — a single-page design-system reference (production builds emit a 404 via `if (import.meta.env.PROD) return new Response(null, { status: 404 })`). Hosts the CodeSnippet feature plate and a grid of supporting primitives (button, status badge, syntax tokens, terminal). Useful as a fast "what already exists" reference for contributors; not shipped to end users.
- **Language chip tokens** `--c-ts` and `--c-js` in `src/styles/global.css`, plus the global `.cs*` style block (kept global because the remark plugin emits raw HTML that bypasses Astro's scoped-CSS hashing — both the `.astro` component and the plugin's output share one source of truth).
- **`vendor/mcp-rune` submodule bumped** from `0dee69c` to `e79b507` to pull in the pilot pairing edits in 10 framework guides ([mcp-rune#147](https://github.com/mcp-rune/mcp-rune/pull/147)) — ~13 paired snippets across Section VIII (Adapters & Extensions) and Section I (api-config).

### Changed

- **`src/pages/docs/[slug].astro`** — imports `src/scripts/code-snippet` so the tab handler ships with every guide.
- **`astro.config.mjs`** — `markdown.remarkPlugins: [remarkCodePairs]` registered before Shiki so the plugin pre-highlights its own panes and the rest of the pipeline leaves them alone.

[0.6.0]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.5.0...v0.6.0

## [0.5.0] - 2026-05-29

### Added

- **Extensibility signal on the docs hub.** Guides that document a place where a developer can plug in their own implementation now carry an "Extensible" treatment — blue plug badge on the row icon, a chip + concrete `what` text under the label, and a per-section "N EXTENSIBLE" pill in the section heading. The new "Adapters & Extensions" trail of the framework (extension points across HTTP, API, tool-flow, custom apps, custom adapters for API client / convention / data layer / search) becomes scannable at a glance.
- **"Extension points only" toggle** on the hub legend bar. Vanilla `<script>` on `src/pages/docs/index.astro` flips an `ext-only` class on the content root; CSS hides non-extensible rows (`.guide-row[data-ext='false']`) and sections that become empty (`.section-block[data-ext-count='0']`); the script updates each section's "N GUIDES" counter live. Button uses `aria-pressed` for state.
- **Extensibility frontmatter as the source of truth.** Per-guide `extension: { kind, what }` YAML frontmatter on the 19 extensible guides in mcp-rune (`vendor/mcp-rune` submodule bumped from `70ab7e7` to `0dee69c` — mcp-rune#145). Six kinds: `config | hook | strategy | plugin | override | registry`. `src/content.config.ts` validates the shape via Zod; `src/data/extensions.ts` exposes `loadExtensions(): Promise<Map<string, ExtensionPoint>>` and the shared `EXT_COLORS` palette (`#5bb8f5` / `rgba(91,184,245,0.10)` / `rgba(91,184,245,0.34)`).
- **Two new shared atoms** under `src/components/docs/`: `PlugIcon.astro` (the universal plug glyph, prop-sized) and `ExtFlag.astro` (three variants — `chip` for rows / featured / legend, `icon` for the sidebar, `detail` reserved for the guide-detail page).
- **Sidebar legend block** in `src/components/DocsSidebar.astro`: a tinted blue box explains the plug mark and shows the total extensible count; each extensible guide link gets an inline plug icon with a "Extension point — `<what>`" tooltip.
- **12 new guides registered** in `src/data/guides.ts`, expanding the catalog from 19 to **31 guides across 8 sections**. New section **VIII "Adapters & Extensions"** with 10 guides (overview, HTTP / API / tool-flow extensions, authoring extensions, custom MCP app, custom API client / convention / data layer / search adapter). `attribute-kinds` added to section II; `summary-strategies` added to section V.
- **Computed hero stats** on `src/components/docs/DocsHero.astro` — replaces hard-coded "15 / 12 / 180 / 3,800" with `total = FLAT_GUIDES.length`, `live = …filter('live')`, `sectionCount = SECTIONS.length`, and a `pagesEstimate` + `linesLabel` derived from the actual content collection (`await getCollection('guides')`). The strip stays accurate as the catalog grows.

### Changed

- **`src/components/docs/GuideRow.astro`** — accepts an optional `extension` prop, sets `data-ext` + `data-ext-slug` for the toggle CSS to target, recolors the icon avatar with the blue palette when extensible, adds an absolutely-positioned 17×17 plug badge top-right of the icon, and renders the chip + `what` text below the row label.
- **`src/components/docs/SectionBlock.astro`** — accepts an `extensions` map, computes `extCount`, exposes `data-ext-count` + `data-total-count` on the root, and renders the "N EXTENSIBLE" pill in the section head when `extCount > 0`.
- **`src/components/docs/FeaturedTrio.astro`** — featured cards (`Quickstart`, `Prompt Creation`, `MCP Apps`) gain a chip next to the existing tag when the guide is extensible.

[0.5.0]: https://github.com/mcp-rune/mcp-rune-site/compare/v0.4.1...v0.5.0

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
