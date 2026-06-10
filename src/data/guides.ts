// Guide registry — single source of truth for routing, sidebar, breadcrumbs, pager.
// Mirrors the structure shown in the design's docs-shared.jsx (DOCS_SECTIONS) and
// page-docs-hub.jsx (REAL_GUIDES), but driven by what actually exists on disk in
// /Users/dsaenz/Code/mcp-rune/docs/guides (which is symlinked into src/content/guides).

export type GuideStatus = 'live' | 'new' | 'wip' | 'soon';

/**
 * Guides the reader can actually open. `live` is the steady state; `new` is
 * the same shape (file is rendered, route exists, sidebar links it) but
 * decorated with a blue badge for one release cycle so it surfaces on the hub.
 * Use this anywhere we'd otherwise write `status === 'live'`.
 */
export function isReadable(status: GuideStatus): boolean {
  return status === 'live' || status === 'new';
}

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

export interface SeriesInfo {
  name: string;
  part: number;
  total: number;
}

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
  /** Marks the guide as exposing an extension point — drives the blue plug badge. */
  extension?: ExtensionPoint;
  /** Multi-part tutorial sequencing (e.g. Quickstart parts 1 & 2). */
  series?: SeriesInfo;
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
        series: { name: 'Quickstart', part: 1, total: 2 },
        label: 'Quickstart',
        status: 'live',
        file: '01-getting-started/quickstart.md',
        blurb: 'Scaffold a project, register your first model, and call a tool from Claude Desktop in one terminal session.',
        read: '8 min',
        tags: ['cli', 'setup'],
        icon: 'bolt',
      },
      {
        slug: 'project-structure',
        label: 'Project structure',
        status: 'live',
        file: '01-getting-started/project-structure.md',
        blurb: 'Where models, prompts, tools, apps and the domain registry live in a generated mcp-rune project.',
        read: '4 min',
        tags: ['layout'],
        icon: 'layers',
      },
    ],
  },
  {
    num: 'II',
    title: 'The Model',
    blurb: 'The Model is mcp-rune\'s single source of truth. This chapter teaches what a Model declaration is — attributes, kinds, associations, validation — and the definition-vs-consumption split the rest of the framework is built on.',
    guides: [
      {
        slug: 'derivation-overview',
        label: 'Derivation overview',
        status: 'new',
        file: '02-the-model/derivation-overview.md',
        blurb: 'A one-page map of every framework surface derived from your Model declaration, with pointers to the chapter that covers each.',
        read: '3 min',
        tags: ['reference'],
        icon: 'flow',
      },
      {
        slug: 'defining-a-model',
        label: 'Defining a model',
        status: 'new',
        file: '02-the-model/defining-a-model.md',
        blurb: 'BaseModel, the four static fields the framework reads, and the smallest realistic example drawn from the tasks server.',
        read: '6 min',
        tags: ['models', 'core'],
        icon: 'schema',
      },
      {
        slug: 'attributes-and-kinds',
        extension: { kind: 'plugin', what: 'Register custom kinds via AppRegistry({ kinds })' },
        label: 'Attributes and kinds',
        status: 'live',
        file: '02-the-model/attributes-and-kinds.md',
        blurb: 'How an attribute value moves through three representations — wire shape, validation, render — and the unified kind taxonomy under src/mcp/models/kinds/.',
        read: '8 min',
        tags: ['models', 'reference'],
        icon: 'schema',
      },
      {
        slug: 'associations',
        label: 'Associations',
        status: 'new',
        file: '02-the-model/associations.md',
        blurb: 'belongsTo and hasMany. How foreign keys are inferred, and what pickers, validators, forms, and graph edges get for free.',
        read: '6 min',
        tags: ['models'],
        icon: 'net',
      },
      {
        slug: 'validation-and-defaults',
        label: 'Validation and defaults',
        status: 'new',
        file: '02-the-model/validation-and-defaults.md',
        blurb: 'required, default, validation: { min, max }. Where each one fires in the validate → write lifecycle, and the prompt-defaults vs payload-defaults split.',
        read: '5 min',
        tags: ['models', 'validation'],
        icon: 'scope',
      },
      {
        slug: 'definition-vs-consumption',
        label: 'Definition vs consumption',
        status: 'new',
        file: '02-the-model/definition-vs-consumption.md',
        blurb: 'Why models/ holds the declaration and model-layer/, data-layer/, analysis-layer/ hold the consumers. The architectural split the eslint guard enforces.',
        read: '4 min',
        tags: ['architecture'],
        icon: 'layers',
      },
    ],
  },
  {
    num: 'III',
    title: 'The Prompt',
    blurb: 'The first thing that reads a Model. Where the Model defines the nouns, the Prompt defines the verbs of reasoning — how an LLM should think about and fill the form your Model implies.',
    guides: [
      {
        slug: 'prompt-creation',
        extension: { kind: 'hook', what: 'askPrompts · per-section content enrichment' },
        label: 'Prompt creation',
        status: 'live',
        file: '03-the-prompt/prompt-creation.md',
        blurb: 'BasePrompt: sections, fieldGroups, formStrategy, promptContent, and derivePromptSchema. By the end you can read book-prompt.ts line by line.',
        read: '14 min',
        tags: ['core', 'dsl'],
        icon: 'schema',
      },
      {
        slug: 'prompt-derivation',
        label: 'Prompt derivation',
        status: 'live',
        file: '03-the-prompt/prompt-derivation.md',
        blurb: 'The five-layer architecture: schema → grouping → section docs → assembly → behavioral instructions.',
        read: '11 min',
        tags: ['architecture'],
        icon: 'layers',
      },
      {
        slug: 'sections-groups',
        label: 'Sections & field groups',
        status: 'live',
        file: '03-the-prompt/sections-groups.md',
        blurb: 'User-facing sections versus validation-facing field groups, and how layouts flow between them.',
        read: '6 min',
        tags: ['ui'],
        icon: 'form',
      },
      {
        slug: 'stateful',
        extension: { kind: 'strategy', what: 'Implement a custom StatefulStrategy' },
        label: 'Stateful strategies',
        status: 'live',
        file: '03-the-prompt/stateful.md',
        blurb: 'Turn-taking, section-by-section validation, and the StatefulStrategy API for 20+ field workflows.',
        read: '9 min',
        tags: ['advanced'],
        icon: 'scope',
      },
    ],
  },
  {
    num: 'IV',
    title: 'Tools',
    blurb: 'What executes against the Model. The three peer interfaces every tool consumes via DI, the 9 bundled polymorphic tools that serve every model uniformly, and the path to writing custom tools when a bespoke verb doesn\'t fit.',
    guides: [
      {
        slug: 'the-three-layers',
        label: 'The three layers',
        status: 'new',
        file: '04-tools/the-three-layers.md',
        blurb: 'DataLayer, ModelLayer, AnalysisLayer — the three peer interfaces every Tool, App, and Prompt receives via DI. The eslint guard that keeps the boundary trustworthy.',
        read: '8 min',
        tags: ['architecture', 'core'],
        icon: 'layers',
      },
      {
        slug: 'polymorphic-tools',
        label: 'Polymorphic tools',
        status: 'new',
        file: '04-tools/polymorphic-tools.md',
        blurb: 'The 9 bundled tools (6 CRUD + 3 form-strategy) that serve every model. Why the surface doesn\'t grow when your model count does.',
        read: '6 min',
        tags: ['tools'],
        icon: 'wrench',
      },
      {
        slug: 'tool-creation',
        extension: { kind: 'plugin', what: 'Server-specific tools · interceptors · validators' },
        label: 'Tool creation',
        status: 'live',
        file: '04-tools/tool-creation.md',
        blurb: 'Writing a BaseTool subclass when a bespoke verb doesn\'t fit the polymorphic shape. Pipeline, interceptors, validators.',
        read: '13 min',
        tags: ['tools'],
        icon: 'wrench',
      },
      {
        slug: 'workflow-creation',
        extension: { kind: 'plugin', what: 'Author multi-step workflow definitions' },
        label: 'Workflow creation',
        status: 'live',
        file: '04-tools/workflow-creation.md',
        blurb: 'Multi-step LLM-driven workflows. get_workflow_step, contextHints, the fetch-analyze loop pattern.',
        read: '15 min',
        tags: ['workflows'],
        icon: 'flow',
      },
    ],
  },
  {
    num: 'V',
    title: 'Apps',
    blurb: 'Where Tools serve the LLM, Apps serve the human. Schema-driven HTML interfaces that render inside MCP clients, consuming the same three layers Tools do plus a bidirectional iframe message protocol.',
    guides: [
      {
        slug: 'mcp-apps',
        extension: { kind: 'plugin', what: 'Ship your own sandboxed HTML apps' },
        label: 'MCP apps',
        status: 'live',
        file: '05-apps/mcp-apps.md',
        blurb: 'Schema-driven HTML forms rendered inside the client. ontoolinput, ontoolresult, callServerTool — the whole protocol.',
        read: '18 min',
        tags: ['apps', 'ui'],
        icon: 'app',
      },
      {
        slug: 'mcp-apps-arch',
        label: 'Apps architecture',
        status: 'live',
        file: '05-apps/mcp-apps-arch.md',
        blurb: 'How the framework resolves a ui:// resource, sandboxes the iframe, and wires bidirectional message channels.',
        read: '8 min',
        tags: ['apps', 'protocol'],
        icon: 'layers',
      },
      {
        slug: 'model-form',
        extension: { kind: 'override', what: 'Per-fieldGroup layout overrides' },
        label: 'Model form customization',
        status: 'live',
        file: '05-apps/model-form.md',
        blurb: 'BaseAppForm, per-fieldGroup overrides, horizontal grids, row layouts. When the synthesized default form doesn\'t fit.',
        read: '7 min',
        tags: ['apps', 'ui'],
        icon: 'form',
      },
    ],
  },
  {
    num: 'VI',
    title: 'The Three Layers Up Close',
    blurb: 'Part I taught Tools and Apps to call three injected layers without knowing how any of them are implemented. This is where you decide what\'s behind each interface — which adapter, which wire convention, which API client, which search shape.',
    guides: [
      {
        slug: 'data-layer',
        extension: { kind: 'override', what: 'Implement a custom DataLayer' },
        label: 'Data layer',
        status: 'new',
        file: '06-the-three-layers-up-close/data-layer.md',
        blurb: 'The per-request backend I/O seam. Built-in implementations (in-memory stub, ModelService, SearchEnabledDataLayer). When to swap.',
        read: '6 min',
        tags: ['adapter', 'data'],
        icon: 'layers',
      },
      {
        slug: 'model-service',
        label: 'Model service',
        status: 'new',
        file: '06-the-three-layers-up-close/model-service.md',
        blurb: 'The default DataLayer adapter. How ModelService composes EndpointResolver + ApiClient + convention to route every CRUD call.',
        read: '7 min',
        tags: ['adapter', 'data'],
        icon: 'flow',
      },
      {
        slug: 'api-configuration',
        extension: { kind: 'config', what: 'Custom actions on a model API' },
        label: 'API configuration',
        status: 'live',
        file: '06-the-three-layers-up-close/api-configuration.md',
        blurb: 'The static api block: endpoint, convention, namespace, readOnly, custom actions, and compound IDs — the declaration ModelService, ApiClient, and conventions all read from.',
        read: '12 min',
        tags: ['models', 'http'],
        icon: 'net',
      },
      {
        slug: 'api-client',
        extension: { kind: 'override', what: 'Implement a custom ApiClient' },
        label: 'API client',
        status: 'live',
        file: '06-the-three-layers-up-close/api-client.md',
        blurb: 'Universal CRUD HTTP contract ModelService depends on. Override when axios isn\'t enough or you need custom retry/auth/telemetry.',
        read: '7 min',
        tags: ['adapter', 'http'],
        icon: 'net',
      },
      {
        slug: 'api-convention',
        extension: { kind: 'override', what: 'Implement a custom API convention' },
        label: 'API convention',
        status: 'live',
        file: '06-the-three-layers-up-close/api-convention.md',
        blurb: 'Wire-format shape: payload wrapping, association ID translation, response unwrapping. Default moved BaseModel → DataLayer in v0.85.0.',
        read: '8 min',
        tags: ['adapter', 'wire'],
        icon: 'schema',
      },
      {
        slug: 'search-request-shaper',
        extension: { kind: 'plugin', what: 'Implement a custom search request shaper' },
        label: 'Search request shaper',
        status: 'live',
        file: '06-the-three-layers-up-close/search-request-shaper.md',
        blurb: 'Translate { query, filters, page, perPage } into your API\'s request shape — Ransack, Elasticsearch DSL, JSON:API. Renamed from SearchAdapter in v0.77.0.',
        read: '6 min',
        tags: ['adapter', 'search'],
        icon: 'search',
      },
      {
        slug: 'search-filters',
        extension: { kind: 'plugin', what: 'Register custom filter types' },
        label: 'Search filters',
        status: 'live',
        file: '06-the-three-layers-up-close/search-filters.md',
        blurb: 'The typed filter contract the shaper consumes — text · enum · relation · date_range · integer_range. Both sides of an integration.',
        read: '11 min',
        tags: ['search'],
        icon: 'search',
      },
      {
        slug: 'model-layer',
        label: 'Model layer',
        status: 'new',
        file: '06-the-three-layers-up-close/model-layer.md',
        blurb: 'The synchronous, per-model-bound interface. kindFor, resolveDerivedFields, validFieldNames, promptSchema, checkRequired. No I/O.',
        read: '5 min',
        tags: ['architecture', 'core'],
        icon: 'schema',
      },
      {
        slug: 'analysis-layer',
        label: 'Analysis layer',
        status: 'new',
        file: '06-the-three-layers-up-close/analysis-layer.md',
        blurb: 'The per-model-bound, per-request interface. extractEdges, buildEmbeddingText. The substrate Part III\'s analysis tools call into.',
        read: '5 min',
        tags: ['architecture', 'analysis'],
        icon: 'brain',
      },
    ],
  },
  {
    num: 'VII',
    title: 'Auth & Transport',
    blurb: 'OAuth 2.0 the spec-compliant way — PRM, DCR, PKCE, resource indicators — plus the dual transport story (stdio for local, HTTP for multi-user) and the observability primitives built on top.',
    guides: [
      {
        slug: 'oauth2-discovery',
        label: 'OAuth 2.0 Discovery',
        status: 'live',
        file: '07-auth-and-transport/oauth2-discovery.md',
        blurb: 'RFC 9728 PRM · RFC 8414 server metadata · RFC 7591 DCR · RFC 7636 PKCE · RFC 8707 resource indicators.',
        read: '9 min',
        tags: ['auth', 'rfc'],
        icon: 'key',
      },
      {
        slug: 'transport',
        label: 'Transport & observability',
        status: 'live',
        file: '07-auth-and-transport/transport.md',
        blurb: 'StdioServer vs HttpServer from one factory; structured logging, distributed tracing, error tracking, request-ID correlation.',
        read: '6 min',
        tags: ['transport', 'observability'],
        icon: 'globe',
      },
    ],
  },
  {
    num: 'VIII',
    title: 'Domain Knowledge',
    blurb: 'Models tell the framework about your data. Domain tells the framework about your business — the declarative layer of concepts, business rules, multi-step workflow definitions, and diagram templates the LLM can reach for.',
    guides: [
      {
        slug: 'domain-knowledge',
        extension: { kind: 'registry', what: 'Register concepts · rules · workflows · diagrams' },
        label: 'Domain knowledge framework',
        status: 'live',
        file: '08-domain-knowledge/domain-knowledge.md',
        blurb: 'DomainConcept, BusinessRule, WorkflowDefinition, DomainModule — the declarative domain registry and how to wire it with InMemoryDomainAdapter.',
        read: '24 min',
        tags: ['domain'],
        icon: 'globe',
      },
      {
        slug: 'domain-adapters',
        extension: { kind: 'override', what: 'Implement a custom DomainAdapter' },
        label: 'Domain adapters',
        status: 'new',
        file: '08-domain-knowledge/domain-adapters.md',
        blurb: 'DomainAdapter interface and InMemoryDomainAdapter — storage backends for domain registries, rule evaluation semantics, and the remote-adapter roadmap.',
        read: '4 min',
        tags: ['domain', 'adapter'],
        icon: 'layers',
      },
    ],
  },
  {
    num: 'IX',
    title: 'Retrieval & GraphRAG',
    blurb: 'mcp-rune\'s retrieval stack: records become vectors, a relationship graph, and domain-grounded memories you can query by meaning, aggregate, or stratified sample — map-reduce over thousands of rows without flooding the context window.',
    guides: [
      {
        slug: 'analysis-quickstart',
        series: { name: 'Quickstart', part: 2, total: 2 },
        label: 'Analysis quickstart',
        status: 'new',
        file: '09-retrieval-and-graphrag/analysis-quickstart.md',
        blurb: 'Part 2 of the Quickstart: bring up pgvector and walk all five summary strategies end to end against the bookshelf-graph fixtures.',
        read: '12 min',
        tags: ['analysis', 'tutorial'],
        icon: 'bolt',
      },
      {
        slug: 'retrieval-graphrag',
        label: 'GraphRAG overview',
        status: 'new',
        file: '09-retrieval-and-graphrag/retrieval-graphrag.md',
        blurb: 'Start here. How vectors, a relationship graph, and domain grounding combine into GraphRAG over your own models — and which guide owns each piece.',
        read: '7 min',
        tags: ['retrieval', 'graphrag'],
        icon: 'net',
      },
      {
        slug: 'analysis-memories',
        label: 'Analysis memories',
        status: 'live',
        file: '09-retrieval-and-graphrag/analysis-memories.md',
        blurb: 'The six analysis_* tools: ingest thousands of paginated records, embed findings into local pgvector, recall by meaning. The engine under GraphRAG.',
        read: '22 min',
        tags: ['retrieval', 'vector'],
        icon: 'brain',
      },
      {
        slug: 'summary-strategies',
        extension: { kind: 'strategy', what: 'Implement a custom summary strategy' },
        label: 'Summary strategies',
        status: 'live',
        file: '09-retrieval-and-graphrag/summary-strategies.md',
        blurb: 'Nine page-summary strategies — five field-level, four GraphRAG-aware (edges + domain). The LLM\'s semantic starter pack.',
        read: '5 min',
        tags: ['retrieval', 'strategy'],
        icon: 'brain',
      },
      {
        slug: 'proximity-sampling',
        label: 'Proximity sampling',
        status: 'live',
        file: '09-retrieval-and-graphrag/proximity-sampling.md',
        blurb: 'Date-windowed, bucket-stratified sampling for analysis_query — representative records around a date, not the densest day.',
        read: '6 min',
        tags: ['retrieval', 'sampling'],
        icon: 'sample',
      },
      {
        slug: 'transient-context',
        label: 'Transient context protocol',
        status: 'live',
        file: '09-retrieval-and-graphrag/transient-context.md',
        blurb: 'Server-to-client protocol for collapsing transient tool results after a follow-up call has consumed them.',
        read: '5 min',
        tags: ['protocol', 'context'],
        icon: 'ghost',
      },
    ],
  },
  {
    num: 'X',
    title: 'Extensions',
    blurb: 'Add new capability on top of the framework without forking — HTTP routes, tool-flow hooks, custom MCP apps, and DataLayer verbs beyond plain CRUD. The seams every chapter so far has been hinting at.',
    guides: [
      {
        slug: 'extensibility',
        label: 'Extensions overview',
        status: 'live',
        file: '10-extensions/extensibility.md',
        blurb: 'Tour the seams: convention, client, data layer, search shaper, and the three extension shapes.',
        read: '3 min',
        tags: ['overview'],
        icon: 'layers',
      },
      {
        slug: 'extension-recipes',
        extension: { kind: 'hub', what: 'Recipes — start here to pick the right extension surface' },
        label: 'Extension recipes',
        status: 'live',
        file: '10-extensions/extension-recipes.md',
        blurb: 'Inverse map — "I want to do X, which seam does that?" Copy-pasteable starting points for the common extension patterns.',
        read: '9 min',
        tags: ['extensions', 'cookbook'],
        icon: 'book',
      },
      {
        slug: 'authoring-extensions',
        extension: { kind: 'plugin', what: 'Walk through writing an extension end to end' },
        label: 'Authoring extensions',
        status: 'live',
        file: '10-extensions/authoring-extensions.md',
        blurb: 'End-to-end walkthrough of writing an extension from scratch. Pick HttpExtension or ToolFlowExtension based on lifetime.',
        read: '7 min',
        tags: ['extensions', 'authoring'],
        icon: 'book',
      },
      {
        slug: 'api-extensions',
        extension: { kind: 'plugin', what: 'Author API extensions — tools + DataLayer methods' },
        label: 'API extensions',
        status: 'live',
        file: '10-extensions/api-extensions.md',
        blurb: 'Contribute MCP tools and DataLayer mixin methods beyond pure CRUD — custom verbs, search subsystems, bulk operations, RPC.',
        read: '7 min',
        tags: ['extensions', 'api'],
        icon: 'net',
      },
      {
        slug: 'tool-flow-extension',
        extension: { kind: 'plugin', what: 'Author tool-flow extensions' },
        label: 'Tool-flow extensions',
        status: 'live',
        file: '10-extensions/tool-flow-extension.md',
        blurb: 'Sibling to HttpExtension: modify the MCP tool surface and the runtime context threaded into app tool handlers.',
        read: '7 min',
        tags: ['extensions', 'tools'],
        icon: 'flow',
      },
      {
        slug: 'extensions-http',
        extension: { kind: 'plugin', what: 'Author HTTP extensions (routes + middleware)' },
        label: 'HTTP extensions',
        status: 'live',
        file: '10-extensions/extensions-http.md',
        blurb: 'Opt-in HTTP extensions add routes and middleware on top of the framework\'s OAuth, status, and MCP transport endpoints.',
        read: '4 min',
        tags: ['extensions', 'http'],
        icon: 'wrench',
      },
      {
        slug: 'custom-app',
        extension: { kind: 'plugin', what: 'Write a custom MCP app' },
        label: 'Writing a custom MCP app',
        status: 'live',
        file: '10-extensions/custom-app.md',
        blurb: 'Build an additional MCP app: kind taxonomy, formatter registry, form-schema generator, selection store, theming.',
        read: '7 min',
        tags: ['apps', 'authoring'],
        icon: 'app',
      },
    ],
  },
  {
    num: 'XI',
    title: 'Reference',
    blurb: 'API surface and configuration reference — subpath imports, database tables, and environment variables.',
    guides: [
      {
        slug: 'subpath-imports',
        label: 'Subpath imports',
        status: 'live',
        file: '11-reference/subpath-imports.md',
        blurb: 'Every subpath the package exposes and what lives where.',
        read: '4 min',
        tags: ['reference'],
        icon: 'book',
      },
      {
        slug: 'database-reference',
        label: 'Database reference',
        status: 'live',
        file: '11-reference/database-reference.md',
        blurb: 'PostgreSQL + pgvector tables, migration runner pattern, full env-var reference.',
        read: '6 min',
        tags: ['reference', 'analysis'],
        icon: 'brain',
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
