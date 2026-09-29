import { applyPreset, withChange, type Mode, type Settings } from '@/src/core/settings';
import { MODES } from '@/src/theme';

export default function Form({
  settings,
  setSettings,
}: {
  settings: Settings;
  setSettings: (value: Settings) => Promise<void>;
}) {
  return (
    <form>
      <fieldset className="mt-6">
        <legend className="font-semibold">Mode</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(['lite', 'normal', 'ultra', 'custom'] as Mode[]).map((mode) => (
            <label key={mode} className="rounded border p-3">
              <input
                className="mr-2"
                type="radio"
                name="mode"
                value={mode}
                checked={settings.mode === mode}
                disabled={mode === 'custom' && settings.mode !== 'custom'}
                onChange={() =>
                  mode === 'custom'
                    ? undefined
                    : setSettings(applyPreset(settings, mode as Exclude<Mode, 'custom'>))
                }
              />
              <strong>
                {MODES[mode].name} ({mode})
              </strong>
              <span className="mt-1 block text-xs text-gray-500">{MODES[mode].blurb}</span>
              {mode === 'custom' && (
                <span className="mt-1 block text-xs text-gray-500">
                  Change any rule below to switch to Your Court.
                </span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="font-semibold">Rules</legend>
        <label className="mt-2 block">
          <input
            type="checkbox"
            checked={settings.dedupeOnOpen}
            onChange={(e) => setSettings(withChange(settings, { dedupeOnOpen: e.target.checked }))}
          />{' '}
          Reuse an open tab instead of opening the same URL again
        </label>
        <label className="mt-2 block">
          Duplicates
          <select
            className="ml-2"
            value={settings.duplicates}
            onChange={(e) =>
              setSettings(withChange(settings, { duplicates: e.target.value as Settings['duplicates'] }))
            }
          >
            <option value="off">Off</option>
            <option value="detect">Detect</option>
            <option value="auto">Auto-close</option>
          </select>
        </label>
        <label className="mt-2 block">
          Inactive
          <select
            className="ml-2"
            value={settings.inactive}
            onChange={(e) => {
              const value = e.target.value as Settings['inactive'];
              if (
                value !== 'close' ||
                window.confirm(
                  'Auto-close will close inactive tabs without asking (unsaved form data is lost). Enable?',
                )
              )
                setSettings(withChange(settings, { inactive: value }));
            }}
          >
            <option value="off">Off</option>
            <option value="detect">Detect</option>
            <option value="discard">Auto-discard</option>
            <option value="close">Auto-close</option>
          </select>
        </label>
        {settings.inactive === 'close' && (
          <label className="mt-2 block">
            Close after (minutes){' '}
            <input
              className="ml-2 w-20"
              type="number"
              min="120"
              value={settings.closeMinutes}
              onChange={(e) => setSettings(withChange(settings, { closeMinutes: Number(e.target.value) }))}
            />
          </label>
        )}
      </fieldset>

      <fieldset className="mt-6">
        <legend className="font-semibold">Inactive tabs</legend>
        <label className="mt-2 block">
          Inactive source
          <select
            className="ml-2"
            value={settings.inactiveSource}
            onChange={(e) =>
              setSettings(
                withChange(settings, { inactiveSource: e.target.value as Settings['inactiveSource'] }),
              )
            }
          >
            <option value="native">Chrome discarded it</option>
            <option value="timer">Idle timer</option>
            <option value="either">Either</option>
            <option value="both">Both</option>
          </select>
        </label>
        <label className="mt-2 block">
          Idle after (minutes){' '}
          <input
            className="ml-2 w-20"
            type="number"
            min="1"
            value={settings.inactiveMinutes}
            onChange={(e) => setSettings(withChange(settings, { inactiveMinutes: Number(e.target.value) }))}
          />
        </label>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="font-semibold">URL matching</legend>
        <label className="mt-2 block">
          <input
            type="checkbox"
            checked={settings.matching.ignoreHash}
            onChange={(e) =>
              setSettings(
                withChange(settings, { matching: { ...settings.matching, ignoreHash: e.target.checked } }),
              )
            }
          />{' '}
          Ignore #fragment
        </label>
        <label className="mt-2 block">
          <input
            type="checkbox"
            checked={settings.matching.ignoreTrailingSlash}
            onChange={(e) =>
              setSettings(
                withChange(settings, {
                  matching: { ...settings.matching, ignoreTrailingSlash: e.target.checked },
                }),
              )
            }
          />{' '}
          Ignore trailing slash
        </label>
        <label className="mt-2 block">
          <input
            type="checkbox"
            checked={settings.matching.stripTracking}
            onChange={(e) =>
              setSettings(
                withChange(settings, { matching: { ...settings.matching, stripTracking: e.target.checked } }),
              )
            }
          />{' '}
          Ignore tracking params (utm_*, fbclid, gclid…)
        </label>
        <label className="mt-2 block">
          <input
            type="checkbox"
            checked={settings.matching.ignoreQuery}
            onChange={(e) =>
              setSettings(
                withChange(settings, { matching: { ...settings.matching, ignoreQuery: e.target.checked } }),
              )
            }
          />{' '}
          Ignore all query params
        </label>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="font-semibold">Scope</legend>
        <label className="mt-2 block">
          Reuse tabs from:
          <select
            className="ml-2"
            value={settings.dedupeScope}
            onChange={(e) =>
              setSettings(withChange(settings, { dedupeScope: e.target.value as Settings['dedupeScope'] }))
            }
          >
            <option value="window">Current window</option>
            <option value="all">All windows</option>
          </select>
        </label>
        {settings.dedupeScope === 'all' && (
          <label className="mt-2 block">
            When the tab is in another window:
            <select
              className="ml-2"
              value={settings.crossWindow}
              onChange={(e) =>
                setSettings(withChange(settings, { crossWindow: e.target.value as Settings['crossWindow'] }))
              }
            >
              <option value="focus">Focus that window</option>
              <option value="move">Move tab here</option>
            </select>
          </label>
        )}
        <label className="mt-2 block">
          Detect duplicates across:
          <select
            className="ml-2"
            value={settings.detectScope}
            onChange={(e) =>
              setSettings(withChange(settings, { detectScope: e.target.value as Settings['detectScope'] }))
            }
          >
            <option value="all">All windows</option>
            <option value="window">Current window</option>
          </select>
        </label>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="font-semibold">Protected tabs (never auto-closed or discarded)</legend>
        <label className="mt-2 block">
          <input
            type="checkbox"
            checked={settings.protect.active}
            onChange={(e) =>
              setSettings(
                withChange(settings, { protect: { ...settings.protect, active: e.target.checked } }),
              )
            }
          />{' '}
          Active tab
        </label>
        <label className="mt-2 block">
          <input
            type="checkbox"
            checked={settings.protect.pinned}
            onChange={(e) =>
              setSettings(
                withChange(settings, { protect: { ...settings.protect, pinned: e.target.checked } }),
              )
            }
          />{' '}
          Pinned
        </label>
        <label className="mt-2 block">
          <input
            type="checkbox"
            checked={settings.protect.audible}
            onChange={(e) =>
              setSettings(
                withChange(settings, { protect: { ...settings.protect, audible: e.target.checked } }),
              )
            }
          />{' '}
          Playing audio
        </label>
        <label className="mt-2 block">
          <input
            type="checkbox"
            checked={settings.protect.grouped}
            onChange={(e) =>
              setSettings(
                withChange(settings, { protect: { ...settings.protect, grouped: e.target.checked } }),
              )
            }
          />{' '}
          In a tab group
        </label>
        <label className="mt-2 block">
          Used in the last (minutes){' '}
          <input
            className="ml-2 w-20"
            type="number"
            min="0"
            value={settings.protect.recentMinutes}
            onChange={(e) =>
              setSettings(
                withChange(settings, {
                  protect: { ...settings.protect, recentMinutes: Number(e.target.value) },
                }),
              )
            }
          />
        </label>
        <label className="mt-2 block">
          Domains (one per line)
          <textarea
            className="mt-1 block w-full border p-1"
            rows={4}
            value={settings.protect.domains.join('\n')}
            onChange={(e) =>
              setSettings(
                withChange(settings, {
                  protect: {
                    ...settings.protect,
                    domains: e.target.value
                      .split('\n')
                      .map((domain) => domain.trim())
                      .filter(Boolean),
                  },
                }),
              )
            }
          />
        </label>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="font-semibold">Auto-action safety</legend>
        <label className="mt-2 block">
          Wait before acting (seconds){' '}
          <input
            className="ml-2 w-20"
            type="number"
            min="0"
            value={settings.auto.graceSeconds}
            onChange={(e) =>
              setSettings(
                withChange(settings, { auto: { ...settings.auto, graceSeconds: Number(e.target.value) } }),
              )
            }
          />
        </label>
        <label className="mt-2 block">
          Max actions per scan{' '}
          <input
            className="ml-2 w-20"
            type="number"
            min="1"
            value={settings.auto.batchCap}
            onChange={(e) =>
              setSettings(
                withChange(settings, { auto: { ...settings.auto, batchCap: Number(e.target.value) } }),
              )
            }
          />
        </label>
        <label className="mt-2 block">
          Dry run for (hours) after enabling auto actions{' '}
          <input
            className="ml-2 w-20"
            type="number"
            min="0"
            value={settings.auto.dryRunHours}
            onChange={(e) =>
              setSettings(
                withChange(settings, { auto: { ...settings.auto, dryRunHours: Number(e.target.value) } }),
              )
            }
          />
        </label>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="font-semibold">Recently closed</legend>
        <label className="mt-2 block">
          Keep for (days){' '}
          <input
            className="ml-2 w-20"
            type="number"
            min="1"
            value={settings.bin.retentionDays}
            onChange={(e) =>
              setSettings(
                withChange(settings, { bin: { ...settings.bin, retentionDays: Number(e.target.value) } }),
              )
            }
          />
        </label>
        <label className="mt-2 block">
          Max entries{' '}
          <input
            className="ml-2 w-20"
            type="number"
            min="10"
            value={settings.bin.maxEntries}
            onChange={(e) =>
              setSettings(
                withChange(settings, { bin: { ...settings.bin, maxEntries: Number(e.target.value) } }),
              )
            }
          />
        </label>
      </fieldset>

      <footer className="mt-6 border-t pt-4">
        Keyboard shortcut: Alt+Shift+P pauses for 15 min ·{' '}
        <button type="button" onClick={() => browser.tabs.create({ url: 'chrome://extensions/shortcuts' })}>
          Change shortcuts
        </button>
      </footer>
    </form>
  );
}
