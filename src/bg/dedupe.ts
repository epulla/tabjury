import type { Tab } from '../core/classify';
import { findAlibi } from '../core/alibi';
import { isBlankUrl, normalizeUrl } from '../core/url';
import { addToBin } from './bin';
import { freshTabs, getSettings, lastDedupe, pausedUntil, recentlyDeduped } from './state';
const fresh = new Map<number, string | undefined>();
const mirror = () => freshTabs.setValue(Object.fromEntries(fresh));
export async function registerDedupe(): Promise<void> {
  fresh.clear();
  browser.tabs.onCreated.addListener(async (tab) => {
    if (tab.id === undefined) return;
    fresh.set(tab.id, isBlankUrl(tab.url) ? undefined : tab.url);
    mirror();
    if (tab.pendingUrl) await handle(tab, tab.pendingUrl);
  });
  browser.tabs.onUpdated.addListener(async (id, change, tab) => {
    if (!fresh.has(id)) return;
    if (change.url) await handle(tab, change.url);
    if (change.status !== 'complete') return;
    await handle(tab, tab.url ?? '');
    if (!isBlankUrl(tab.url)) {
      fresh.delete(id);
      mirror();
    }
  });
  browser.tabs.onRemoved.addListener((id) => {
    fresh.delete(id);
    mirror();
  });
  for (const [id, url] of Object.entries(await freshTabs.getValue()))
    if (!fresh.has(+id)) fresh.set(+id, url);
}
async function handle(tab: Tab, url: string): Promise<void> {
  if (tab.id === undefined || !fresh.has(tab.id)) return;
  const s = await getSettings(),
    now = Date.now(),
    key = normalizeUrl(url, s.matching);
  if (!s.dedupeOnOpen || !key) return;
  const host = new URL(key).hostname;
  if (s.protect.domains.some((d) => host === d.toLowerCase() || host.endsWith(`.${d.toLowerCase()}`))) return;
  const scope = s.mode === 'ultra' ? 'all' : s.dedupeScope;
  const tabs = await browser.tabs.query(scope === 'window' ? { windowId: tab.windowId } : {});
  const same = (t: Tab) =>
    t.id !== tab.id && t.incognito === tab.incognito && normalizeUrl(t.url ?? '', s.matching) === key;
  const existing = tabs
    .filter(same)
    .sort(
      (a, b) =>
        Number(b.active) - Number(a.active) ||
        Number(b.pinned) - Number(a.pinned) ||
        (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0),
    )[0];
  if (!existing) return;
  const recent = await recentlyDeduped.getValue();
  if (
    findAlibi({
      now,
      recentlyDeduped: recent,
      key,
      paused: (await pausedUntil.getValue()) > now,
      strict: s.mode === 'ultra',
      createdUrl: fresh.get(tab.id),
    })
  )
    return;
  recent[key] = now;
  await recentlyDeduped.setValue(recent);
  if (scope === 'all' && existing.windowId !== tab.windowId)
    s.crossWindow === 'move'
      ? await browser.tabs.move(existing.id!, { windowId: tab.windowId, index: -1 })
      : await browser.windows.update(existing.windowId, { focused: true });
  await browser.tabs.update(existing.id!, { active: true });
  await addToBin({ ...tab, url, title: tab.title ?? url }, 'dedupe', s);
  await lastDedupe.setValue({
    url,
    title: tab.title ?? url,
    windowId: tab.windowId,
    index: tab.index,
    at: now,
  });
  fresh.delete(tab.id);
  mirror();
  await browser.tabs.remove(tab.id);
  await browser.action.setBadgeText({ text: '↻' });
  await browser.alarms.create('clearBadge', { when: now + 10_000 });
}
