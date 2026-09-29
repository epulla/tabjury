import type { Settings } from '@/src/core/settings';
import type { Findings } from '@/src/bg/scanner';
import { addToBin } from '@/src/bg/bin';
import { useState } from 'react';
import { COPY } from '@/src/theme';
import type { Browser } from 'wxt/browser';

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
  return (
    <>
      {dups.length > 0 && (
        <section className="mt-3">
          <header className="flex items-center justify-between">
            <h2 className="font-semibold">Duplicates ({duplicateTabs.length})</h2>
            <span className="flex gap-2">
              <button onClick={() => close(duplicateTabs, 'duplicate')}>Close all extras</button>
            </span>
          </header>
          <ul className="mt-1 divide-y">
            {dups.map((group) => (
              <li
                key={group.key}
                className="flex cursor-pointer items-center gap-2 py-2"
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
            <h2 className="font-semibold">Inactive ({inactive.length})</h2>
            <span className="flex gap-2">
              <button
                onClick={() =>
                  Promise.all(inactiveTabs.map((tab) => browser.tabs.discard(tab.id!))).then(onRefresh)
                }
              >
                Discard all
              </button>
              <button onClick={() => close(inactiveTabs, 'inactive')}>Close all</button>
            </span>
          </header>
          <ul className="mt-1 divide-y">
            {inactive.map((hit) => (
              <li
                key={hit.tab.id}
                className="flex cursor-pointer items-center gap-2 py-2"
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
                  {hit.native
                    ? 'discarded by Chrome'
                    : `idle for ${Math.floor(hit.idleMs / 3_600_000)}h ${Math.floor((hit.idleMs % 3_600_000) / 60_000)}m`}
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
          className="mt-3 w-full border-t pt-2 text-left font-semibold"
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
