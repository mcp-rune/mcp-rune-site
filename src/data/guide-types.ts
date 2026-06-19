// Guide registry types — shared by the data (`guide-sections.ts`) and the
// API + logic (`guides.ts`). Pure type declarations, no runtime values.

export type GuideStatus = 'live' | 'new' | 'wip' | 'soon';

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
