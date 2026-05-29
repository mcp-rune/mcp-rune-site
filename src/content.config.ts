import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Loads every markdown file under src/content/guides (which is a symlink to
// the vendored mcp-rune docs). Frontmatter is optional: guides that document
// an extension point declare it inline; everything else stays plain markdown.
// Descriptive metadata (label, blurb, status, icon, section grouping) still
// lives in src/data/guides.ts — see the migration note in that file.
const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: z.object({
    extension: z
      .object({
        kind: z.enum(['config', 'hook', 'strategy', 'plugin', 'override', 'registry']),
        what: z.string(),
      })
      .optional(),
  }),
});

export const collections = { guides };
