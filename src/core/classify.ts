import type { Browser } from 'wxt/browser';
import type { Settings } from './settings';
import { normalizeUrl } from './url';

export type Tab = Browser.tabs.Tab & { lastAccessed?: number; frozen?: boolean };
export type DupGroup = { key: string; keep: Tab; extras: Tab[] };
export type InactiveHit = { tab: Tab; native: boolean; stale: boolean; idleMs: number };

export function tabKey(tab: Tab, s: Settings): string | null {
  const url = normalizeUrl(tab.url ?? tab.pendingUrl ?? '', s.matching);
  if (!url) return null;
  return `${tab.incognito ? 'i' : 'n'}|${s.detectScope === 'window' ? `${tab.windowId}|` : ''}${url}`;
}

export function findDuplicates(tabs: Tab[], s: Settings): DupGroup[] {
  const groups = new Map<string, Tab[]>();
  for (const tab of tabs) {
    const key = tabKey(tab, s);
    if (key) groups.set(key, [...(groups.get(key) ?? []), tab]);
  }
  return [...groups].flatMap(([key, members]) => {
    if (members.length < 2) return [];
    const rank = (tab: Tab) => (tab.pinned ? 2 : tab.active ? 1 : 0);
    const sorted = [...members].sort(
      (a, b) =>
        rank(b) - rank(a) || (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0) || (a.id ?? 0) - (b.id ?? 0),
    );
    return [
      {
        key,
        keep: sorted[0]!,
        extras: sorted
          .slice(1)
          .sort((a, b) => (a.lastAccessed ?? 0) - (b.lastAccessed ?? 0) || (a.id ?? 0) - (b.id ?? 0)),
      },
    ];
  });
}

export function findInactive(tabs: Tab[], s: Settings, now: number): InactiveHit[] {
  return tabs
    .flatMap((tab) => {
      if (tab.active || !tabKey(tab, s)) return [];
      const native = !!(tab.discarded || tab.frozen),
        idleMs = tab.lastAccessed ? now - tab.lastAccessed : 0;
      const stale = tab.lastAccessed !== undefined && idleMs > s.inactiveMinutes * 60_000;
      const include =
        s.inactiveSource === 'native'
          ? native
          : s.inactiveSource === 'timer'
            ? stale
            : s.inactiveSource === 'either'
              ? native || stale
              : native && stale;
      return include ? [{ tab, native, stale, idleMs }] : [];
    })
    .sort((a, b) => b.idleMs - a.idleMs);
}

export function isProtected(tab: Tab, s: Settings, now: number): boolean {
  if (
    (s.protect.active && tab.active) ||
    (s.protect.pinned && !!tab.pinned) ||
    (s.protect.audible && !!tab.audible) ||
    (s.protect.grouped && tab.groupId !== undefined && tab.groupId !== -1)
  )
    return true;
  if (tab.lastAccessed && now - tab.lastAccessed < s.protect.recentMinutes * 60_000) return true;
  try {
    const hostname = new URL(tab.url ?? '').hostname.toLowerCase();
    return s.protect.domains.some(
      (domain) => hostname === domain.toLowerCase() || hostname.endsWith(`.${domain.toLowerCase()}`),
    );
  } catch {
    return false;
  }
}
