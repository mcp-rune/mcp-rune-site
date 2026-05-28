import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    // The mcp-rune framework submodule (vendor/mcp-rune) ships its own test
    // suite; we only run the site's tests here.
    exclude: ['node_modules', 'dist', 'vendor', '.astro'],
  },
});
