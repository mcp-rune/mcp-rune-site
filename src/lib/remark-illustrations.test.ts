import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';

// We import the plugin under test. It resolves its svg directory
// relative to its own file location, so for the test we point it at a
// tmp dir by overriding the SVGS_DIR constant via env. The plugin reads
// the directory at first call, so we use a tmp dir under
// vendor/mcp-rune/docs/illustrations/svgs/ via a real fixture.
//
// Implementation detail: rather than restructure the plugin for DI, we
// just write the fixture svgs into the real vendor path before the
// plugin loads, and remove them in afterEach. The test stays simple and
// the plugin code stays single-purpose.

const SITE_ROOT = resolve(__dirname, '..', '..');
const SVGS_DIR = resolve(
  SITE_ROOT,
  'vendor',
  'mcp-rune',
  'docs',
  'illustrations',
  'svgs',
);

async function withFixtureSvgs(
  fixtures: Record<string, string>,
  fn: () => Promise<void> | void,
) {
  await mkdir(SVGS_DIR, { recursive: true });
  const created: string[] = [];
  try {
    for (const [name, body] of Object.entries(fixtures)) {
      const path = join(SVGS_DIR, name);
      await writeFile(path, body, 'utf8');
      created.push(path);
    }
    await fn();
  } finally {
    for (const path of created) {
      await rm(path, { force: true });
    }
  }
}

async function runPlugin(markdown: string): Promise<string> {
  // Import inside the function so we get a fresh module each time and
  // dodge cross-test cache contamination from the plugin's internal
  // svgCache. Vitest resets module registry between describe blocks but
  // not between it() calls within one block.
  vi.resetModules();
  const { default: remarkIllustrations } = await import(
    './remark-illustrations.mjs'
  );
  const processor = unified()
    .use(remarkParse)
    .use(remarkIllustrations as never)
    .use(remarkStringify);
  const result = await processor.process(markdown);
  return String(result);
}

describe('remark-illustrations', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('replaces a marker + ASCII fence with a figure containing the svg', async () => {
    await withFixtureSvgs(
      {
        'demo--fan.svg': '<svg id="probe-svg" width="10" height="10"></svg>',
      },
      async () => {
        const md = [
          '# Hello',
          '',
          '<!-- illustration: demo#fan -->',
          '```',
          'ASCII contents',
          '```',
          '',
        ].join('\n');

        const html = await runPlugin(md);

        expect(html).toContain('<figure class="ill ill-rendered"');
        expect(html).toContain('data-illustration="demo#fan"');
        expect(html).toContain('<svg id="probe-svg"');
        expect(html).toContain(
          '<details class="ill-src"><summary>ASCII</summary>',
        );
        expect(html).toContain('ASCII contents');
        // The original code fence should no longer appear.
        expect(html).not.toMatch(/^```\n?ASCII contents/m);
        expect(warnSpy).not.toHaveBeenCalled();
      },
    );
  });

  it('also resolves the short marker form (no #fig) via the default svg', async () => {
    await withFixtureSvgs(
      {
        'demo.svg': '<svg id="default-svg"></svg>',
      },
      async () => {
        const md = [
          '<!-- illustration: demo -->',
          '```',
          'X',
          '```',
          '',
        ].join('\n');

        const html = await runPlugin(md);

        expect(html).toContain('<svg id="default-svg"');
        expect(html).toContain('data-illustration="demo"');
      },
    );
  });

  it('soft-fails when the svg is missing: warns and leaves both nodes intact', async () => {
    const md = [
      '<!-- illustration: not-built#yet -->',
      '```',
      'fallback ascii',
      '```',
      '',
    ].join('\n');

    const html = await runPlugin(md);

    expect(html).toContain('<!-- illustration: not-built#yet -->');
    expect(html).toContain('fallback ascii');
    expect(html).not.toContain('<figure');
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0]![0]).toContain('not-built#yet');
  });

  it('leaves untouched: an ASCII fence without a preceding marker', async () => {
    const md = ['```', 'plain ascii', '```', ''].join('\n');

    const html = await runPlugin(md);

    expect(html).toContain('plain ascii');
    expect(html).not.toContain('<figure');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns when a marker is not followed by an ASCII fence', async () => {
    const md = [
      '<!-- illustration: demo#fan -->',
      '',
      'Just a paragraph.',
      '',
    ].join('\n');

    const html = await runPlugin(md);

    expect(html).toContain('Just a paragraph.');
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0]![0]).toContain('not followed by an ASCII');
  });
});
