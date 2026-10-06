import { describe, expect, it } from 'vitest';
import { DEFAULTS } from '../src/core/settings';
import { findDuplicates, findInactive, isProtected, tabKey, type Tab } from '../src/core/classify';

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

describe('classify', () => {
  it('groups duplicates and keeps pinned, active, then newest', () => {
    const tabs = [
      tab({ id: 3, lastAccessed: 30 }),
      tab({ id: 2, active: true, lastAccessed: 1 }),
      tab({ id: 1, pinned: true, lastAccessed: 0 }),
    ];
    const [group] = findDuplicates(tabs, DEFAULTS);
    expect(group!.keep.id).toBe(1);
    expect(group!.extras.map((x) => x.id)).toEqual([2, 3]);
  });
  it('separates incognito and window scope, ignores internal URLs', () => {
    const all = findDuplicates(
      [tab({ id: 1 }), tab({ id: 2, incognito: true }), tab({ id: 3, windowId: 2 })],
      DEFAULTS,
    );
    expect(all).toHaveLength(1);
    expect(tabKey(tab({ url: 'chrome://newtab' }), DEFAULTS)).toBeNull();
    expect(
      findDuplicates([tab({ id: 1 }), tab({ id: 2, windowId: 2 })], { ...DEFAULTS, detectScope: 'window' }),
    ).toHaveLength(0);
  });
  it.each([
    ['native', true, false, true],
    ['native', false, true, false],
    ['native', true, true, true],
    ['native', false, false, false],
    ['timer', true, false, false],
    ['timer', false, true, true],
    ['timer', true, true, true],
    ['timer', false, false, false],
    ['either', true, false, true],
    ['either', false, true, true],
    ['either', true, true, true],
    ['either', false, false, false],
    ['both', true, false, false],
    ['both', false, true, false],
    ['both', true, true, true],
    ['both', false, false, false],
  ])('finds inactive for %s native=%s stale=%s', (source, native, stale, found) => {
    const now = 120_000,
      tabs = [tab({ id: 1, discarded: native, lastAccessed: stale ? 1 : 119_999 })];
    expect(
      findInactive(tabs, { ...DEFAULTS, inactiveSource: source as never, inactiveMinutes: 1 }, now),
    ).toHaveLength(found ? 1 : 0);
  });
  it('uses closeMinutes as stale threshold in close mode', () => {
    const s = { ...DEFAULTS, inactive: 'close' as const, closeMinutes: 10, inactiveMinutes: 60, inactiveSource: 'timer' as const };
    expect(findInactive([tab({ lastAccessed: 1 })], s, 11 * 60_000)).toHaveLength(1);
  });
  it('skips active tabs and sorts by idle time', () => {
    const now = 100_000,
      s = { ...DEFAULTS, inactiveSource: 'timer' as const, inactiveMinutes: 1 };
    const hits = findInactive(
      [
        tab({ id: 1, lastAccessed: 2 }),
        tab({ id: 2, active: true, lastAccessed: 1 }),
        tab({ id: 3, lastAccessed: 1 }),
      ],
      s,
      now,
    );
    expect(hits.map((x) => x.tab.id)).toEqual([3, 1]);
  });
  it.each([
    [{ active: true }, true],
    [{ pinned: true }, true],
    [{ audible: true }, true],
    [{ groupId: 4 }, true],
    [{ url: 'https://sub.example.com/x' }, true],
    [{ url: 'https://other.com/x' }, false],
    [{ url: 'https://web.whatsapp.com/' }, true],
  ])('protects %o', (overrides, expected) =>
    expect(
      isProtected(
        tab(overrides),
        { ...DEFAULTS, protect: { ...DEFAULTS.protect, domains: ['example.com', 'https://web.whatsapp.com/'] } },
        100_000,
      ),
    ).toBe(expected),
  );
});
