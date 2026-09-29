import type { Tab } from '../core/classify';
import { findAlibi } from '../core/alibi';
import { normalizeUrl } from '../core/url';
import { addToBin } from './bin';
import { freshTabs, getSettings, lastDedupe, pausedUntil, recentlyDeduped } from './state';

export function registerDedupe(): void {
  browser.tabs.onCreated.addListener(async (tab) => {
    if (tab.id === undefined) return;
    const fresh = await freshTabs.getValue();
    fresh[tab.id] = Date.now();
    await freshTabs.setValue(fresh);
    if (tab.pendingUrl) await handle(tab, tab.pendingUrl);
  });
  browser.tabs.onUpdated.addListener(async (id, change, tab) => {
    const fresh = await freshTabs.getValue();
    if (!fresh[id] || !change.url) return;
    delete fresh[id];
    await freshTabs.setValue(fresh);
    await handle(tab, change.url);
  });
  browser.tabs.onRemoved.addListener(async (id) => {
    const fresh = await freshTabs.getValue();
    delete fresh[id];
    await freshTabs.setValue(fresh);
  });
}

async function handle(fresh: Tab, url: string): Promise<void> {
  try {
    const s = await getSettings(),
      now = Date.now(),
      key = normalizeUrl(url, s.matching);
    if (!s.dedupeOnOpen || !key) return;
    const host = new URL(key).hostname;
    if (s.protect.domains.some((d) => host === d.toLowerCase() || host.endsWith(`.${d.toLowerCase()}`)))
      return;
    const tabs = await browser.tabs.query(s.dedupeScope === 'window' ? { windowId: fresh.windowId } : {}),
      candidates = tabs.filter(
        (tab) =>
          tab.id !== fresh.id &&
          tab.incognito === fresh.incognito &&
          normalizeUrl(tab.url ?? '', s.matching) === key,
      );
    const existing = candidates.sort(
      (a, b) =>
        Number(b.active) - Number(a.active) ||
        Number(b.pinned) - Number(a.pinned) ||
        (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0),
    )[0];
    if (!existing) return;
    const recent = await recentlyDeduped.getValue();
    if (
      findAlibi(fresh, existing, {
        now,
        recentlyDeduped: recent,
        key,
        paused: (await pausedUntil.getValue()) > now,
      })
    )
      return;
    recent[key] = now;
    await recentlyDeduped.setValue(recent);
    if (s.dedupeScope === 'all' && existing.windowId !== fresh.windowId)
      s.crossWindow === 'move'
        ? await browser.tabs.move(existing.id!, { windowId: fresh.windowId, index: -1 })
        : await browser.windows.update(existing.windowId, { focused: true });
    await browser.tabs.update(existing.id!, { active: true });
    await addToBin({ ...fresh, url, title: fresh.title ?? url }, 'dedupe', s);
    await lastDedupe.setValue({
      url,
      title: fresh.title ?? url,
      windowId: fresh.windowId,
      index: fresh.index,
      at: now,
    });
    await browser.tabs.remove(fresh.id!);
    await browser.action.setBadgeText({ text: '↻' });
    await browser.alarms.create('clearBadge', { when: now + 10_000 });
  } catch (error) {
    console.warn(error);
  }
}
