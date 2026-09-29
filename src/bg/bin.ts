import type { Tab } from '../core/classify';
import { normalizeUrl } from '../core/url';
import type { Settings } from '../core/settings';
import { storage } from 'wxt/utils/storage';

export type BinEntry = {
  id: string;
  url: string;
  title: string;
  favIconUrl?: string;
  closedAt: number;
  reason: 'dedupe' | 'duplicate' | 'inactive' | 'manual';
  windowId: number;
  index: number;
  sessionId?: string;
};
export const binItem = storage.defineItem<BinEntry[]>('local:bin', { fallback: [] });

export async function addToBin(tab: Tab, reason: BinEntry['reason'], s: Settings): Promise<void> {
  if (!tab.url || !normalizeUrl(tab.url, s.matching)) return;
  const entry: BinEntry = {
    id: crypto.randomUUID(),
    url: tab.url,
    title: tab.title ?? tab.url,
    favIconUrl: tab.favIconUrl,
    closedAt: Date.now(),
    reason,
    windowId: tab.windowId,
    index: tab.index,
  };
  const cutoff = entry.closedAt - s.bin.retentionDays * 86_400_000;
  await binItem.setValue(
    [entry, ...(await binItem.getValue()).filter((item) => item.closedAt >= cutoff)].slice(
      0,
      s.bin.maxEntries,
    ),
  );
}

export async function restore(id: string): Promise<void> {
  const entries = await binItem.getValue(),
    entry = entries.find((item) => item.id === id);
  if (!entry) return;
  await binItem.setValue(entries.filter((item) => item.id !== id));
  try {
    const sessions = await browser.sessions.getRecentlyClosed();
    const session = sessions.find((item) => item.tab?.url === entry.url);
    if (session?.tab?.sessionId) {
      await browser.sessions.restore(session.tab.sessionId);
      return;
    }
  } catch {
    /* unavailable session is okay */
  }
  try {
    await browser.tabs.create({ url: entry.url, windowId: entry.windowId, index: entry.index });
  } catch {
    await browser.tabs.create({ url: entry.url });
  }
}
