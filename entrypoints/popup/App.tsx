import { useState } from 'react';
import {
  settingsItem,
  pausedUntil,
  lastDedupe,
  autoEnabledAt,
  historyItem,
  pendingActions,
} from '@/src/bg/state';
import { findingsItem, scan } from '@/src/bg/scanner';
import { autoOn } from '@/src/bg/actions';
import { binItem } from '@/src/bg/bin';
import { applyPreset, type Mode } from '@/src/core/settings';
import { COPY, MODES } from '@/src/theme';
import { useItem } from '@/src/ui/useItem';
import Findings from './Findings';
import Bin from './Bin';
import History from './History';

export default function App() {
  const [settings, setSettings] = useItem(settingsItem),
    [findings] = useItem(findingsItem),
    [paused, setPaused] = useItem(pausedUntil),
    [dedupe, setDedupe] = useItem(lastDedupe),
    [bin, setBin] = useItem(binItem),
    [history, setHistory] = useItem(historyItem),
    [pending] = useItem(pendingActions),
    [enabledAt, setEnabledAt] = useItem(autoEnabledAt);
  const [showBin, setShowBin] = useState(false),
    [showHistory, setShowHistory] = useState(false),
    now = Date.now(),
    minutes = Math.max(1, Math.ceil((paused - now) / 60_000));
  const refresh = () => scan().then(() => undefined);
  const pause = (value: string) => setPaused(value ? now + Number(value) * 60_000 : 0);
  return (
    <main className="w-80 p-4 text-sm">
      {showBin ? (
        <Bin entries={bin} onBack={() => setShowBin(false)} onClear={() => setBin([])} />
      ) : showHistory ? (
        <History entries={history} onBack={() => setShowHistory(false)} onClear={() => setHistory([])} />
      ) : (
        <>
          <header>
            <div className="flex items-center justify-between">
              <strong>TabJury</strong>
              <select
                aria-label="Mode"
                value={settings.mode}
                onChange={(event) =>
                  setSettings(applyPreset(settings, event.target.value as Exclude<Mode, 'custom'>))
                }
              >
                {(['lite', 'normal', 'ultra', 'custom'] as Mode[]).map((mode) => (
                  <option disabled={mode === 'custom' && settings.mode !== 'custom'} key={mode} value={mode}>
                    {MODES[mode].name} ({mode})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500">{MODES[settings.mode].blurb}</p>
            {autoOn(settings) &&
              (enabledAt && now - enabledAt < settings.auto.dryRunHours * 3_600_000 ? (
                <p className="text-xs">
                  Dry run: {Math.ceil((settings.auto.dryRunHours * 3_600_000 - now + enabledAt) / 3_600_000)}h
                  left — actions are only logged{' '}
                  <button onClick={() => setEnabledAt(now - settings.auto.dryRunHours * 3_600_000 - 1)}>
                    Skip dry run
                  </button>
                </p>
              ) : (
                pending.length > 0 && (
                  <p className="text-xs">
                    {pending.length} tabs scheduled for auto-action in ≤{settings.auto.graceSeconds}s
                  </p>
                )
              ))}
          </header>
          <div className="mt-3 flex items-center justify-between">
            {paused > now ? (
              <>
                <span>
                  {COPY.paused} · resumes in {minutes} min
                </span>
                <button onClick={() => setPaused(0)}>Resume</button>
              </>
            ) : (
              <select aria-label="Pause" defaultValue="" onChange={(event) => pause(event.target.value)}>
                <option value="" disabled>
                  Pause...
                </option>
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            )}
          </div>
          {dedupe && now - dedupe.at < 10_000 && (
            <div className="mt-3 border p-2">
              Reused open tab for {dedupe.title}
              <button
                className="ml-2"
                onClick={() =>
                  browser.tabs
                    .create({ url: dedupe.url, windowId: dedupe.windowId, index: dedupe.index })
                    .then(() => setDedupe(null))
                }
              >
                Open as new tab anyway
              </button>
            </div>
          )}
          {settings.duplicates !== 'off' || settings.inactive !== 'off' ? (
            <Findings findings={findings} settings={settings} onRefresh={refresh} />
          ) : (
            <p className="py-8 text-center text-gray-500">{COPY.docketClear}</p>
          )}
          <footer className="mt-3 flex justify-between border-t pt-3">
            <button onClick={() => setShowBin(true)}>Recently closed ({bin.length})</button>
            <button onClick={() => setShowHistory(true)}>History ({history.length})</button>
            <button onClick={() => browser.runtime.openOptionsPage()}>Settings</button>
          </footer>
        </>
      )}
    </main>
  );
}
