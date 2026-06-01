// Guide registry — single source of truth for routing, sidebar, breadcrumbs, pager.
// Mirrors the structure shown in the design's docs-shared.jsx (DOCS_SECTIONS) and
// page-docs-hub.jsx (REAL_GUIDES), but driven by what actually exists on disk in
// /Users/dsaenz/Code/mcp-rune/docs/guides (which is symlinked into src/content/guides).

export type GuideStatus = 'live' | 'wip' | 'soon';

/**
 * Discriminator key for the docs icon set rendered by
 * `src/components/docs/DocIcon.astro`. That component switches on `name`
 * and emits one inline `<svg>` per key — no external icon library.
 *
 * Color is **not** set by the icon itself: every SVG declares
 * `stroke="currentColor"`, so the rendered hue is inherited from the
 * ancestor element's CSS `color`. Each surface picks its own:
 *
 * - Docs hub rows  → `.row-icon { color: var(--acc-2); }`
 *   in `src/components/docs/GuideRow.astro` (and `.guide-row.ext .row-icon`
 *   reskins to `#5bb8f5` when the guide carries an extension point).
 * - Featured trio  → ancestor color set in `FeaturedTrio.astro` styles.
 * - The sidebar does not render `DocIcon`.
 *
 * Adding a new icon: append a key here, then add a matching `{name === '…' && (...)}`
 * branch in `DocIcon.astro`. No CSS change is required as long as the
 * surface using it already sets an ancestor `color`.
 */
export type GuideIcon =
  | 'bolt'
  | 'schema'
  | 'layers'
  | 'wrench'
  | 'net'
  | 'flow'
  | 'app'
  | 'search'
  | 'form'
  | 'brain'
  | 'sample'
  | 'ghost'
  | 'scope'
  | 'key'
  | 'globe'
  | 'book';

export interface Guide {
  slug: string;
  label: string;
  status: GuideStatus;
  /** Markdown filename inside src/content/guides. Omitted for soon guides only. */
  file?: string;
  /** Short description used in the docs hub and meta. */
  blurb: string;
  read: string;
  tags?: string[];
  /** See `GuideIcon` — key into `DocIcon.astro`; color comes from ancestor CSS via `currentColor`. */
  icon: GuideIcon;
}

export interface Section {
  num: string;
  title: string;
  blurb: string;
  guides: Guide[];
}

