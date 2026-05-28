import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchRoadmap,
  formatTarget,
  mapMilestonesToRoadmap,
  parseIssueLabels,
  type GithubIssue,
  type GithubMilestone,
} from './github-milestones';

function milestone(overrides: Partial<GithubMilestone>): GithubMilestone {
  return {
    number: 1,
    title: '0.2',
    description: null,
    state: 'open',
    due_on: null,
    open_issues: 0,
    closed_issues: 0,
    ...overrides,
  };
}

function issue(overrides: Partial<GithubIssue>): GithubIssue {
  return {
    number: 100,
    title: 'Sample issue',
    body: null,
    state: 'open',
    html_url: 'https://github.com/mcp-rune/mcp-rune/issues/100',
    labels: [],
    ...overrides,
  };
}

const NOW = new Date('2026-05-28T00:00:00Z');

describe('parseIssueLabels', () => {
  it('extracts area and status when both present', () => {
    expect(
      parseIssueLabels([{ name: 'area:core' }, { name: 'status:blocked' }]),
    ).toEqual({ area: 'core', status: 'blocked' });
  });

  it('returns "—" area and null status when no labels match', () => {
    expect(parseIssueLabels([])).toEqual({ area: '—', status: null });
    expect(parseIssueLabels([{ name: 'kind:bug' }])).toEqual({
      area: '—',
      status: null,
    });
  });

  it('keeps the first area label when multiple are present', () => {
    expect(
      parseIssueLabels([{ name: 'area:core' }, { name: 'area:cli' }]),
    ).toEqual({ area: 'core', status: null });
  });

  it('accepts both status:in-progress and status:progress', () => {
    expect(parseIssueLabels([{ name: 'status:in-progress' }]).status).toBe(
      'progress',
    );
    expect(parseIssueLabels([{ name: 'status:progress' }]).status).toBe(
      'progress',
    );
  });

  it('accepts both status:researching and status:research', () => {
    expect(parseIssueLabels([{ name: 'status:researching' }]).status).toBe(
      'research',
    );
    expect(parseIssueLabels([{ name: 'status:research' }]).status).toBe(
      'research',
    );
  });

  it('treats unknown status:* values as no label', () => {
    expect(parseIssueLabels([{ name: 'status:bogus' }]).status).toBeNull();
  });
});

describe('formatTarget', () => {
  it('formats ISO dates as quarters', () => {
    expect(formatTarget('2026-09-30T00:00:00Z')).toBe('Q3 2026');
    expect(formatTarget('2026-01-15T00:00:00Z')).toBe('Q1 2026');
    expect(formatTarget('2027-12-31T00:00:00Z')).toBe('Q4 2027');
  });

  it('returns undefined for null or invalid input', () => {
    expect(formatTarget(null)).toBeUndefined();
    expect(formatTarget('not-a-date')).toBeUndefined();
  });
});

