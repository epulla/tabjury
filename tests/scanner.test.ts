import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { findingsItem, registerScanner, scan } from '../src/bg/scanner';
import { settingsItem } from '../src/bg/state';

beforeEach(() => {
  fakeBrowser.reset();
  vi.stubGlobal('browser', fakeBrowser);
  fakeBrowser.action.setBadgeText = vi.fn();
  fakeBrowser.action.getBadgeText = vi.fn(async () => '');
  fakeBrowser.action.setBadgeBackgroundColor = vi.fn();
  fakeBrowser.alarms.create = vi.fn();
  registerScanner();
});

describe('scanner', () => {
  it('stores duplicate findings and badge count', async () => {
    await fakeBrowser.tabs.create({ url: 'https://a.com/x' });
    await fakeBrowser.tabs.create({ url: 'https://a.com/x' });
    const findings = await scan();
    expect(findings.dups).toHaveLength(1);
    expect(findings.dups[0]!.extras).toHaveLength(1);
    expect(await findingsItem.getValue()).toEqual(findings);
    expect(fakeBrowser.action.setBadgeText).toHaveBeenLastCalledWith({ text: '1' });
  });
  it('clears findings when detection is off', async () => {
    await settingsItem.setValue({ ...(await settingsItem.getValue()), duplicates: 'off', inactive: 'off' });
    const findings = await scan();
    expect(findings).toEqual({ at: expect.any(Number), dups: [], inactive: [], leftovers: [] });
    expect(fakeBrowser.action.setBadgeText).toHaveBeenLastCalledWith({ text: '' });
  });
  it('counts leftover findings in badge', async () => {
    await settingsItem.setValue({ ...(await settingsItem.getValue()), duplicates: 'off', inactive: 'off', leftovers: { level: 'detect', seconds: 0, extra: [] } });
    const tab = await fakeBrowser.tabs.create({ url: 'https://zoom.us/j/123#success' });
    const query = fakeBrowser.tabs.query.bind(fakeBrowser.tabs);
    fakeBrowser.tabs.query = vi.fn(async (filter) => (await query(filter)).map((item) => item.id === tab.id ? { ...item, lastAccessed: 0 } : item));
    await scan();
    expect(fakeBrowser.action.setBadgeText).toHaveBeenLastCalledWith({ text: '1' });
  });
});
