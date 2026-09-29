import type { Tab } from './classify';

export type Alibi = 'active' | 'opener' | 'recent' | 'two-strikes' | 'paused';

export function findAlibi(
  fresh: Tab,
  existing: Tab,
  ctx: { now: number; recentlyDeduped: Record<string, number>; key: string; paused: boolean },
): Alibi | null {
  if (ctx.paused) return 'paused';
  if (existing.active && existing.windowId === fresh.windowId) return 'active';
  if (fresh.openerTabId === existing.id) return 'opener';
  if (existing.lastAccessed && ctx.now - existing.lastAccessed < 30_000) return 'recent';
  const deduped = ctx.recentlyDeduped[ctx.key];
  if (deduped && ctx.now - deduped < 15_000) return 'two-strikes';
  return null;
}