export const SECTIONS: Section[] = [
  {
    num: 'I',
    title: 'Getting Started',
    blurb: 'Your first day with mcp-rune — install, scaffold, and run a server end to end.',
    guides: [
      {
        slug: 'quickstart',
        label: 'Quickstart',
        status: 'live',
        file: 'quickstart-guide.md',
        blurb: 'Scaffold a project, register your first model, and call a tool from Claude Desktop in one terminal session.',
        read: '8 min',
        tags: ['cli', 'setup'],
        icon: 'bolt',
      },
      {
        slug: 'project-structure',
        label: 'Project structure',
        status: 'live',
        file: 'project-structure-guide.md',
        blurb: 'Where models, prompts, tools, apps and the domain registry live in a generated mcp-rune project.',
        read: '4 min',
        tags: ['layout'],
        icon: 'layers',
      },
      {
        slug: 'api-config',
        label: 'Configuring the API',
        status: 'live',
        file: 'api-config-guide.md',
        blurb: 'The static api block: endpoint, convention, namespace, readOnly, custom actions, and compound IDs.',
        read: '12 min',
        tags: ['models', 'http'],
        icon: 'net',
      },
    ],
  },
  {
    num: 'II',
    title: 'The Prompt DSL',
    blurb: 'The declarative language at the center of the framework. Sections describe the user journey; field groups carry validation. The framework writes everything in between.',
    guides: [
      {
        slug: 'prompt-creation',
        label: 'Prompt Creation',
        status: 'live',
        file: 'prompt-creation-guide.md',
        blurb: 'Stateless, hybrid or stateful. Sections vs fieldGroups. Per-section content enrichment and askPrompts.',
        read: '14 min',
        tags: ['core', 'dsl'],
        icon: 'schema',
      },
      {
        slug: 'prompt-derivation',
        label: 'Derivation Framework',
        status: 'live',
        file: 'prompt-derivation-framework-guide.md',
        blurb: 'The 5-layer architecture: schema → grouping → section docs → assembly → behavioral instructions.',
        read: '11 min',
        tags: ['architecture'],
        icon: 'layers',
      },
      {
        slug: 'sections-groups',
        label: 'Sections & Field Groups',
        status: 'live',
        file: 'sections-groups-guide.md',
        blurb: 'User-facing sections versus validation-facing field groups, and how layouts flow between them.',
        read: '6 min',
        tags: ['ui'],
        icon: 'form',
      },
      {
        slug: 'stateful',
        label: 'Stateful Strategies',
        status: 'live',
        file: 'stateful-strategies-guide.md',
        blurb: 'Turn-taking, section-by-section validation, and the StatefulStrategy API for 20+ field workflows.',
        read: '9 min',
        tags: ['advanced'],
        icon: 'scope',
      },
      {
        slug: 'attribute-kinds',
        label: 'Attribute Kinds',
        status: 'live',
        file: 'attribute-kinds-guide.md',
        blurb: 'How an attribute value moves through three representations — wire shape, validation, render. The kind taxonomy.',
        read: '8 min',
        tags: ['models', 'reference'],
        icon: 'schema',
      },
    ],
  },
  {
    num: 'III',
    title: 'Tools & Services',
    blurb: 'How tool classes hook into ModelService, the ApiClient pipeline, and the multi-step workflow runner.',
    guides: [
      {
        slug: 'tool-creation',
        label: 'Tool Creation',
        status: 'live',
        file: 'tool-creation-guide.md',
        blurb: 'Two layers: generic CRUD tools in mcp-rune, server-specific tools in your project. Pipeline, interceptors, validators.',
        read: '13 min',
        tags: ['tools'],
        icon: 'wrench',
      },
      {
        slug: 'service-layer',
        label: 'Service Layer',
        status: 'live',
        file: 'service-layer-guide.md',
        blurb: 'ModelService orchestrates EndpointResolver + Convention + ApiClient. Where domain errors are raised and translated.',
        read: '10 min',
        tags: ['services'],
        icon: 'flow',
      },
      {
        slug: 'workflow-creation',
        label: 'Workflow Creation',
        status: 'live',
        file: 'workflow-creation-guide.md',
        blurb: 'Multi-step LLM-driven workflows. get_workflow_step, contextHints, the fetch-analyze loop pattern.',
        read: '15 min',
        tags: ['workflows'],
        icon: 'flow',
      },
    ],
  },
  {
    num: 'IV',
    title: 'Apps, Search & Forms',
    blurb: 'Rich UI surfaces — sandboxed HTML apps, schema-derived search filters, and per-field-group form customization.',
    guides: [
      {
        slug: 'mcp-apps',
        label: 'MCP Apps',
        status: 'live',
        file: 'mcp-apps-guide.md',
        blurb: 'Schema-driven HTML forms rendered inside the client. ontoolinput, ontoolresult, callServerTool — the whole protocol.',
        read: '18 min',
        tags: ['apps', 'ui'],
        icon: 'app',
      },
      {
        slug: 'mcp-apps-arch',
        label: 'Apps Architecture',
        status: 'live',
        file: 'mcp-apps-architecture.md',
        blurb: 'How the framework resolves a ui:// resource, sandboxes the iframe, and wires bidirectional message channels.',
        read: '8 min',
        tags: ['apps', 'protocol'],
        icon: 'layers',
      },
      {
        slug: 'search-filters',
        label: 'Search Filters',
        status: 'live',
        file: 'search-filter-integration-guide.md',
        blurb: 'The shared filter contract between MCP and a Rails backend. text · enum · relation · date_range · integer_range.',
        read: '11 min',
        tags: ['search'],
        icon: 'search',
      },
      {
        slug: 'model-form',
        label: 'Model Form Customization',
        status: 'live',
        file: 'model-form-customization-guide.md',
        blurb: 'Horizontal label-field grids, row layouts, stacked variants — and per-fieldGroup overrides.',
        read: '7 min',
        tags: ['apps', 'ui'],
        icon: 'form',
      },
    ],
  },
  {
    num: 'V',
    title: 'Analysis & Memory',
    blurb: 'Patterns for large-result LLM workflows: pgvector-backed memories, stratified sampling, and the transient-context protocol that keeps context windows small.',
    guides: [
      {
        slug: 'analysis-memories',
        label: 'Analysis Memories',
        status: 'live',
        file: 'analysis-memories-guide.md',
        blurb: 'A five-tool feature for LLM-driven qualitative analysis over thousands of paginated records, with pgvector recall.',
        read: '22 min',
        tags: ['analysis', 'vector'],
        icon: 'brain',
      },
      {
        slug: 'proximity-sampling',
        label: 'Proximity Sampling',
        status: 'live',
        file: 'proximity-sampling-guide.md',
        blurb: 'Stratified, proximity-bucketed sample patterns for finding rare cases across long-tail distributions.',
        read: '6 min',
        tags: ['analysis', 'sampling'],
        icon: 'sample',
      },
      {
        slug: 'transient-context',
        label: 'Transient Context Protocol',
        status: 'live',
        file: 'transient-context-protocol.md',
        blurb: 'Server-to-client protocol for collapsing transient tool results after a follow-up call has consumed them.',
        read: '5 min',
        tags: ['protocol', 'context'],
        icon: 'ghost',
      },
      {
        slug: 'summary-strategies',
        label: 'Summary Strategies',
        status: 'live',
        file: 'summary-strategies.md',
        blurb: 'Pluggable summarization for analysis_ingest. Page-level summaries become the LLM\'s semantic starter pack.',
        read: '5 min',
        tags: ['analysis', 'strategy'],
        icon: 'brain',
      },
    ],
  },
  {
    num: 'VI',
    title: 'Auth & Transport',
    blurb: 'OAuth 2.0 the spec-compliant way — PRM, DCR, PKCE, resource indicators, and the WWW-Authenticate dance.',
    guides: [
      {
        slug: 'oauth2-discovery',
        label: 'OAuth 2.0 Discovery',
        status: 'live',
        file: 'oauth2-discovery-flow.md',
        blurb: 'RFC 9728 PRM · RFC 8414 server metadata · RFC 7591 DCR · RFC 7636 PKCE · RFC 8707 resource indicators.',
        read: '9 min',
        tags: ['auth', 'rfc'],
        icon: 'key',
      },
    ],
  },
  {
    num: 'VII',
    title: 'Domain Intelligence',
    blurb: 'The declarative domain layer: concepts, business rules, multi-step workflow definitions, and diagram templates the LLM can reach for.',
    guides: [
      {
        slug: 'domain-knowledge',
        label: 'Domain Knowledge Framework',
        status: 'live',
        file: 'domain-knowledge-guide.md',
        blurb: 'DomainConcept, BusinessRule, WorkflowDefinition, DiagramTemplate — the declarative domain registry.',
        read: '24 min',
        tags: ['domain'],
        icon: 'globe',
      },
    ],
  },
  {
    num: 'VIII',
    title: 'Adapters & Extensions',
    blurb: 'Every layer of mcp-rune has a typed seam. Swap, extend, or compose the framework\'s defaults without forking.',
    guides: [
      {
        slug: 'extension-recipes',
        label: 'Extension Recipes',
        status: 'live',
        file: 'extension-recipes.md',
        blurb: 'Inverse map — "I want to do X, which seam does that?" Copy-pasteable starting points for the common extension patterns.',
        read: '9 min',
        tags: ['extensions', 'cookbook'],
        icon: 'book',
      },
      {
        slug: 'extensibility',
        label: 'Adapters & Extensions Overview',
        status: 'live',
        file: 'extensibility-overview.md',
        blurb: 'Tour the seams: convention, client, data layer, search adapter, and the two extension shapes.',
        read: '3 min',
        tags: ['overview'],
        icon: 'layers',
      },
      {
        slug: 'extensions-http',
        label: 'HTTP Extensions',
        status: 'live',
        file: 'extensions.md',
        blurb: 'Opt-in HTTP extensions add routes and middleware on top of the framework\'s OAuth, status, and MCP transport endpoints.',
        read: '4 min',
        tags: ['extensions', 'http'],
        icon: 'wrench',
      },
      {
        slug: 'api-extensions',
        label: 'API Extensions',
        status: 'live',
        file: 'api-extensions.md',
        blurb: 'Contribute MCP tools and ModelService methods beyond pure CRUD — custom verbs, search subsystems, bulk operations, RPC.',
        read: '7 min',
        tags: ['extensions', 'api'],
        icon: 'net',
      },
      {
        slug: 'tool-flow-extension',
        label: 'Tool-Flow Extensions',
        status: 'live',
        file: 'tool-flow-extension-guide.md',
        blurb: 'Sibling to HttpExtension: modify the MCP tool surface and the runtime context threaded into app tool handlers.',
        read: '7 min',
        tags: ['extensions', 'tools'],
        icon: 'flow',
      },
      {
        slug: 'authoring-extensions',
        label: 'Authoring Extensions',
        status: 'live',
        file: 'authoring-extensions-guide.md',
        blurb: 'End-to-end walkthrough of writing an extension from scratch. Pick HttpExtension or ToolFlowExtension based on lifetime.',
        read: '7 min',
        tags: ['extensions', 'authoring'],
        icon: 'book',
      },
      {
        slug: 'custom-app',
        label: 'Writing a Custom MCP App',
        status: 'live',
        file: 'custom-app-guide.md',
        blurb: 'Build a seventh MCP app: kind taxonomy, formatter registry, form-schema generator, selection store, theming.',
        read: '7 min',
        tags: ['apps', 'authoring'],
        icon: 'app',
      },
      {
        slug: 'api-client',
        label: 'Custom API Client',
        status: 'live',
        file: 'api-client-guide.md',
        blurb: 'Universal CRUD HTTP contract every authenticated tool and ModelService depends on. Override when axios isn\'t enough.',
        read: '7 min',
        tags: ['adapter', 'http'],
        icon: 'net',
      },
      {
        slug: 'api-convention',
        label: 'Custom API Convention',
        status: 'live',
        file: 'api-convention-guide.md',
        blurb: 'Owns wire-format specifics: payload wrapping, association ID translation, list/response unwrapping, envelope stripping.',
        read: '8 min',
        tags: ['adapter', 'wire'],
        icon: 'schema',
      },
      {
        slug: 'data-layer',
        label: 'Custom DataLayer',
        status: 'live',
        file: 'data-layer-guide.md',
        blurb: 'Seam between mcp-rune\'s projection layer (CRUD, prompts, apps, workflows) and any concrete data backend.',
        read: '4 min',
        tags: ['adapter', 'data'],
        icon: 'layers',
      },
      {
        slug: 'search-adapter',
        label: 'Custom Search Adapter',
        status: 'live',
        file: 'search-adapter-guide.md',
        blurb: 'Translate `{ query, filters, page, perPage }` into your API\'s request shape — Ransack, Elasticsearch DSL, JSON:API, anything.',
        read: '6 min',
        tags: ['adapter', 'search'],
        icon: 'search',
      },
    ],
  },
];

// Flat list, in section order — used for prev/next pagination.
export const FLAT_GUIDES: { guide: Guide; section: Section; index: number }[] =
  SECTIONS.flatMap((section) =>
    section.guides.map((guide, i) => ({ guide, section, index: i })),
  );

export function findGuide(slug: string) {
  const idx = FLAT_GUIDES.findIndex((g) => g.guide.slug === slug);
  if (idx === -1) return null;
  return {
    ...FLAT_GUIDES[idx]!,
    flatIndex: idx,
    prev: idx > 0 ? FLAT_GUIDES[idx - 1] : null,
    next: idx < FLAT_GUIDES.length - 1 ? FLAT_GUIDES[idx + 1] : null,
    total: FLAT_GUIDES.length,
  };
}
