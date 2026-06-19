import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import remarkCodePairs from './src/lib/remark-code-pairs.mjs';
import remarkIllustrations from './src/lib/remark-illustrations.mjs';
import remarkDocLinks from './src/lib/remark-doc-links.mjs';
import docLinksCheck from './src/lib/astro-doc-links-check.mjs';

export default defineConfig({
  // docLinksCheck fails `astro build`/`astro dev` at startup if any published
  // guide has an unresolved cross-guide link (the hard gate behind the
  // remark-doc-links rewriter — see src/lib/astro-doc-links-check.mjs).
  integrations: [react(), docLinksCheck()],
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
    // - remarkDocLinks: rewrite relative `.md` cross-guide links to their
    //   /docs/<slug>/ or GitHub-source destinations, failing the build on
    //   any link that resolves to nothing.
    // The first two run before Shiki so unpaired/unmarked blocks still get
    // the standard treatment.
    remarkPlugins: [remarkCodePairs, remarkIllustrations, remarkDocLinks],
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
