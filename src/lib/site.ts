// Single source of truth for all site-wide configuration and project identity:
// the site origin, package names, GitHub/community links, and web analytics.
// Anything that references these must import from here — never hardcode a URL,
// repo slug, package name, or ID in a component or page.

// --- this site ---
// Canonical origin. Consumed by astro.config.mjs (`site:`) for absolute URLs.
export const SITE_URL = 'https://mcp-rune.dev';

// --- npm ---
export const NPM_PACKAGE   = '@mcp-rune/mcp-rune';
export const NPM_INSTALL   = `npm i ${NPM_PACKAGE}`;
export const NPM_CREATE    = '@mcp-rune/create';

// --- GitHub repo ---
export const RUNE_REPO     = 'mcp-rune/mcp-rune';
export const RUNE_REPO_URL = `https://github.com/${RUNE_REPO}`;
// Default branch of the framework repo. Source/tree/edit links resolve against
// it, so it must track the repo's actual default branch (`master`) — pointing
// at a nonexistent `main` 404s every guide source link.
export const RUNE_REPO_BRANCH = 'master';

// The CLI scaffolder lives in its own repo. Site CTAs that point at the
// scaffolder source or its README use these; do not reuse RUNE_REPO_URL.
export const RUNE_CLI_REPO     = 'mcp-rune/mcp-rune-cli';
export const RUNE_CLI_REPO_URL = `https://github.com/${RUNE_CLI_REPO}`;

// RFCs (roadmap shaping) live in their own repo.
export const RUNE_RFCS_REPO    = 'mcp-rune/rfcs';
export const RUNE_RFCS_URL      = `https://github.com/${RUNE_RFCS_REPO}`;

// GitHub sub-URLs derived so a repo rename is a one-line change.
export const RUNE_ISSUES_URL      = `${RUNE_REPO_URL}/issues/new`;
export const RUNE_DISCUSSIONS_URL = `${RUNE_REPO_URL}/discussions`;
export const RUNE_GUIDES_URL      = `${RUNE_REPO_URL}/tree/${RUNE_REPO_BRANCH}/docs/guides`;
// Blob base for any file in the repo. `RUNE_DOCS_BLOB_BASE` narrows it to the
// guides dir for on-site source links; `RUNE_REPO_BLOB_BASE` covers repo-root
// files (CHANGELOG.md, AGENTS.md, …) that guides occasionally link out to.
export const RUNE_REPO_BLOB_BASE  = `${RUNE_REPO_URL}/blob/${RUNE_REPO_BRANCH}`;
export const RUNE_DOCS_BLOB_BASE  = `${RUNE_REPO_BLOB_BASE}/docs/guides`;
export const RUNE_DOCS_EDIT_BASE  = `${RUNE_REPO_URL}/edit/${RUNE_REPO_BRANCH}/docs/guides`;
export const RUNE_MILESTONES_URL  = `${RUNE_REPO_URL}/milestones`;
export const RUNE_MILESTONES_NEW_URL = `${RUNE_REPO_URL}/milestones/new`;

// --- social / contact ---
export const RUNE_DISCORD  = 'https://discord.gg/fxM2yndabX';
export const RUNE_EMAIL    = 'hello@mcp-rune.dev';

// Below this many stars, render the "Be star #N" invitation instead of the
// raw count. The design picked 50 — under it, the number is noise and the
// invitation converts better. Above it, the count starts pulling its own
// weight as social proof.
export const STAR_THRESHOLD = 50;

// Honest current reality used as the SSR seed before the client fetch
// answers. Never fabricated — keep at 0 until the repo genuinely passes the
// threshold and SSR-ing the real number becomes worth the build-time cost.
export const STAR_SEED = 0;

// --- web analytics ---
// Umami is self-hosted (infra repo) at analytics.dsaenz.dev — cookieless, so no
// consent banner is required. The tracker <script> lives in BaseLayout and
// renders only in production builds (`import.meta.env.PROD`), so `astro dev`
// never sends events. These values are public — they ship in the client tag.
export const UMAMI_SRC        = 'https://analytics.dsaenz.dev/script.js';
export const UMAMI_WEBSITE_ID = '99b34468-6fa3-4643-aa79-c36cd177aa2e';
