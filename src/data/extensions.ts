// Extension-point + series projections.
//
// The truth lives in src/data/guides.ts (the curated Guide registry); this
// module just projects FLAT_GUIDES into slug-keyed maps so existing call
// sites can keep doing `extensions.has(slug)` / `series.get(slug)` without
// caring how they're built.
//
// The async signatures are kept for compatibility with the four call sites
// (docs/index.astro, DocsSidebar.astro, FeaturedTrio.astro, DocsHero.astro);
// the bodies are synchronous.

import { FLAT_GUIDES } from './guides';
import type { ExtensionPoint, SeriesInfo } from './guides';

export type { ExtensionKind, ExtensionPoint, SeriesInfo } from './guides';

// Blue palette used everywhere extensibility is signalled (icon recolor,
// chips, badges, sidebar legend). Mirrors EXT_C in the design's docs-shared.jsx.
export const EXT_COLORS = {
  fg: '#5bb8f5',
  bg: 'rgba(91,184,245,0.10)',
  bd: 'rgba(91,184,245,0.34)',
} as const;

export async function loadExtensions(): Promise<Map<string, ExtensionPoint>> {
  return new Map(
    FLAT_GUIDES
      .filter(({ guide }) => guide.extension)
      .map(({ guide }) => [guide.slug, guide.extension!]),
  );
}

export async function loadSeries(): Promise<Map<string, SeriesInfo>> {
  return new Map(
    FLAT_GUIDES
      .filter(({ guide }) => guide.series)
      .map(({ guide }) => [guide.slug, guide.series!]),
  );
}
