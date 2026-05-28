// GitHub Milestones → Roadmap data shape.
//
// The roadmap is a curated surface. Issues only appear if they carry an explicit
// `status:*` label from the recognized set (shipped / in-progress / planned /
// researching / blocked). Issues without one are filtered out — the open/closed
// state of the issue does not promote it onto the page.

export type RoadmapStatus =
  | 'shipped'
  | 'progress'
  | 'planned'
  | 'research'
  | 'blocked';

export interface RoadmapItem {
  area: string;
  title: string;
  hint?: string;
  status: RoadmapStatus;
  issue?: string;
  url?: string;
}

export interface RoadmapMilestone {
  version: string;
  name?: string;
  blurb?: string;
  target?: string;
  status: string;
  accent?: boolean;
  isFuture?: boolean;
  items: RoadmapItem[];
}

export interface RoadmapData {
  source: string;
  fetchedAt: string;
  openIssueCount: number;
  milestones: RoadmapMilestone[];
}

export interface GithubLabel {
  name: string;
}

export interface GithubMilestone {
  number: number;
  title: string;
  description: string | null;
  state: 'open' | 'closed';
  due_on: string | null;
  open_issues: number;
  closed_issues: number;
}

export interface GithubIssue {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  labels: GithubLabel[];
  pull_request?: unknown;
}

const STATUS_ALIASES: Record<string, RoadmapStatus> = {
  shipped: 'shipped',
  'in-progress': 'progress',
  progress: 'progress',
  planned: 'planned',
  researching: 'research',
  research: 'research',
  blocked: 'blocked',
};

export function parseIssueLabels(labels: GithubLabel[]): {
  area: string;
  status: RoadmapStatus | null;
} {
  let area = '—';
  let status: RoadmapStatus | null = null;
  let areaFound = false;

  for (const label of labels) {
    const name = label.name.trim().toLowerCase();
    if (!areaFound && name.startsWith('area:')) {
      const value = name.slice('area:'.length).trim();
      if (value) {
        area = value;
        areaFound = true;
      }
    } else if (!status && name.startsWith('status:')) {
      const value = name.slice('status:'.length).trim();
      const mapped = STATUS_ALIASES[value];
      if (mapped) status = mapped;
    }
  }

  return { area, status };
}

export function formatTarget(dueOn: string | null): string | undefined {
  if (!dueOn) return undefined;
  const d = new Date(dueOn);
  if (Number.isNaN(d.getTime())) return undefined;
  const quarter = Math.floor(d.getUTCMonth() / 3) + 1;
  return `Q${quarter} ${d.getUTCFullYear()}`;
}

function firstParagraph(body: string | null): string | undefined {
  if (!body) return undefined;
  const trimmed = body.replace(/\r\n/g, '\n').trim();
  if (!trimmed) return undefined;
  const [first] = trimmed.split(/\n{2,}/);
  return first.replace(/\n/g, ' ').trim() || undefined;
}

function splitMilestoneDescription(description: string | null): {
  name?: string;
  blurb?: string;
} {
  if (!description) return {};
  const text = description.replace(/\r\n/g, '\n').trim();
  if (!text) return {};
  const lines = text.split('\n');
  const firstLine = lines[0]?.trim() ?? '';
  if (firstLine.endsWith('...') || firstLine.endsWith('…')) {
    const name = firstLine.replace(/[.…]+$/, '').trim();
    const blurb = lines.slice(1).join('\n').trim() || undefined;
    return { name: name || undefined, blurb };
  }
  return { blurb: text };
}

function isFutureTitle(title: string): boolean {
  return title.trim().toLowerCase() === 'future';
}

// Semver-ish ascending: parse the dotted numeric prefix; non-numeric titles sort last.
function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map((p) => parseInt(p, 10));
  const partsB = b.split('.').map((p) => parseInt(p, 10));
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const av = Number.isFinite(partsA[i]) ? partsA[i] : -1;
    const bv = Number.isFinite(partsB[i]) ? partsB[i] : -1;
    if (av !== bv) return av - bv;
  }
  return a.localeCompare(b);
}