describe('mapMilestonesToRoadmap', () => {
  it('returns an empty payload when no milestones exist', () => {
    const result = mapMilestonesToRoadmap([], new Map(), { now: NOW });
    expect(result).toEqual({
      source: 'github.com/mcp-rune/mcp-rune/milestones',
      fetchedAt: NOW.toISOString(),
      openIssueCount: 0,
      milestones: [],
    });
  });

  it('filters out issues that lack a status:* label', () => {
    const m = milestone({ number: 1, title: '0.2', state: 'open' });
    const issues = new Map<number, GithubIssue[]>([
      [
        1,
        [
          issue({
            number: 10,
            title: 'In progress one',
            labels: [{ name: 'area:core' }, { name: 'status:in-progress' }],
          }),
          issue({
            number: 11,
            title: 'Planned one',
            labels: [{ name: 'area:cli' }, { name: 'status:planned' }],
          }),
          issue({
            number: 12,
            title: 'Unlabelled — should be dropped',
            labels: [{ name: 'kind:bug' }],
          }),
        ],
      ],
    ]);
    const result = mapMilestonesToRoadmap([m], issues, { now: NOW });
    expect(result.milestones).toHaveLength(1);
    expect(result.milestones[0].items.map((i) => i.title)).toEqual([
      'In progress one',
      'Planned one',
    ]);
    expect(result.openIssueCount).toBe(2);
  });

  it('does not promote a closed issue without a status label', () => {
    const m = milestone({ number: 2, title: '0.1', state: 'closed' });
    const issues = new Map<number, GithubIssue[]>([
      [
        2,
        [
          issue({
            number: 20,
            title: 'Shipped one',
            state: 'closed',
            labels: [{ name: 'status:shipped' }],
          }),
          issue({
            number: 21,
            title: 'No label — drop',
            state: 'closed',
            labels: [],
          }),
        ],
      ],
    ]);
    const result = mapMilestonesToRoadmap([m], issues, { now: NOW });
    expect(result.milestones[0].items).toHaveLength(1);
    expect(result.milestones[0].items[0]).toMatchObject({
      title: 'Shipped one',
      status: 'shipped',
    });
  });

  it('treats the "Future" milestone specially (case-insensitive, no target, forces research status)', () => {
    const ms = [
      milestone({ number: 1, title: '0.2', state: 'open', due_on: '2026-09-30T00:00:00Z' }),
      milestone({ number: 9, title: 'future', state: 'open', due_on: '2027-01-01T00:00:00Z' }),
    ];
    const issues = new Map<number, GithubIssue[]>([
      [
        1,
        [issue({ number: 1, labels: [{ name: 'status:planned' }] })],
      ],
      [
        9,
        [
          issue({
            number: 99,
            title: 'Edge runtime',
            labels: [{ name: 'area:core' }, { name: 'status:planned' }],
          }),
        ],
      ],
    ]);
    const result = mapMilestonesToRoadmap(ms, issues, { now: NOW });
    const future = result.milestones.find((m) => m.isFuture);
    expect(future).toBeDefined();
    expect(future!.target).toBeUndefined();
    expect(future!.items[0].status).toBe('research');
    expect(future!.status).toBe('RESEARCHING');
  });

  it('orders milestones: open (semver asc) → closed (semver asc) → Future', () => {
    const ms = [
      milestone({ number: 1, title: '1.0', state: 'open' }),
      milestone({ number: 2, title: '0.3', state: 'open' }),
      milestone({ number: 3, title: '0.1', state: 'closed' }),
      milestone({ number: 4, title: '0.2', state: 'open' }),
      milestone({ number: 5, title: 'Future', state: 'open' }),
    ];
    const result = mapMilestonesToRoadmap(ms, new Map(), { now: NOW });
    expect(result.milestones.map((m) => m.version)).toEqual([
      '0.2',
      '0.3',
      '1.0',
      '0.1',
      'Future',
    ]);
  });

  it('marks the lowest-numbered open milestone as accent', () => {
    const ms = [
      milestone({ number: 1, title: '1.0', state: 'open' }),
      milestone({ number: 2, title: '0.2', state: 'open' }),
      milestone({ number: 3, title: '0.1', state: 'closed' }),
    ];
    const result = mapMilestonesToRoadmap(ms, new Map(), { now: NOW });
    const accented = result.milestones.filter((m) => m.accent);
    expect(accented).toHaveLength(1);
    expect(accented[0].version).toBe('0.2');
  });

  it('falls back accent to the highest-numbered closed milestone when no open ones exist', () => {
    const ms = [
      milestone({ number: 1, title: '0.1', state: 'closed' }),
      milestone({ number: 2, title: '0.2', state: 'closed' }),
    ];
    const result = mapMilestonesToRoadmap(ms, new Map(), { now: NOW });
    expect(result.milestones.find((m) => m.accent)?.version).toBe('0.2');
  });

  it('keeps a milestone block even when every issue is filtered out', () => {
    const m = milestone({ number: 1, title: '0.2', state: 'open' });
    const issues = new Map<number, GithubIssue[]>([
      [
        1,
        [issue({ number: 10, title: 'No labels', labels: [] })],
      ],
    ]);
    const result = mapMilestonesToRoadmap([m], issues, { now: NOW });
    expect(result.milestones).toHaveLength(1);
    expect(result.milestones[0].items).toEqual([]);
  });

  it('splits milestone.description into name + blurb when the first line ends with ...', () => {
    const m = milestone({
      number: 1,
      title: '0.2',
      description: 'The Year of API Stability...\n\nLock the public API surface before 1.0.',
    });
    const result = mapMilestonesToRoadmap([m], new Map(), { now: NOW });
    expect(result.milestones[0].name).toBe('The Year of API Stability');
    expect(result.milestones[0].blurb).toBe('Lock the public API surface before 1.0.');
  });
});

describe('fetchRoadmap', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns null when no token is provided and does not call fetch', async () => {
    const spy = vi.fn();
    globalThis.fetch = spy as unknown as typeof fetch;
    const result = await fetchRoadmap({ owner: 'mcp-rune', repo: 'mcp-rune' });
    expect(result).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns null when the milestones endpoint returns 401', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('nope', { status: 401 })) as unknown as typeof fetch;
    const result = await fetchRoadmap({
      owner: 'mcp-rune',
      repo: 'mcp-rune',
      token: 'fake',
    });
    expect(result).toBeNull();
  });

  it('returns an empty RoadmapData when the API responds with no milestones', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ) as unknown as typeof fetch;
    const result = await fetchRoadmap({
      owner: 'mcp-rune',
      repo: 'mcp-rune',
      token: 'fake',
    });
    expect(result).not.toBeNull();
    expect(result!.milestones).toEqual([]);
    expect(result!.source).toBe('github.com/mcp-rune/mcp-rune/milestones');
  });
});
