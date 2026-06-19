// astro-doc-links-check
// ─────────────────────
// The fail-closed gate for cross-guide links. Astro's glob loader catches
// per-file render errors (so a throw inside `remark-doc-links.mjs` only logs
// and the build still exits 0). This integration instead validates every
// PUBLISHED guide's links once, up front, at `astro:config:setup` — which
// runs for both `astro build` and `astro dev` and, on throw, aborts the
// process with a non-zero exit before any page renders. Like a pending-
// migration check: the site won't build or start with a broken internal link.
//
// Scope = exactly what ships: readable guides with a `file` (the same set
// `remark-doc-links` rewrites). Resolution is shared via `resolveDocLink`, so
// the gate and the rewriter agree on every verdict.
//
// To clear a failure: fix the link in the source markdown, publish the target
// (add it to SECTIONS in src/data/guides.ts), or declare it source-only in
// src/data/guide-links.ts.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { FLAT_GUIDES, isReadable, resolveDocLink } from '../data/guides.ts';

// src/lib/ → ../content/guides (symlink to the vendor guides).
const HERE = dirname(fileURLToPath(import.meta.url));
const GUIDES_DIR = resolve(HERE, '..', 'content', 'guides');

// Drop fenced and inline code so a `.md` link inside a code SAMPLE isn't
// mistaken for a real cross-guide link.
function stripCode(md) {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]*`/g, '');
}

// Markdown inline link to a relative `.md` target, optionally with an anchor.
const LINK_RE = /\]\(\s*(\.{0,2}\/?[^)\s]+?\.md(?:#[^)\s]*)?)\s*\)/g;

function collectFailures() {
  const failures = [];
  for (const { guide } of FLAT_GUIDES) {
    if (!isReadable(guide.status) || !guide.file) continue;

    let body;
    try {
      body = stripCode(readFileSync(resolve(GUIDES_DIR, guide.file), 'utf8'));
    } catch {
      continue; // a missing source file is the content collection's error, not ours
    }

    LINK_RE.lastIndex = 0;
    let m;
    while ((m = LINK_RE.exec(body)) !== null) {
      const url = m[1];
      if (/^(https?:)?\/\//.test(url) || url.startsWith('/')) continue;
      const result = resolveDocLink(guide.file, url);
      if (result.kind === 'unresolved') {
        failures.push(`  ${guide.file}: ${url} → ${result.targetPath} (no such page or file)`);
      }
    }
  }
  return failures;
}

export default function docLinksCheck() {
  return {
    name: 'doc-links-check',
    hooks: {
      'astro:config:setup'({ logger }) {
        const failures = collectFailures();
        if (failures.length) {
          throw new Error(
            `${failures.length} unresolved cross-guide link(s) in published guides. ` +
              `Fix the link, publish the target (SECTIONS in src/data/guides.ts), ` +
              `or declare it source-only (src/data/guide-links.ts):\n` +
              failures.join('\n'),
          );
        }
        logger.info('cross-guide links: all resolve');
      },
    },
  };
}
