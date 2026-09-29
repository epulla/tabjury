import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { findingsItem, registerScanner, scan } from '../src/bg/scanner';
import { settingsItem } from '../src/bg/state';

beforeEach(() => {
  fakeBrowser.reset(); vi.stubGlobal('browser', fakeBrowser);
  fakeBrowser.action.setBadgeText = vi.fn(); fakeBrowser.action.getBadgeText = vi.fn(async () => '');
  fakeBrowser.action.setBadgeBackgroundColor = vi.fn(); fakeBrowser.alarms.create = vi.fn();
  registerScanner();
});

describe('scanner', () => {
  it('stores duplicate findings and badge count', async () => {
    await fakeBrowser.tabs.create({ url: 'https://a.com/x' });
    await fakeBrowser.tabs.create({ url: 'https://a.com/x' });
    const findings = await scan();
    expect(findings.dups).toHaveLength(1); expect(findings.dups[0]!.extras).toHaveLength(1);
    expect(await findingsItem.getValue()).toEqual(findings);
    expect(fakeBrowser.action.setBadgeText).toHaveBeenLastCalledWith({ text: '1' });
  });
  it('clears findings when detection is off', async () => {
    await settingsItem.setValue({ ...(await settingsItem.getValue()), duplicates: 'off', inactive: 'off' });
    const findings = await scan();
    expect(findings).toEqual({ at: expect.any(Number), dups: [], inactive: [] });
    expect(fakeBrowser.action.setBadgeText).toHaveBeenLastCalledWith({ text: '' });
  });
});
