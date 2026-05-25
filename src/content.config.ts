import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// Loads every markdown file under src/content/guides (which is a symlink to
// /Users/dsaenz/Code/mcp-rune/docs/guides). The framework's guides do not have
// frontmatter, so no schema is declared — descriptive metadata is sourced from
// src/data/guides.ts instead. Astro derives each entry's `id` from the
// filename without the .md extension (e.g. `mcp-apps-guide`).
const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
});

export const collections = { guides };
