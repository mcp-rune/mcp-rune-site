// Single source of truth for all project identity, package names, and
// community links. Any component that references the GitHub repo, npm package,
// or social channels should import from here — never hardcode.

// --- npm ---
export const NPM_PACKAGE   = '@mcp-rune/mcp-rune';
export const NPM_INSTALL   = `npm i ${NPM_PACKAGE}`;
export const NPM_CREATE    = '@mcp-rune/create';

// --- GitHub repo ---
export const RUNE_REPO     = 'mcp-rune/mcp-rune';
export const RUNE_REPO_URL = `https://github.com/${RUNE_REPO}`;

// The CLI scaffolder lives in its own repo. Site CTAs that point at the
// scaffolder source or its README use these; do not reuse RUNE_REPO_URL.
export const RUNE_CLI_REPO     = 'mcp-rune/mcp-rune-cli';
export const RUNE_CLI_REPO_URL = `https://github.com/${RUNE_CLI_REPO}`;

// GitHub sub-URLs derived so a repo rename is a one-line change.
export const RUNE_ISSUES_URL      = `${RUNE_REPO_URL}/issues/new`;
export const RUNE_DISCUSSIONS_URL = `${RUNE_REPO_URL}/discussions`;
export const RUNE_GUIDES_URL      = `${RUNE_REPO_URL}/tree/main/docs/guides`;
export const RUNE_DOCS_BLOB_BASE  = `${RUNE_REPO_URL}/blob/main/docs/guides`;
export const RUNE_DOCS_EDIT_BASE  = `${RUNE_REPO_URL}/edit/main/docs/guides`;
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
