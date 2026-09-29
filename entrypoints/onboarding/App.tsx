import type { CSSProperties } from 'react';
import { settingsItem } from '@/src/bg/state';
import { applyPreset, type Mode } from '@/src/core/settings';
import { accentFor, MODES } from '@/src/theme';
import { useItem } from '@/src/ui/useItem';

export default function App() {
  const [settings, setSettings] = useItem(settingsItem);
  const modes: Array<Exclude<Mode, 'custom'>> = ['lite', 'normal', 'ultra'];

  return (
    <div className="app-bg min-h-screen" style={{ '--accent': accentFor(settings) } as CSSProperties}>
      <main className="mx-auto max-w-xl p-8 text-sm text-gray-900">
        <h1 className="mb-8 text-2xl font-semibold">
          Welcome to <span style={{ color: 'var(--accent)' }}>TabJury</span>
        </h1>
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">You've been summoned</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Reuses an already-open tab when you open the same link again.</li>
            <li>Flags duplicate and inactive tabs in the popup.</li>
            <li>
              In Supreme Court mode, auto-closes duplicates and discards inactive tabs after a 24-hour trial
              period.
            </li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Pick your court</h2>
          <fieldset className="space-y-3">
            <legend className="sr-only">TabJury mode</legend>
            {modes.map((id) => (
              <label
                key={id}
                className="flex cursor-pointer gap-3 rounded-lg border border-l-4 p-3"
                style={{
                  borderLeftColor: MODES[id].color,
                  background: `color-mix(in srgb, ${MODES[id].color} 8%, white)`,
                  ...(settings.mode === id && { boxShadow: `0 0 0 2px ${MODES[id].color}` }),
                }}
              >
                <input
                  type="radio"
                  name="mode"
                  value={id}
                  checked={settings.mode === id}
                  onChange={() => setSettings(applyPreset(settings, id))}
                />
                <span>
                  <span className="font-medium">
                    {MODES[id].name} ({id})
                  </span>
                  <span className="block text-gray-600">{MODES[id].blurb}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </section>
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Immunity</h2>
          <p>
            Never touched: the active tab, pinned tabs, tabs playing audio, tabs in groups, tabs used in the
            last 5 minutes, and domains you list in Settings. For the first 24 hours TabJury only notes what
            it would close — check History in the popup to see.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => browser.runtime.openOptionsPage()}
            >
              Open settings
            </button>
            <button type="button" className="btn" onClick={() => window.close()}>
              Done
            </button>
          </div>
        </section>
        <footer className="text-gray-600">Shortcut: Alt+Shift+P pauses TabJury for 15 minutes.</footer>
      </main>
    </div>
  );
}
