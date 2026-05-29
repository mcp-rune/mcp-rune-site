// remark-code-pairs
// ─────────────────
// Detects two ADJACENT fenced code blocks tagged `ts` and `js` with
// matching `file=` meta (extension stripped) inside a Markdown document
// and replaces both with a single CodeSnippet HTML block, with Shiki-
// highlighted markup for each variant embedded.
//
// Authoring side (in a .md guide):
//
//   ```ts file=src/models/book.ts
//   export class Book extends BaseModel { ... }
//   ```
//
//   ```js file=src/models/book.js
//   export class Book extends BaseModel { ... }
//   ```
//
// Render side: a `.cs` wrapper with TS active by default; the runtime
// script in src/scripts/code-snippet.ts wires the tab clicks.
//
// Unpaired blocks are left untouched — Astro/Shiki highlights them
// normally. The plugin is strictly additive.

import { codeToHtml } from 'shiki';

const SHIKI_THEME = 'github-dark-default';

/** Parse fenced-block meta into a plain object. Supports `file=path.ts`. */
function parseMeta(meta) {
  if (!meta) return {};
  const out = {};
  // Match key=value (value may be quoted)
  const re = /(\w+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let m;
  while ((m = re.exec(meta)) !== null) {
    out[m[1]] = m[2] ?? m[3] ?? m[4];
  }
  return out;
}

/** Strip the trailing extension if it matches the language. */
function baseFile(file, lang) {
  if (!file) return null;
  const extPattern = new RegExp(`\\.${lang}x?$`);
  return file.replace(extPattern, '');
}

/** Build the CodeSnippet wrapper HTML around two pre-highlighted blocks. */
function renderSnippet({ file, tsHtml, jsHtml, defaultLang }) {
  const escape = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const lang = defaultLang === 'js' ? 'js' : 'ts';
  return (
    `<div class="cs" data-code-snippet data-default-lang="${lang}" data-active="${lang}">` +
    `<div class="cs-head">` +
    `<span class="cs-dot"></span>` +
    `<span class="cs-file">${escape(file)}<span class="cs-ext" data-cs-ext>.${lang}</span></span>` +
    `<span class="cs-spacer"></span>` +
    `<div class="cs-seg" role="tablist" aria-label="Language">` +
    `<span class="cs-seg-thumb" data-cs-thumb></span>` +
    `<button type="button" role="tab" class="cs-seg-btn" data-cs-tab="ts" aria-selected="${lang === 'ts'}">` +
    `<span class="cs-seg-chip cs-chip-ts">TS</span><span class="cs-seg-lbl">TypeScript</span></button>` +
    `<button type="button" role="tab" class="cs-seg-btn" data-cs-tab="js" aria-selected="${lang === 'js'}">` +
    `<span class="cs-seg-chip cs-chip-js">JS</span><span class="cs-seg-lbl">JavaScript</span></button>` +
    `</div>` +
    `<button type="button" class="cs-copy" data-cs-copy aria-label="Copy">copy</button>` +
    `</div>` +
    `<div class="cs-body" data-cs-body>` +
    `<div class="cs-pane" data-cs-pane="ts">${tsHtml}</div>` +
    `<div class="cs-pane" data-cs-pane="js">${jsHtml}</div>` +
    `</div>` +
    `</div>`
  );
}

/**
 * The plugin itself. Returns an async transformer because Shiki is async.
 */
export default function remarkCodePairs() {
  return async function transformer(tree) {
    if (!tree || !Array.isArray(tree.children)) return;
    const children = tree.children;
    const out = [];

    for (let i = 0; i < children.length; i += 1) {
      const a = children[i];
      const b = children[i + 1];

      const isCode = (n) => n && n.type === 'code';
      const matches = (n, lang) =>
        isCode(n) && (n.lang === lang || (lang === 'ts' && n.lang === 'typescript') || (lang === 'js' && n.lang === 'javascript'));

      if (matches(a, 'ts') && matches(b, 'js')) {
        const aMeta = parseMeta(a.meta);
        const bMeta = parseMeta(b.meta);
        const aBase = baseFile(aMeta.file, 'ts');
        const bBase = baseFile(bMeta.file, 'js');

        if (aBase && bBase && aBase === bBase) {
          // eslint-disable-next-line no-await-in-loop
          const tsHtml = await codeToHtml(a.value, { lang: 'ts', theme: SHIKI_THEME });
          // eslint-disable-next-line no-await-in-loop
          const jsHtml = await codeToHtml(b.value, { lang: 'js', theme: SHIKI_THEME });
          out.push({
            type: 'html',
            value: renderSnippet({ file: aBase, tsHtml, jsHtml, defaultLang: 'ts' }),
          });
          i += 1; // skip b
          continue;
        }
      }

      // Reverse order (js then ts) — still pair them, default to ts.
      if (matches(a, 'js') && matches(b, 'ts')) {
        const aMeta = parseMeta(a.meta);
        const bMeta = parseMeta(b.meta);
        const aBase = baseFile(aMeta.file, 'js');
        const bBase = baseFile(bMeta.file, 'ts');

        if (aBase && bBase && aBase === bBase) {
          // eslint-disable-next-line no-await-in-loop
          const jsHtml = await codeToHtml(a.value, { lang: 'js', theme: SHIKI_THEME });
          // eslint-disable-next-line no-await-in-loop
          const tsHtml = await codeToHtml(b.value, { lang: 'ts', theme: SHIKI_THEME });
          out.push({
            type: 'html',
            value: renderSnippet({ file: bBase, tsHtml, jsHtml, defaultLang: 'ts' }),
          });
          i += 1;
          continue;
        }
      }

      out.push(a);
    }

    tree.children = out;
  };
}
