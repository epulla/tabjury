import { storage } from 'wxt/utils/storage';
import { DEFAULTS, migrate, type Settings } from '../core/settings';

export const settingsItem = storage.defineItem<Settings>('sync:settings', { fallback: DEFAULTS });
export async function getSettings(): Promise<Settings> { return migrate(await settingsItem.getValue()); }
export const freshTabs = storage.defineItem<Record<number, number>>('session:freshTabs', { fallback: {} });
export const recentlyDeduped = storage.defineItem<Record<string, number>>('session:recentlyDeduped', { fallback: {} });
export const pausedUntil = storage.defineItem<number>('session:pausedUntil', { fallback: 0 });
export const lastDedupe = storage.defineItem<{ url: string; title: string; windowId: number; index: number; at: number } | null>('session:lastDedupe', { fallback: null });
