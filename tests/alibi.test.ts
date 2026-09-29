import { describe, expect, it } from 'vitest';
import { findAlibi, type Alibi } from '../src/core/alibi';
import { type Tab } from '../src/core/classify';

const tab = (overrides: Partial<Tab> = {}): Tab =>
  ({
    id: 1,
    windowId: 1,
    index: 0,
    active: false,
    pinned: false,
    highlighted: false,
    incognito: false,
    discarded: false,
    autoDiscardable: true,
    groupId: -1,
    url: 'https://a.com/x',
    ...overrides,
  }) as Tab;
const ctx = (overrides: Partial<Parameters<typeof findAlibi>[2]> = {}) => ({
  now: 100_000,
  recentlyDeduped: {},
  key: 'k',
  paused: false,
  ...overrides,
});

describe('alibi', () => {
  it.each<[Alibi | null, Tab, Tab, Parameters<typeof findAlibi>[2]]>([
    ['paused', tab(), tab({ active: true }), ctx({ paused: true })],
    ['active', tab(), tab({ active: true }), ctx()],
    ['opener', tab({ openerTabId: 2 }), tab({ id: 2 }), ctx()],
    ['recent', tab(), tab({ lastAccessed: 80_001 }), ctx()],
    ['two-strikes', tab(), tab(), ctx({ recentlyDeduped: { k: 90_001 } })],
    [null, tab(), tab(), ctx({ now: 200_000 })],
  ])('returns %s in order', (expected, fresh, existing, context) =>
    expect(findAlibi(fresh, existing, context)).toBe(expected),
  );
});
