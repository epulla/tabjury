import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { execute, schedule } from '../src/bg/actions';
import { scan } from '../src/bg/scanner';
import { historyItem, pausedUntil, pendingActions, settingsItem } from '../src/bg/state';
import { binItem } from '../src/bg/bin';

beforeEach(async () => {
  fakeBrowser.reset();
  vi.stubGlobal('browser', fakeBrowser);
  fakeBrowser.action.getBadgeText = vi.fn(async () => '');
  fakeBrowser.action.setBadgeText = vi.fn();
  const query = fakeBrowser.tabs.query.bind(fakeBrowser.tabs);
  const removed = new Set<number>();
  fakeBrowser.tabs.query = vi.fn(async (filter) =>
    (await query(filter)).filter((tab) => !removed.has(tab.id!)),
  );
  fakeBrowser.tabs.remove = vi.fn(async (ids) => {
    for (const id of Array.isArray(ids) ? ids : [ids]) removed.add(id);
  });
  fakeBrowser.alarms.create = vi.fn();
  fakeBrowser.alarms.clear = vi.fn();
  await settingsItem.setValue({
    ...settingsItem.fallback,
    protect: {
      ...settingsItem.fallback.protect,
      active: false,
      pinned: false,
      audible: false,
      grouped: false,
      recentMinutes: 0,
    },
    autoClean: false,
  });
  await pausedUntil.setValue(0);
  await pendingActions.setValue([]);
  await historyItem.setValue([]);
  await binItem.setValue([]);
});

describe('actions', () => {
  it('schedules ultra duplicate', async () => {
    await settingsItem.setValue({
      ...(await settingsItem.getValue()),
      duplicates: 'auto',
      inactive: 'discard',
      mode: 'ultra',
      autoClean: true,
    });
    await fakeBrowser.tabs.create({ url: 'https://a.com', active: false });
    await fakeBrowser.tabs.create({ url: 'https://a.com', active: false });
    const findings = await scan();
    await schedule(findings, await settingsItem.getValue());
    expect(await pendingActions.getValue()).toHaveLength(1);
    expect(fakeBrowser.alarms.create).toHaveBeenCalledWith('grace', expect.anything());
  });
  it('auto-clean off clears pending actions', async () => {
    await pendingActions.setValue([{ kind: 'close', tabId: 1, reason: 'duplicate' }]);
    await execute();
    expect(await pendingActions.getValue()).toEqual([]);
  });
  it('closes immediately and bins', async () => {
    await settingsItem.setValue({
      ...(await settingsItem.getValue()),
      mode: 'ultra',
      duplicates: 'auto',
      autoClean: true,
    });
    const tabs = await Promise.all([
      fakeBrowser.tabs.create({ url: 'https://a.com', active: false }),
      fakeBrowser.tabs.create({ url: 'https://a.com', active: false }),
    ]);
    await pendingActions.setValue([{ kind: 'close', tabId: tabs[1]!.id!, reason: 'duplicate' }]);
    await execute();
    expect((await fakeBrowser.tabs.query({})).filter((tab) => tab.id !== 0)).toHaveLength(1);
    expect((await historyItem.getValue())[0]!.kind).toBe('close');
    expect(await binItem.getValue()).toHaveLength(1);
  });
  it('skips gone duplicate', async () => {
    const tab = await fakeBrowser.tabs.create({ url: 'https://a.com', active: false });
    await pendingActions.setValue([{ kind: 'close', tabId: tab.id!, reason: 'duplicate' }]);
    await execute();
    expect(await historyItem.getValue()).toHaveLength(0);
  });
});
