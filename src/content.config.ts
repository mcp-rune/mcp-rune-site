import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Loads every markdown file under src/content/guides (which is a symlink to
// the vendored mcp-rune docs). The collection exists only so the [slug]
// route can render guide bodies; per-guide metadata (label, blurb, status,
// icon, section grouping, extension point, series) all lives in
// src/data/guides.ts. The markdown files carry no frontmatter.
const guides = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/index.md'], base: './src/content/guides' }),
  schema: z.object({}),
});

export const collections = { guides };
