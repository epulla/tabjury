import { useState, type CSSProperties } from 'react';
import {
  settingsItem,
  pausedUntil,
  lastDedupe,
  historyItem,
  pendingActions,
} from '@/src/bg/state';
import { findingsItem, scan } from '@/src/bg/scanner';
import { autoOn } from '@/src/bg/actions';
import { binItem } from '@/src/bg/bin';
import { applyPreset, PRESETS, withChange, type Mode } from '@/src/core/settings';
import { accentFor, COPY, modeDetails, MODES } from '@/src/theme';
import Switch from '@/src/ui/Switch';
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
    [pending] = useItem(pendingActions);
  const [showBin, setShowBin] = useState(false),
    [showHistory, setShowHistory] = useState(false),
    [showPause, setShowPause] = useState(false),
    [showInfo, setShowInfo] = useState(false),
    now = Date.now(),
    minutes = Math.max(1, Math.ceil((paused - now) / 60_000));
  const refresh = () => scan().then(() => undefined);
  return (
    <main className="app-bg w-96 text-sm" style={{ '--accent': accentFor(settings) } as CSSProperties}>
      {showBin ? (
        <Bin entries={bin} onBack={() => setShowBin(false)} onClear={() => setBin([])} />
      ) : showHistory ? (
        <History entries={history} onBack={() => setShowHistory(false)} onClear={() => setHistory([])} />
      ) : (
        <>
          <header className="border-b border-[color-mix(in_srgb,var(--accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-4 pb-3 pt-4">
            <div className="flex items-baseline justify-between">
              <strong className="text-base">TabJury</strong>
              <span className="flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                {MODES[settings.mode].name}
                <button
                  type="button"
                  className="btn btn-ghost px-1.5 py-0"
                  aria-label="What do modes do?"
                  aria-expanded={showInfo}
                  aria-controls="mode-info"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  ⓘ
                </button>
              </span>
            </div>
            <p className="text-xs text-gray-600">{MODES[settings.mode].blurb}</p>
            <div className="seg mt-2" role="group" aria-label="Mode">
              {(['lite', 'normal', 'ultra', 'custom'] as Mode[]).map((mode) => (
                <button
                  type="button"
                  className="seg-item"
                  aria-pressed={settings.mode === mode}
                  key={mode}
                  title={`${MODES[mode].name}: ${MODES[mode].blurb}`}
                  style={
                    {
                      '--seg-color': mode === 'custom' ? accentFor(settings) : MODES[mode].color,
                    } as CSSProperties
                  }
                  onClick={() => {
                    if (settings.mode === mode) return;
                    setSettings(
                      mode === 'custom' ? { ...settings, mode, autoClean: false } : applyPreset(settings, mode),
                    );
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            {showInfo && (
              <div id="mode-info" className="mt-2 space-y-2 rounded-lg border bg-white/80 p-2 text-xs">
                {(['lite', 'normal', 'ultra', 'custom'] as Mode[]).map((mode) => (
                  <div
                    key={mode}
                    className={
                      settings.mode === mode
                        ? 'rounded-md bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] p-1'
                        : 'p-1'
                    }
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: mode === 'custom' ? accentFor(settings) : MODES[mode].color }}
                      />
                      <strong>
                        {MODES[mode].name} ({mode.charAt(0).toUpperCase() + mode.slice(1)})
                      </strong>
                    </div>
                    <div className="text-gray-600">{MODES[mode].blurb}</div>
                    <ul className="list-disc pl-4 text-gray-500">
                      {modeDetails(mode === 'custom' ? settings : PRESETS[mode]).map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                      {mode === 'custom' && <li>Adjust rules in Settings</li>}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {(settings.mode === 'ultra' || settings.mode === 'custom') && (
              <div className="mt-3">
                <Switch
                  checked={settings.autoClean}
                  onChange={(autoClean) => setSettings(withChange(settings, { autoClean }))}
                  label="Automatically close duplicate tabs and tidy up inactive tabs"
                />
              </div>
            )}
            {autoOn(settings) && pending.length > 0 && (
                <p className="mt-2 rounded-lg bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] p-2 text-xs">
                  {`${pending.length} tabs will be tidied up ${
                    settings.auto.graceSeconds <= 60
                      ? 'in about a minute'
                      : `in about ${Math.ceil(settings.auto.graceSeconds / 60)} minutes`
                  }`}
                </p>
            )}
          </header>
          <div className="px-4 pb-4">
            <div className="mt-3 flex items-center justify-between">
              {paused > now ? (
                <>
                  <span className="flex items-center gap-2 text-gray-500">
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    {COPY.paused} · {minutes} min left
                  </span>
                  <button type="button" className="btn btn-primary" onClick={() => setPaused(0)}>
                    Resume
                  </button>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />
                    Running
                  </span>
                  <span className="flex items-center gap-1">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowPause(!showPause)}>
                      Pause
                    </button>
                    {showPause &&
                      [5, 15, 60].map((value) => (
                        <button
                          type="button"
                          className="btn"
                          key={value}
                          onClick={() => {
                            setPaused(now + value * 60_000);
                            setShowPause(false);
                          }}
                        >
                          {value}m
                        </button>
                      ))}
                  </span>
                </>
              )}
            </div>
            {dedupe && now - dedupe.at < 10_000 && (
              <div className="mt-3 rounded-lg border border-[color-mix(in_srgb,var(--accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] p-2">
                Reused open tab for {dedupe.title}
                <button
                  type="button"
                  className="btn ml-2"
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
            <footer className="mt-3 flex justify-between border-t border-[color-mix(in_srgb,var(--accent)_20%,transparent)] pt-3">
              <button
                type="button"
                className="btn btn-ghost whitespace-nowrap"
                onClick={() => setShowBin(true)}
              >
                Recently closed{' '}
                <span
                  className={`ml-1 rounded-full px-1.5 text-[10px] font-semibold ${
                    bin.length === 0
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]'
                  }`}
                >
                  {bin.length}
                </span>
              </button>
              <button
                type="button"
                className="btn btn-ghost whitespace-nowrap"
                onClick={() => setShowHistory(true)}
              >
                History{' '}
                <span
                  className={`ml-1 rounded-full px-1.5 text-[10px] font-semibold ${
                    history.length === 0
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]'
                  }`}
                >
                  {history.length}
                </span>
              </button>
              <button
                type="button"
                className="btn btn-ghost whitespace-nowrap"
                onClick={() => browser.runtime.openOptionsPage()}
              >
                Settings
              </button>
            </footer>
          </div>
        </>
      )}
    </main>
  );
}
