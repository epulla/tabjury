import { describe, expect, it } from 'vitest';
import { DEFAULTS, type Settings } from '../src/core/settings';
import { decide } from '../src/core/policy';
import type { DupGroup, InactiveHit, Tab } from '../src/core/classify';

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
    url: 'https://a.com',
    ...overrides,
  }) as Tab;
const settings = (overrides: Partial<Settings> = {}): Settings => ({ ...DEFAULTS, ...overrides });
const hit = (t: Tab, idleMs: number): InactiveHit => ({ tab: t, native: false, stale: true, idleMs });
const group = (extras: Tab[]): DupGroup => ({ key: 'x', keep: tab({ id: 99 }), extras });

describe('policy', () => {
  it('produces nothing for detect levels', () =>
    expect(decide([group([tab({ id: 2 })])], [hit(tab({ id: 3 }), 1)], settings(), 0)).toEqual([]));
  it('closes auto duplicate extras and skips protected extras', () => {
    expect(
      decide(
        [group([tab({ id: 2, pinned: true }), tab({ id: 3 })])],
        [],
        settings({ duplicates: 'auto' }),
        0,
      ),
    ).toEqual([{ kind: 'close', tabId: 3, reason: 'duplicate' }]);
  });
  it('skips discarded tabs in discard mode', () =>
    expect(
      decide(
        [],
        [hit(tab({ id: 2, discarded: true }), 1), hit(tab({ id: 3 }), 1)],
        settings({ inactive: 'discard' }),
        0,
      ),
    ).toEqual([{ kind: 'discard', tabId: 3, reason: 'inactive' }]));
  it('splits close mode by closeMinutes', () =>
    expect(
      decide(
        [],
        [hit(tab({ id: 2 }), 660001), hit(tab({ id: 3 }), 540001)],
        settings({ inactive: 'close', closeMinutes: 10 }),
        0,
      ),
    ).toEqual([
      { kind: 'close', tabId: 2, reason: 'inactive' },
      { kind: 'discard', tabId: 3, reason: 'inactive' },
    ]));
  it('lets duplicate close win across lists', () =>
    expect(
      decide(
        [group([tab({ id: 2 })])],
        [hit(tab({ id: 2 }), 999)],
        settings({ duplicates: 'auto', inactive: 'discard' }),
        0,
      ),
    ).toEqual([{ kind: 'close', tabId: 2, reason: 'duplicate' }]));
  it('truncates to batchCap', () =>
    expect(
      decide(
        [group([tab({ id: 2 }), tab({ id: 3 })])],
        [hit(tab({ id: 4 }), 1)],
        settings({ duplicates: 'auto', inactive: 'discard', auto: { ...DEFAULTS.auto, batchCap: 2 } }),
        0,
      ),
    ).toHaveLength(2));
});
