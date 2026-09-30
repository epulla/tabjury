import { storage } from 'wxt/utils/storage';
import { DEFAULTS, migrate, type Settings } from '../core/settings';
import type { Action } from '../core/policy';

export const settingsItem = storage.defineItem<Settings>('sync:settings', { fallback: DEFAULTS });
export async function getSettings(): Promise<Settings> {
  return migrate(await settingsItem.getValue());
}
export const freshTabs = storage.defineItem<Record<number, string | undefined>>('session:freshTabs', {
  fallback: {},
});
export const recentlyDeduped = storage.defineItem<Record<string, number>>('session:recentlyDeduped', {
  fallback: {},
});
export const pausedUntil = storage.defineItem<number>('session:pausedUntil', { fallback: 0 });
export const lastDedupe = storage.defineItem<{
  url: string;
  title: string;
  windowId: number;
  index: number;
  at: number;
} | null>('session:lastDedupe', { fallback: null });
export const pendingActions = storage.defineItem<Action[]>('session:pendingActions', { fallback: [] });
export type HistoryEntry = {
  at: number;
  kind: 'close' | 'discard';
  reason: 'duplicate' | 'inactive';
  title: string;
  url: string;
};
export const historyItem = storage.defineItem<HistoryEntry[]>('local:history', { fallback: [] });
