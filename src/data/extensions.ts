// Extension-point registry.
//
// The truth lives in YAML frontmatter on each guide markdown file
// (see src/content.config.ts for the schema). This module reads the guides
// content collection at build time and exposes a slug-keyed map so any docs
// component can ask "is this guide extensible? what does it expose?" with a
// single sync lookup.
//
// The slug used here matches the slug in src/data/guides.ts (the curated
// label/blurb/icon registry) — derived from the markdown filename by
// stripping the trailing "-guide" / "-flow" / etc. via the explicit mapping
// below.

import { getCollection } from 'astro:content';

export type ExtensionKind =
  | 'config'
  | 'hook'
  | 'strategy'
  | 'plugin'
  | 'override'
  | 'registry'
  | 'hub';

export interface ExtensionPoint {
  kind: ExtensionKind;
  what: string;
}

// Blue palette used everywhere extensibility is signalled (icon recolor,
// chips, badges, sidebar legend). Mirrors EXT_C in the design's docs-shared.jsx.
export const EXT_COLORS = {
  fg: '#5bb8f5',
  bg: 'rgba(91,184,245,0.10)',
  bd: 'rgba(91,184,245,0.34)',
} as const;

// Map the markdown content-entry id (filename without `.md`) to the site slug
// used in src/data/guides.ts. Keeps the curated label/blurb registry the
// single source of truth for slugs while letting the file naming in mcp-rune
// stay descriptive.
const ENTRY_ID_TO_SLUG: Record<string, string> = {
  'api-config-guide': 'api-config',
  'prompt-creation-guide': 'prompt-creation',
  'stateful-strategies-guide': 'stateful',
  'tool-creation-guide': 'tool-creation',
  'service-layer-guide': 'service-layer',
  'workflow-creation-guide': 'workflow-creation',
  'mcp-apps-guide': 'mcp-apps',
  'search-filter-integration-guide': 'search-filters',
  'model-form-customization-guide': 'model-form',
  'domain-knowledge-guide': 'domain-knowledge',
  // Adapters & Extensions guide set (section VIII).
  'extension-recipes': 'extension-recipes',
  extensions: 'extensions-http',
  'api-extensions': 'api-extensions',
  'tool-flow-extension-guide': 'tool-flow-extension',
  'custom-app-guide': 'custom-app',
  'search-adapter-guide': 'search-adapter',
  'api-client-guide': 'api-client',
  'api-convention-guide': 'api-convention',
  'data-layer-guide': 'data-layer',
  // Section V — Retrieval & GraphRAG.
  'retrieval-graphrag-guide': 'retrieval-graphrag',
  'summary-strategies': 'summary-strategies',
  // Quickstart tutorial series — used by loadSeries(), not loadExtensions().
  'quickstart-guide': 'quickstart',
  'analysis-quickstart-guide': 'analysis-quickstart',
};

export async function loadExtensions(): Promise<Map<string, ExtensionPoint>> {
  const entries = await getCollection('guides');
  const map = new Map<string, ExtensionPoint>();
  for (const entry of entries) {
    const ext = entry.data.extension;
    if (!ext) continue;
    const slug = ENTRY_ID_TO_SLUG[entry.id] ?? entry.id;
    map.set(slug, ext);
  }
  return map;
}

// Series metadata for multi-part tutorials (e.g. Quickstart parts 1 & 2).
// The truth lives in YAML frontmatter on each guide markdown file
// (see src/content.config.ts for the schema). Mirrored from ExtensionPoint's
// pattern so callers can drive UI off a single sync lookup.
export interface SeriesInfo {
  name: string;
  part: number;
  total: number;
}

export async function loadSeries(): Promise<Map<string, SeriesInfo>> {
  const entries = await getCollection('guides');
  const map = new Map<string, SeriesInfo>();
  for (const entry of entries) {
    const series = entry.data.series;
    if (!series) continue;
    const slug = ENTRY_ID_TO_SLUG[entry.id] ?? entry.id;
    map.set(slug, series);
  }
  return map;
}