function deriveStatusCaption(m: GithubMilestone, isFuture: boolean): string {
  if (isFuture) return 'RESEARCHING';
  if (m.state === 'closed') return 'NOW SHIPPING';
  return 'UPCOMING';
}

export function mapMilestonesToRoadmap(
  milestones: GithubMilestone[],
  issuesByMilestone: Map<number, GithubIssue[]>,
  opts: { source?: string; now?: Date } = {},
): RoadmapData {
  const source = opts.source ?? 'github.com/mcp-rune/mcp-rune/milestones';
  const fetchedAt = (opts.now ?? new Date()).toISOString();

  const open = milestones
    .filter((m) => m.state === 'open' && !isFutureTitle(m.title))
    .sort((a, b) => compareVersions(a.title, b.title));
  const closed = milestones
    .filter((m) => m.state === 'closed' && !isFutureTitle(m.title))
    .sort((a, b) => compareVersions(a.title, b.title));
  const future = milestones.filter((m) => isFutureTitle(m.title));

  const ordered = [...open, ...closed, ...future];

  // Accent rule: the lowest-numbered open milestone, OR the highest-numbered
  // closed milestone if no open milestones exist.
  let accentNumber: number | undefined;
  if (open.length > 0) accentNumber = open[0].number;
  else if (closed.length > 0) accentNumber = closed[closed.length - 1].number;

  let openIssueCount = 0;
  const mapped: RoadmapMilestone[] = ordered.map((m) => {
    const future = isFutureTitle(m.title);
    const rawIssues = (issuesByMilestone.get(m.number) ?? []).filter(
      (i) => !i.pull_request,
    );

    const items: RoadmapItem[] = [];
    for (const issue of rawIssues) {
      const { area, status } = parseIssueLabels(issue.labels);
      if (!status) continue; // status:* label is REQUIRED — drop the issue otherwise
      items.push({
        area,
        title: issue.title,
        hint: firstParagraph(issue.body),
        status: future ? 'research' : status,
        issue: String(issue.number),
        url: issue.html_url,
      });
      if (issue.state === 'open') openIssueCount++;
    }

    const { name, blurb } = splitMilestoneDescription(m.description);
    return {
      version: m.title,
      name,
      blurb,
      target: future ? undefined : formatTarget(m.due_on),
      status: deriveStatusCaption(m, future),
      accent: !future && m.number === accentNumber,
      isFuture: future || undefined,
      items,
    };
  });

  return {
    source,
    fetchedAt,
    openIssueCount,
    milestones: mapped,
  };
}

const GITHUB_API = 'https://api.github.com';

async function ghGet<T>(url: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'mcp-rune-site',
      },
    });
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(`[roadmap] GitHub ${res.status} for ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[roadmap] fetch failed for ${url}:`, err);
    return null;
  }
}

export async function fetchRoadmap(opts: {
  owner: string;
  repo: string;
  token?: string;
}): Promise<RoadmapData | null> {
  const { owner, repo, token } = opts;
  if (!token) return null;

  const source = `github.com/${owner}/${repo}/milestones`;
  const milestones = await ghGet<GithubMilestone[]>(
    `${GITHUB_API}/repos/${owner}/${repo}/milestones?state=all&per_page=100`,
    token,
  );
  if (!milestones) return null;

  const issuesByMilestone = new Map<number, GithubIssue[]>();
  for (const m of milestones) {
    const issues = await ghGet<GithubIssue[]>(
      `${GITHUB_API}/repos/${owner}/${repo}/issues?milestone=${m.number}&state=all&per_page=100`,
      token,
    );
    issuesByMilestone.set(m.number, issues ?? []);
  }

  return mapMilestonesToRoadmap(milestones, issuesByMilestone, { source });
}
