import { isProtected, tabKey, type Tab } from '../core/classify';
import { findLeftovers } from '../core/leftovers';
import { decide } from '../core/policy';
import type { Settings } from '../core/settings';
import { addToBin } from './bin';
import { getSettings, historyItem, pausedUntil, pendingActions } from './state';
import { scan, type Findings } from './scanner';

export function autoOn(s: Settings): boolean {
  return s.autoClean && (s.duplicates === 'auto' || s.inactive === 'discard' || s.inactive === 'close' || s.leftovers.level === 'close');
}

export async function schedule(findings: Findings, s: Settings): Promise<void> {
  if (!autoOn(s)) return pendingActions.setValue([]);
  if ((await pausedUntil.getValue()) > Date.now()) return;
  const actions = decide(findings.dups, findings.inactive, s, Date.now(), findings.leftovers);
  if (!actions.length) {
    await pendingActions.setValue([]);
    await browser.alarms.clear('grace');
    return;
  }
  const immediate = actions.filter((action) => action.reason === 'leftover'), deferred = actions.filter((action) => action.reason !== 'leftover');
  if (immediate.length) {
    await pendingActions.setValue(immediate);
    await execute();
  }
  if (!deferred.length) return pendingActions.setValue([]);
  await pendingActions.setValue(deferred);
  // Scans run every 30s; resetting the alarm each time would keep it from ever firing.
  if (!(await browser.alarms.get('grace')))
    await browser.alarms.create('grace', { when: Date.now() + s.auto.graceSeconds * 1000 });
}

export async function execute(): Promise<void> {
  const s = await getSettings();
  if (!autoOn(s)) return pendingActions.setValue([]);
  const actions = await pendingActions.getValue(),
    now = Date.now();
  await pendingActions.setValue([]);
  const entries: Awaited<ReturnType<typeof historyItem.getValue>> = [];
  for (const action of actions) {
    let tab: Tab;
    try {
      tab = (await browser.tabs.get(action.tabId)) as Tab;
    } catch {
      continue;
    }
    const protection = action.reason === 'leftover' ? { ...s, protect: { ...s.protect, active: false, recentMinutes: 0 } } : s;
    if (isProtected(tab, protection, now) || (action.kind === 'discard' && tab.discarded)) continue;
    if (action.reason === 'duplicate') {
      const key = tabKey(tab, s);
      if (!key || (await browser.tabs.query({})).filter((item) => tabKey(item as Tab, s) === key).length < 2)
        continue;
    }
    if (action.reason === 'leftover' && !findLeftovers([tab], s, now).length) continue;
    if (action.kind === 'close') {
      if (action.reason === 'leftover' && (await browser.tabs.query({ windowId: tab.windowId })).length === 1)
        await browser.tabs.create({ windowId: tab.windowId });
      await addToBin(tab, action.reason, s);
      await browser.tabs.remove(action.tabId);
    } else await browser.tabs.discard(action.tabId);
    entries.push({
      at: now,
      kind: action.kind,
      reason: action.reason,
      title: tab.title ?? '',
      url: tab.url ?? '',
    });
  }
  if (entries.length)
    await historyItem.setValue([...entries, ...(await historyItem.getValue())].slice(0, 200));
  await scan();
}
