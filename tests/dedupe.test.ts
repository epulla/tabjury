import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { registerDedupe } from '../src/bg/dedupe';
import { freshTabs, pausedUntil, recentlyDeduped } from '../src/bg/state';
import { binItem, restore } from '../src/bg/bin';

let forcedActive = new Set<number>();
beforeEach(() => {
  fakeBrowser.reset(); forcedActive = new Set(); vi.stubGlobal('browser', fakeBrowser);
  fakeBrowser.windows.update = vi.fn(); fakeBrowser.action.setBadgeText = vi.fn(); fakeBrowser.alarms.create = vi.fn();
  const query = fakeBrowser.tabs.query.bind(fakeBrowser.tabs), removed = new Set<number>();
  fakeBrowser.tabs.query = vi.fn(async filter => (await query(filter)).filter(tab => tab.id !== 0 && !removed.has(tab.id!)).map(tab => ({ ...tab, active: tab.active || forcedActive.has(tab.id!) })));
  fakeBrowser.tabs.remove = vi.fn(async id => { removed.add(id); });
  registerDedupe();
});
const open = async (url: string, active = false) => { const tab = await fakeBrowser.tabs.create({ url, windowId: 1, active }); if (active) forcedActive.add(tab.id!); await fakeBrowser.tabs.onCreated.trigger(tab); await freshTabs.setValue({ [tab.id!]: Date.now() }); return tab; };

describe('dedupe', () => {
  it('dedupes and bins fresh tab', async () => {
    const a = await open('https://x.com/p'), b = await open('https://x.com/p');
    await fakeBrowser.tabs.onUpdated.trigger(b.id!, { url: b.url }, b);
    const tabs = await fakeBrowser.tabs.query({}), bin = await binItem.getValue();
    expect(tabs).toHaveLength(1); expect(tabs[0]!.id).toBe(a.id); expect(tabs[0]!.active).toBe(true); expect(bin).toHaveLength(1); expect(bin[0]!.reason).toBe('dedupe');
  });
  it('keeps alibi tab', async () => { const b = await open('https://x.com/p'); await pausedUntil.setValue(Date.now() + 60_000); await fakeBrowser.tabs.onUpdated.trigger(b.id!, { url: b.url }, b); expect((await fakeBrowser.tabs.query({})).some(tab => tab.id === b.id)).toBe(true); });
  it('keeps second strike', async () => { const a = await open('https://x.com/p'), b = await open('https://x.com/p'); await fakeBrowser.tabs.onUpdated.trigger(b.id!, { url: b.url }, b); const c = await open('https://x.com/p'); await fakeBrowser.tabs.onUpdated.trigger(c.id!, { url: c.url }, c); expect((await fakeBrowser.tabs.query({})).some(tab => tab.id === c.id)).toBe(true); expect(Object.keys(await recentlyDeduped.getValue())).toHaveLength(1); });
  it('restores bin entry', async () => { const tab = await open('https://x.com/p'); await binItem.setValue([{ id: 'x', url: tab.url!, title: '', closedAt: Date.now(), reason: 'manual', windowId: 1, index: 0 }]); await restore('x'); expect((await fakeBrowser.tabs.query({})).some(item => item.url === tab.url)).toBe(true); });
});
