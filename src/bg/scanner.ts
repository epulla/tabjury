import { storage } from 'wxt/utils/storage';
import type { Tab, DupGroup, InactiveHit } from '../core/classify';
import { findDuplicates, findInactive } from '../core/classify';
import { getSettings } from './state';

export type Findings = { at: number; dups: DupGroup[]; inactive: InactiveHit[] };
export const findingsItem = storage.defineItem<Findings>('session:findings', {
  fallback: { at: 0, dups: [], inactive: [] },
});
export async function scan(): Promise<Findings> {
  const s = await getSettings(),
    now = Date.now(),
    current = await browser.action.getBadgeText({});
  if (s.duplicates === 'off' && s.inactive === 'off') {
    const empty = { at: now, dups: [], inactive: [] };
    await findingsItem.setValue(empty);
    if (current !== '↻') await browser.action.setBadgeText({ text: '' });
    return empty;
  }
  const tabs = (await browser.tabs.query({})).filter((tab) => !!tab.url) as Tab[];
  const dups = s.duplicates !== 'off' ? findDuplicates(tabs, s) : [];
  const inactive = s.inactive !== 'off' ? findInactive(tabs, s, now) : [];
  const findings = { at: now, dups, inactive },
    count = dups.reduce((n, group) => n + group.extras.length, 0) + inactive.length;
  await findingsItem.setValue(findings);
  if (current !== '↻')
    await browser.action.setBadgeText({ text: count ? (count > 99 ? '99+' : String(count)) : '' });
  return findings;
}

export function registerScanner(
  onScan: (f: Findings, s: Awaited<ReturnType<typeof getSettings>>) => Promise<void> = async () => {},
): void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const run = () => scan().then((f) => getSettings().then((s) => onScan(f, s)));
  browser.alarms.create('scan', { periodInMinutes: 0.5 });
  browser.alarms.onAlarm.addListener((a) => {
    if (a.name === 'scan') run();
  });
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => run(), 2_000);
  };
  browser.tabs.onActivated.addListener(schedule);
  browser.tabs.onRemoved.addListener(schedule);
  browser.tabs.onUpdated.addListener((_id, change) => {
    if (change.status === 'complete' || change.discarded !== undefined) schedule();
  });
  browser.runtime.onStartup.addListener(run);
  browser.runtime.onInstalled.addListener(run);
  browser.action.setBadgeBackgroundColor({ color: '#6b7280' });
}
