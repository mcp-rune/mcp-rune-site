// Cross-guide link destination policy.
//
// The guide markdown (in the mcp-rune repo) links siblings with relative
// `.md` paths. At build time `remark-doc-links.mjs` rewrites each one and —
// like a pending-migration check — FAILS the build on any link it cannot
// resolve, so a renamed/moved/unpublished target can never ship as a dead
// `<a>`. See `resolveDocLink` in `./guides`.
//
// Default expectation: an in-tree `.md` link points to a PUBLISHED guide
// (present in SECTIONS with a readable status) → /docs/<slug>/.
//
// `SOURCE_ONLY` is the explicit, intentional exception list: guides-root-
// relative targets that exist in the repo but we deliberately do NOT publish
// as site pages. They rewrite to the file on GitHub instead. This makes
// "should this resource live on the site?" a conscious, recorded decision —
// not a silent fallback.
//
// Entry forms:
//   - exact path:  '00-about/philosophy.md'
//   - prefix rule: '09-retrieval-and-graphrag/summary-strategies/' (trailing
//     slash matches everything under that directory)
//
// Note: links that escape docs/guides/ entirely (e.g. ../../../CHANGELOG.md)
// are handled structurally in `resolveDocLink` and need no entry here.

export const SOURCE_ONLY: string[] = [
  // ── PUBLISH CANDIDATES ──────────────────────────────────────────────
  // Real guide files that exist in the repo but aren't registered in
  // guides.ts yet. They link to GitHub source for now; registering any of
  // them in SECTIONS automatically flips its links to the on-site page and
  // it can be removed from this list.

  // The 10 summary-strategy detail pages under one directory.
  '09-retrieval-and-graphrag/summary-strategies/',

  // Standalone pages not yet on the site.
  '11-reference/database-setup.md',
];
