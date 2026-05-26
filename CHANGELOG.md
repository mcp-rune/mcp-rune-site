# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-05-26

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
