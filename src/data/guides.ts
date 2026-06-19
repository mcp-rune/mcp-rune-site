// Guide registry — single source of truth for routing, sidebar, breadcrumbs,
// pager, and cross-guide link resolution. This module is the public API:
//   - types live in `./guide-types`
//   - the SECTIONS data literal lives in `./guide-sections`
// and both are re-exported here so every consumer keeps importing from
// `../data/guides`. The logic (readability, pagination, link resolution)
// stays here, close to the data it operates on but no longer buried by it.

import { SECTIONS } from './guide-sections';
import { SOURCE_ONLY } from './guide-links';
import { RUNE_DOCS_BLOB_BASE, RUNE_REPO_BLOB_BASE } from '../lib/site';
import type { GuideStatus, Guide, Section } from './guide-types';

export type {
  GuideStatus,
  GuideIcon,
  ExtensionKind,
  ExtensionPoint,
  SeriesInfo,
  Guide,
  Section,
} from './guide-types';

export { SECTIONS };

/**
 * Guides the reader can actually open. `live` is the steady state; `new` is
 * the same shape (file is rendered, route exists, sidebar links it) but
 * decorated with a blue badge for one release cycle so it surfaces on the hub.
 * Use this anywhere we'd otherwise write `status === 'live'`.
 */
export function isReadable(status: GuideStatus): boolean {
  return status === 'live' || status === 'new';
}

// Flat list, in section order — used for prev/next pagination.
export const FLAT_GUIDES: { guide: Guide; section: Section; index: number }[] =
  SECTIONS.flatMap((section) =>
    section.guides.map((guide, i) => ({ guide, section, index: i })),
  );

export function findGuide(slug: string) {
  const idx = FLAT_GUIDES.findIndex((g) => g.guide.slug === slug);
  if (idx === -1) return null;
  return {
    ...FLAT_GUIDES[idx]!,
    flatIndex: idx,
    prev: idx > 0 ? FLAT_GUIDES[idx - 1] : null,
    next: idx < FLAT_GUIDES.length - 1 ? FLAT_GUIDES[idx + 1] : null,
    total: FLAT_GUIDES.length,
  };
}

// ── Cross-guide link resolution ──────────────────────────────────────────
// The guide markdown (authored in the mcp-rune repo) links siblings with
// relative `.md` paths — correct for GitHub/terminal readers, wrong for the
// site, where pages live at /docs/<slug>/. `remark-doc-links.mjs` rewrites
// every such link at build time using `resolveDocLink` below, and FAILS the
// build on any link that resolves to nothing (see that plugin). Each link's
// destination is one of three explicit, enforced outcomes:
//   - `site`   → a published guide page (the default expectation)
//   - `source` → the file on GitHub: either structurally off-site (a link
//     that escapes docs/guides/) or intentionally unpublished (declared in
//     `./guide-links` SOURCE_ONLY)
//   - `unresolved` → in-tree, neither published nor declared; the caller
//     turns this into a build error.

/** Guides-root-relative markdown file → its published slug + status. */
const FILE_TO_GUIDE = new Map<string, { slug: string; status: GuideStatus }>();
for (const section of SECTIONS) {
  for (const guide of section.guides) {
    if (guide.file) FILE_TO_GUIDE.set(guide.file, { slug: guide.slug, status: guide.status });
  }
}

export type DocLinkResolution =
  | { kind: 'site'; href: string }
  | { kind: 'source'; href: string }
  | { kind: 'unresolved'; targetPath: string };

/** True when a guides-root-relative path is declared source-only (exact or `prefix/`). */
function isSourceOnly(path: string): boolean {
  return SOURCE_ONLY.some((entry) =>
    entry.endsWith('/') ? path.startsWith(entry) : path === entry,
  );
}

/**
 * Resolve `target` (a raw relative `.md` link, optionally with `#anchor`)
 * against `fromRootRelative` (the linking doc's guides-root-relative path,
 * e.g. `01-getting-started/quickstart.md`). Pure — no filesystem access.
 */
export function resolveDocLink(fromRootRelative: string, target: string): DocLinkResolution {
  const hashAt = target.indexOf('#');
  const hash = hashAt === -1 ? '' : target.slice(hashAt);
  const rawPath = hashAt === -1 ? target : target.slice(0, hashAt);

  // Resolve in repo space so a link escaping docs/guides/ is detectable.
  const segments = `docs/guides/${fromRootRelative}`.split('/').slice(0, -1); // drop filename
  for (const seg of rawPath.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') segments.pop();
    else segments.push(seg);
  }
  const repoPath = segments.join('/');

  const GUIDES_ROOT = 'docs/guides/';
  if (!repoPath.startsWith(GUIDES_ROOT)) {
    // Escaped the guides tree — can only be a repo file, never a site page.
    return { kind: 'source', href: `${RUNE_REPO_BLOB_BASE}/${repoPath}${hash}` };
  }

  const inTree = repoPath.slice(GUIDES_ROOT.length);
  const published = FILE_TO_GUIDE.get(inTree);
  if (published && isReadable(published.status)) {
    return { kind: 'site', href: `/docs/${published.slug}/${hash}` };
  }
  if (isSourceOnly(inTree)) {
    return { kind: 'source', href: `${RUNE_DOCS_BLOB_BASE}/${inTree}${hash}` };
  }
  return { kind: 'unresolved', targetPath: inTree };
}
