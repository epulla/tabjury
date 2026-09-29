import type { Settings } from './settings';
import type { DupGroup, InactiveHit } from './classify';
import { isProtected } from './classify';

export type Action = { kind: 'close' | 'discard'; tabId: number; reason: 'duplicate' | 'inactive' };

export function decide(dups: DupGroup[], inactive: InactiveHit[], s: Settings, now: number): Action[] {
  const actions: Action[] = [],
    seen = new Set<number>();
  if (s.duplicates === 'auto')
    for (const { extras } of dups)
      for (const tab of extras)
        if (tab.id !== undefined && !seen.has(tab.id) && !isProtected(tab, s, now)) {
          actions.push({ kind: 'close', tabId: tab.id, reason: 'duplicate' });
          seen.add(tab.id);
        }
  if (s.inactive === 'discard' || s.inactive === 'close')
    for (const hit of inactive) {
      const { tab, idleMs } = hit;
      if (tab.id === undefined || seen.has(tab.id) || isProtected(tab, s, now)) continue;
      const close = s.inactive === 'close' && idleMs > s.closeMinutes * 60_000;
      if (close || !tab.discarded) {
        actions.push({ kind: close ? 'close' : 'discard', tabId: tab.id, reason: 'inactive' });
        seen.add(tab.id);
      }
    }
  return actions.slice(0, s.auto.batchCap);
}
