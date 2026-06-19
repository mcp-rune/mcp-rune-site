import { describe, expect, it, vi } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkDocLinks from './remark-doc-links.mjs';
import { resolveDocLink } from '../data/guides';
import { RUNE_DOCS_BLOB_BASE, RUNE_REPO_BLOB_BASE } from './site';

// A guide that is stably published and has stable siblings/targets, used as
// the "linking from" doc throughout.
const FROM = '01-getting-started/quickstart.md';

describe('resolveDocLink', () => {
  it('maps a cross-section link to a published guide page', () => {
    expect(resolveDocLink(FROM, '../05-apps/mcp-apps.md')).toEqual({
      kind: 'site',
      href: '/docs/mcp-apps/',
    });
  });

  it('maps a sibling link to a published guide page', () => {
    expect(resolveDocLink(FROM, './project-structure.md')).toEqual({
      kind: 'site',
      href: '/docs/project-structure/',
    });
  });

  it('preserves the anchor on a site link', () => {
    expect(
      resolveDocLink(FROM, '../06-the-three-layers-up-close/data-layer.md#the-projection-layer-rule'),
    ).toEqual({
      kind: 'site',
      href: '/docs/data-layer/#the-projection-layer-rule',
    });
  });

  it('sends a declared source-only (in-tree) target to its GitHub source', () => {
    const result = resolveDocLink(
      FROM,
      '../09-retrieval-and-graphrag/summary-strategies/distribution.md',
    );
    expect(result).toEqual({
      kind: 'source',
      href: `${RUNE_DOCS_BLOB_BASE}/09-retrieval-and-graphrag/summary-strategies/distribution.md`,
    });
  });

  it('sends a link that escapes docs/guides/ to its GitHub repo source', () => {
    expect(resolveDocLink(FROM, '../../../CHANGELOG.md')).toEqual({
      kind: 'source',
      href: `${RUNE_REPO_BLOB_BASE}/CHANGELOG.md`,
    });
  });

  it('flags an in-tree target that is neither published nor declared as unresolved', () => {
    expect(resolveDocLink(FROM, '../99-nope/missing.md')).toEqual({
      kind: 'unresolved',
      targetPath: '99-nope/missing.md',
    });
  });
});

async function runPlugin(markdown: string, path: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkDocLinks as never)
    .use(remarkStringify);
  const file = await processor.process({ value: markdown, path });
  return String(file);
}

describe('remark-doc-links plugin', () => {
  const PATH = '/repo/src/content/guides/01-getting-started/quickstart.md';

  it('rewrites a published cross-guide link to its /docs/<slug>/ URL', async () => {
    const out = await runPlugin('See [MCP apps](../05-apps/mcp-apps.md).', PATH);
    expect(out).toContain('/docs/mcp-apps/');
    expect(out).not.toContain('mcp-apps.md');
  });

  it('leaves external and absolute links untouched', async () => {
    const md = 'See [site](https://example.com) and [hub](/docs).';
    const out = await runPlugin(md, PATH);
    expect(out).toContain('https://example.com');
    expect(out).toContain('(/docs)');
  });

  it('throws on an unresolved cross-guide link', async () => {
    await expect(
      runPlugin('Broken [x](../99-nope/missing.md).', PATH),
    ).rejects.toThrow(/unresolved cross-guide link/i);
  });
});
