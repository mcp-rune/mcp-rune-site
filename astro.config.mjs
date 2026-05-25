import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  site: 'https://mcp-rune.dev',
  // We don't ship any images yet; sidestep the sharp dependency at build time.
  image: {
    service: { entrypoint: 'astro/assets/services/noop' },
  },
  markdown: {
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
