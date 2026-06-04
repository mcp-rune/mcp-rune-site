// remark-illustrations
// ────────────────────
// Detects an HTML-comment marker immediately above a fenced ASCII code
// block in a Markdown document and replaces the pair with an inlined SVG
// illustration loaded from `vendor/mcp-rune/docs/illustrations/svgs/`.
//
// Authoring side (in a guide .md):
//
//   <!-- illustration: quickstart#fan -->
//   ```
//   [ ASCII diagram ]
//   ```
//
// Render side: a `<figure class="ill ill-rendered">` wrapper containing
// the SVG, with the original ASCII tucked into a collapsible `<details>`
// so screen readers and copy-paste still work.
//
// Soft-failure:
//   - missing svg file        → console.warn, leave both nodes untouched
//   - malformed marker        → leave both nodes untouched
//   - no marker before fence  → leave fence untouched
// The build NEVER fails over an illustration. The ASCII is always a
// faithful fallback.
//
// See docs/illustrations/README.md (in the mcp-rune repo) for the full
// authoring model.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// vendor/mcp-rune/docs/illustrations/svgs/ relative to this file:
//   src/lib/remark-illustrations.mjs
//   → ../../vendor/mcp-rune/docs/illustrations/svgs/
const HERE = dirname(fileURLToPath(import.meta.url));
const SVGS_DIR = resolve(
  HERE,
  '..',
  '..',
  'vendor',
  'mcp-rune',
  'docs',
  'illustrations',
  'svgs',
);

/** Matches `<!-- illustration: slug -->` and `<!-- illustration: slug#fig -->`. */
const MARKER_RE = /^<!--\s*illustration:\s*([\w-]+(?:#[\w-]+)?)\s*-->$/;

/** Convert a marker id ("slug" or "slug#fig") to its svg filename. */
function idToFilename(id) {
  return id.includes('#') ? `${id.replace('#', '--')}.svg` : `${id}.svg`;
}

/** Escape user text for safe placement inside a <pre> block in HTML. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Build the final HTML block: figure + svg + details/ASCII. */
function renderFigure({ id, svg, ascii }) {
  return (
    `<figure class="ill ill-rendered" data-illustration="${escapeHtml(id)}">` +
    svg +
    `<details class="ill-src"><summary>ASCII</summary>` +
    `<pre>${escapeHtml(ascii)}</pre>` +
    `</details>` +
    `</figure>`
  );
}

/** Read and cache the svg body for an id. Returns null on miss. */
const svgCache = new Map();
function loadSvg(id) {
  if (svgCache.has(id)) return svgCache.get(id);
  const filename = idToFilename(id);
  const path = resolve(SVGS_DIR, filename);
  let svg = null;
  try {
    svg = readFileSync(path, 'utf8');
  } catch {
    svg = null;
  }
  svgCache.set(id, svg);
  return svg;
}

/** True when this is an unlanguaged (or lang="ascii") fenced code block. */
function isAsciiFence(node) {
  if (!node || node.type !== 'code') return false;
  return !node.lang || node.lang === 'ascii';
}

/** Extract the marker id from an mdast html node, or null. */
function extractMarkerId(node) {
  if (!node || node.type !== 'html') return null;
  const m = node.value.trim().match(MARKER_RE);
  return m ? m[1] : null;
}

export default function remarkIllustrations() {
  return function transformer(tree, file) {
    if (!tree || !Array.isArray(tree.children)) return;
    const filePath = file?.path ?? '<unknown>';
    const children = tree.children;
    const out = [];

    for (let i = 0; i < children.length; i += 1) {
      const current = children[i];
      const next = children[i + 1];

      const markerId = extractMarkerId(current);

      if (markerId && isAsciiFence(next)) {
        const svg = loadSvg(markerId);
        if (svg) {
          out.push({
            type: 'html',
            value: renderFigure({
              id: markerId,
              svg,
              ascii: next.value,
            }),
          });
          i += 1; // skip the fence — it has been consumed
          continue;
        }
        console.warn(
          `[remark-illustrations] ${filePath}: marker "${markerId}" has no ` +
            `matching svg (looked for ${idToFilename(markerId)}). Rendering ASCII.`,
        );
      } else if (markerId) {
        console.warn(
          `[remark-illustrations] ${filePath}: marker "${markerId}" is not ` +
            `followed by an ASCII fenced block. Ignoring.`,
        );
      }

      out.push(current);
    }

    tree.children = out;
  };
}
