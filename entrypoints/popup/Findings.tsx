import type { Settings } from '@/src/core/settings';
import type { Findings } from '@/src/bg/scanner';
import { addToBin } from '@/src/bg/bin';
import { useState } from 'react';
import { COPY } from '@/src/theme';
import type { Browser } from 'wxt/browser';
import { formatMinutes } from '@/src/ui/time';
import { isProtected, type Tab as ClassifiedTab } from '@/src/core/classify';

type Tab = Browser.tabs.Tab;

type Props = { findings: Findings; settings: Settings; onRefresh: () => Promise<void> };

export default function FindingsView({ findings, settings, onRefresh }: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const close = async (tabs: Tab[], reason: 'duplicate' | 'inactive') => {
    if (!tabs.length) return;
    for (const tab of tabs) await addToBin(tab as never, reason, settings);
    await browser.tabs.remove(tabs.map((tab) => tab.id!).filter(Boolean));
    setSelected([]);
    await onRefresh();
  };
  const focus = (tab: Tab) =>
    tab.id &&
    browser.tabs
      .update(tab.id, { active: true })
      .then(() => browser.windows.update(tab.windowId!, { focused: true }));
  const dups = findings.dups,
    inactive = findings.inactive;
  const duplicateTabs = dups.flatMap((group) => group.extras);
  const inactiveTabs = inactive.map((hit) => hit.tab);
  const toggle = (id: number) =>
    setSelected((value) => (value.includes(id) ? value.filter((item) => item !== id) : [...value, id]));
  const selectedTabs = [...duplicateTabs, ...inactiveTabs].filter((tab) => selected.includes(tab.id!));
  const keptReason = (tab: Tab) => {
    const classifiedTab = tab as ClassifiedTab;
    if (settings.protect.grouped && tab.groupId !== undefined && tab.groupId !== -1) return 'in a group';
    if (settings.protect.pinned && !!tab.pinned) return 'pinned';
    if (settings.protect.audible && !!tab.audible) return 'playing audio';
    if (settings.protect.active && !!tab.active) return 'open now';
    if (tab.lastAccessed && findings.at - tab.lastAccessed < settings.protect.recentMinutes * 60_000)
      return 'used recently';
    return isProtected(classifiedTab, settings, findings.at) ? 'protected site' : null;
  };
  return (
    <>
      {dups.length > 0 && (
        <section className="mt-3">
          <header className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--accent)]">Duplicates ({duplicateTabs.length})</h2>
            <span className="flex gap-2">
              <button type="button" className="btn" onClick={() => close(duplicateTabs, 'duplicate')}>
                Close all extras
              </button>
            </span>
          </header>
          <ul className="mt-1 divide-y">
            {dups.map((group) => (
              <li
                key={group.key}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-2 hover:bg-black/5"
                onClick={() => focus(group.keep)}
              >
                <input
                  aria-label={`Select duplicate tabs for ${group.keep.title ?? group.keep.url}`}
                  type="checkbox"
                  checked={group.extras.every((tab) => selected.includes(tab.id!))}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => group.extras.forEach((tab) => toggle(tab.id!))}
                />
                <img
                  className="h-4 w-4"
                  src={`/_favicon/?pageUrl=${encodeURIComponent(group.keep.url ?? '')}&size=16`}
                  alt=""
                />
                <span className="min-w-0 flex-1 truncate">{group.keep.title || group.keep.url}</span>
                <span className="whitespace-nowrap text-xs text-gray-500">
                  {group.extras.length + 1} tabs · window {group.keep.windowId}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {inactive.length > 0 && (
        <section className="mt-3">
          <header className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--accent)]">Inactive ({inactive.length})</h2>
            <span className="flex gap-2">
              <button
                type="button"
                className="btn"
                onClick={() =>
                  Promise.all(inactiveTabs.map((tab) => browser.tabs.discard(tab.id!))).then(onRefresh)
                }
              >
                Discard all
              </button>
              <button type="button" className="btn" onClick={() => close(inactiveTabs, 'inactive')}>
                Close all
              </button>
            </span>
          </header>
          <ul className="mt-1 divide-y">
            {inactive.map((hit) => (
              <li
                key={hit.tab.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-2 hover:bg-black/5"
                onClick={() => focus(hit.tab)}
              >
                <input
                  aria-label={`Select ${hit.tab.title ?? hit.tab.url}`}
                  type="checkbox"
                  checked={selected.includes(hit.tab.id!)}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => toggle(hit.tab.id!)}
                />
                <span className="min-w-0 flex-1 truncate">{hit.tab.title || hit.tab.url}</span>
                <span className="whitespace-nowrap text-xs text-gray-500">
                  {hit.idleMs === 0 ? 'asleep' : `idle ${formatMinutes(hit.idleMs / 60_000)}`}
                  {settings.inactive === 'close' &&
                    (keptReason(hit.tab)
                      ? ` · kept (${keptReason(hit.tab)})`
                      : hit.idleMs === 0
                        ? ''
                        : hit.idleMs / 60_000 >= settings.closeMinutes
                          ? ' · closing soon'
                          : ` · closes in ${formatMinutes(settings.closeMinutes - hit.idleMs / 60_000)}`)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!dups.length && !inactive.length && (
        <p className="py-8 text-center text-gray-500">{COPY.docketClear}</p>
      )}
      {selectedTabs.length > 0 && (
        <button
          className="btn btn-primary mt-3 w-full justify-center"
          onClick={() =>
            Promise.all([
              close(
                selectedTabs.filter((tab) => duplicateTabs.includes(tab)),
                'duplicate',
              ),
              close(
                selectedTabs.filter((tab) => inactiveTabs.includes(tab)),
                'inactive',
              ),
            ])
          }
        >
          Close selected ({selectedTabs.length})
        </button>
      )}
    </>
  );
}
