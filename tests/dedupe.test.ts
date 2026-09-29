import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { registerDedupe } from '../src/bg/dedupe';
import { pausedUntil, recentlyDeduped } from '../src/bg/state';
import { binItem, restore } from '../src/bg/bin';

// fakeBrowser.reset() does not restore stubbed methods; capture originals once
const realQuery = fakeBrowser.tabs.query.bind(fakeBrowser.tabs);
const realCreate = fakeBrowser.tabs.create.bind(fakeBrowser.tabs);
let forcedActive = new Set<number>();
beforeEach(async () => {
  fakeBrowser.reset();
  forcedActive = new Set();
  vi.stubGlobal('browser', fakeBrowser);
  fakeBrowser.windows.update = vi.fn();
  fakeBrowser.action.setBadgeText = vi.fn();
  fakeBrowser.alarms.create = vi.fn();
  const removed = new Set<number>();
  fakeBrowser.tabs.query = vi.fn(async (filter) =>
    (await realQuery(filter))
      .filter((tab) => tab.id !== 0 && !removed.has(tab.id!))
      .map((tab) => ({ ...tab, active: tab.active || forcedActive.has(tab.id!) })),
  );
  fakeBrowser.tabs.remove = vi.fn(async (id) => {
    removed.add(id);
  });
  await recentlyDeduped.setValue({});
  await registerDedupe();
});
// fake tabs.create auto-fires onCreated with url set (looks like a clone); mute it and fire the realistic shape
const open = async (url: string, { active = false, clone = false, pending = true } = {}) => {
  const fire = fakeBrowser.tabs.onCreated.trigger.bind(fakeBrowser.tabs.onCreated);
  fakeBrowser.tabs.onCreated.trigger = async () => [];
  const tab = await realCreate({ url, windowId: 1, active });
  fakeBrowser.tabs.onCreated.trigger = fire;
  if (active) forcedActive.add(tab.id!);
  await fire({ ...tab, url: clone ? url : '', pendingUrl: clone || !pending ? undefined : url });
  return tab;
};

describe('dedupe', () => {
  it('dedupes external link even when existing tab is active', async () => {
    const a = await open('https://x.com/p', { active: true }),
      b = await open('https://x.com/p', { active: true });
    await fakeBrowser.tabs.onUpdated.trigger(b.id!, { url: b.url }, b);
    const tabs = await fakeBrowser.tabs.query({}),
      bin = await binItem.getValue();
    expect(tabs.map((tab) => tab.id)).toEqual([a.id]);
    expect(tabs[0]!.active).toBe(true);
    expect(bin[0]!.reason).toBe('dedupe');
  });
  it('keeps clone', async () => {
    const a = await open('https://x.com/p', { active: true }),
      b = await open('https://x.com/p', { clone: true });
    await fakeBrowser.tabs.onUpdated.trigger(b.id!, { status: 'complete' }, b);
    expect((await fakeBrowser.tabs.query({})).map((tab) => tab.id)).toEqual([a.id, b.id]);
  });
  it('keeps tab while paused', async () => {
    const b = await open('https://x.com/p');
    await pausedUntil.setValue(Date.now() + 60_000);
    await fakeBrowser.tabs.onUpdated.trigger(b.id!, { url: b.url }, b);
    expect((await fakeBrowser.tabs.query({})).some((tab) => tab.id === b.id)).toBe(true);
  });
  it('keeps second strike', async () => {
    await open('https://x.com/p');
    const b = await open('https://x.com/p');
    await fakeBrowser.tabs.onUpdated.trigger(b.id!, { url: b.url }, b);
    const c = await open('https://x.com/p');
    await fakeBrowser.tabs.onUpdated.trigger(c.id!, { url: c.url }, c);
    expect((await fakeBrowser.tabs.query({})).some((tab) => tab.id === c.id)).toBe(true);
    expect(Object.keys(await recentlyDeduped.getValue())).toHaveLength(1);
  });
  it('dedupes on complete when no pendingUrl', async () => {
    const a = await open('https://x.com/p'),
      b = await open('https://x.com/p', { pending: false });
    await fakeBrowser.tabs.onUpdated.trigger(b.id!, { status: 'complete' }, b);
    expect((await fakeBrowser.tabs.query({})).map((tab) => tab.id)).toEqual([a.id]);
  });
  it('restores bin entry', async () => {
    const tab = await open('https://x.com/p');
    await binItem.setValue([
      { id: 'x', url: tab.url!, title: '', closedAt: Date.now(), reason: 'manual', windowId: 1, index: 0 },
    ]);
    await restore('x');
    expect((await fakeBrowser.tabs.query({})).some((item) => item.url === tab.url)).toBe(true);
  });
});
