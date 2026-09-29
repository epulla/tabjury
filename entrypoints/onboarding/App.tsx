import { settingsItem } from '@/src/bg/state';
import { applyPreset, type Mode } from '@/src/core/settings';
import { MODES } from '@/src/theme';
import { useItem } from '@/src/ui/useItem';

export default function App() {
  const [settings, setSettings] = useItem(settingsItem);
  const modes: Array<Exclude<Mode, 'custom'>> = ['lite', 'normal', 'ultra'];

  return (
    <main className="mx-auto max-w-xl p-8 text-sm text-gray-900">
      <h1 className="mb-8 text-2xl font-semibold">Welcome to TabJury</h1>
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">You've been summoned</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Reuses an already-open tab when you open the same link again.</li>
          <li>Flags duplicate and inactive tabs in the popup.</li>
          <li>
            In Supreme Court mode, auto-closes duplicates and discards inactive tabs after a 24h dry run.
          </li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Pick your court</h2>
        <fieldset className="space-y-3">
          <legend className="sr-only">TabJury mode</legend>
          {modes.map((id) => (
            <label key={id} className="flex cursor-pointer gap-3">
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
          last 5 minutes, and domains you list in Settings. Auto actions run in dry-run mode for the first 24
          hours — check History in the popup to see what would have happened.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className="rounded border px-3 py-2"
            onClick={() => browser.runtime.openOptionsPage()}
          >
            Open settings
          </button>
          <button
            type="button"
            className="rounded bg-gray-900 px-3 py-2 text-white"
            onClick={() => window.close()}
          >
            Done
          </button>
        </div>
      </section>
      <footer className="text-gray-600">Shortcut: Alt+Shift+P pauses TabJury for 15 minutes.</footer>
    </main>
  );
}
