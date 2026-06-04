import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import remarkCodePairs from './src/lib/remark-code-pairs.mjs';
import remarkIllustrations from './src/lib/remark-illustrations.mjs';

export default defineConfig({
  integrations: [react()],
  site: 'https://mcp-rune.dev',
  // We don't ship any images yet; sidestep the sharp dependency at build time.
  image: {
    service: { entrypoint: 'astro/assets/services/noop' },
  },
  markdown: {
    // - remarkCodePairs: pair adjacent ts/js fences with matching `file=`
    //   meta into a CodeSnippet wrapper.
    // - remarkIllustrations: replace `<!-- illustration: id -->` + adjacent
    //   ASCII fences with the matching SVG from
    //   vendor/mcp-rune/docs/illustrations/svgs/.
    // Both run before Shiki so unpaired/unmarked blocks still get the
    // standard treatment.
    remarkPlugins: [remarkCodePairs, remarkIllustrations],
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
