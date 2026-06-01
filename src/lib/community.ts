// Community surface — single source of truth for stars, contact, and the
// social-proof posture. Mirrors the design's project/community.jsx so any
// future redesign can update one file and have nav, footer, and CTAs follow.

export const RUNE_REPO     = 'mcp-rune/mcp-rune';
export const RUNE_REPO_URL = `https://github.com/${RUNE_REPO}`;
export const RUNE_DISCORD  = 'https://discord.gg/mcp-rune';
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
