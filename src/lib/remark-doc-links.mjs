// remark-doc-links
// ────────────────
// Rewrites cross-guide Markdown links to their real destinations at render time.
//
// Why this exists
//   The guides are authored in the mcp-rune repo and link siblings with
//   relative `.md` paths — `[MCP apps](../05-apps/mcp-apps.md)`. Those paths
//   are correct for GitHub/terminal readers but wrong for the site, where
//   pages live at `/docs/<slug>/`. Left untouched, every such link 404s.
//
// What it does (per link with a relative `.md` target, anchors preserved):
//   - published guide  → `/docs/<slug>/#anchor`
//   - declared source-only, or a path that escapes docs/guides/ (e.g.
//     `../../../CHANGELOG.md`) → the file on GitHub
//   - anything else (in-tree, neither published nor declared) → throw
//
// The published/source-only/escape policy lives in `src/data/guides.ts`
// (`resolveDocLink`) and `src/data/guide-links.ts` (`SOURCE_ONLY`).
//
// Enforcement note: throwing here surfaces a clean render error (dev overlay,
// build log) for the offending page, but Astro's glob loader CATCHES per-file
// render errors and the build still exits 0. So the *hard* fail-closed gate
// is the companion integration `astro-doc-links-check.mjs`, which validates
// every published guide's links once at `astro:config:setup` and aborts
// `astro build`/`astro dev` with a non-zero exit before any page renders.
// Both share `resolveDocLink`, so they agree. To clear a failure: fix the
// link, publish the target (SECTIONS in guides.ts), or declare it source-only
// in guide-links.ts.

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { visit } from 'unist-util-visit';
import { resolveDocLink } from '../data/guides.ts';

// src/lib/remark-doc-links.mjs → ../content/guides (the symlink to the
// vendor guides). Used only to tell "dead link" from "exists but unpublished"
// in error messages.
const HERE = dirname(fileURLToPath(import.meta.url));
const GUIDES_DIR = resolve(HERE, '..', 'content', 'guides');

/** A relative link to a `.md` file (optionally with an anchor) — i.e. a cross-guide link. */
function isCrossGuideLink(url) {
  if (!url) return false;
  if (/^(https?:)?\/\//.test(url)) return false; // absolute / protocol-relative
  if (url.startsWith('/') || url.startsWith('#') || url.startsWith('mailto:')) return false;
  return /\.md($|#)/.test(url);
}

export default function remarkDocLinks() {
  return function transformer(tree, file) {
    // Guides-root-relative path of the doc being rendered, e.g.
    // `01-getting-started/quickstart.md`. The content collection exposes the
    // file via the `src/content/guides` symlink, so the path always contains
    // `/guides/`; everything after it is the root-relative path.
    const filePath = file?.path ?? '';
    const fromRootRelative = filePath.includes('/guides/')
      ? filePath.slice(filePath.lastIndexOf('/guides/') + '/guides/'.length)
      : filePath;

    const errors = [];

    visit(tree, 'link', (node) => {
      if (!isCrossGuideLink(node.url)) return;

      const result = resolveDocLink(fromRootRelative, node.url);
      if (result.kind === 'unresolved') {
        const onDisk = existsSync(resolve(GUIDES_DIR, result.targetPath));
        errors.push(
          onDisk
            ? `  ${node.url} → ${result.targetPath} exists but isn't a site page. ` +
                `Publish it (add to SECTIONS in src/data/guides.ts) or declare it ` +
                `source-only in src/data/guide-links.ts.`
            : `  ${node.url} → ${result.targetPath} does not exist (dead link). ` +
                `Fix the link in the source markdown.`,
        );
        return;
      }
      node.url = result.href;
    });

    if (errors.length) {
      throw new Error(
        `[remark-doc-links] ${fromRootRelative}: unresolved cross-guide link(s):\n` +
          errors.join('\n'),
      );
    }
  };
}
