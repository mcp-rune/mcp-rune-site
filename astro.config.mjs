import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import remarkCodePairs from './src/lib/remark-code-pairs.mjs';

export default defineConfig({
  integrations: [react()],
  site: 'https://mcp-rune.dev',
  // We don't ship any images yet; sidestep the sharp dependency at build time.
  image: {
    service: { entrypoint: 'astro/assets/services/noop' },
  },
  markdown: {
    // Pair adjacent ts/js code fences with matching `file=` meta into a
    // CodeSnippet wrapper. Must run before Shiki for unpaired blocks to
    // still get the standard treatment.
    remarkPlugins: [remarkCodePairs],
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: false,
    },
  },
  vite: {
    server: {
      fs: {
        // Allow Vite to read the guides via the symlink that points
        // outside the project root (../mcp-rune/docs/guides).
        allow: ['..'],
      },
    },
  },
});
