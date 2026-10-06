import { settingsItem } from '@/src/bg/state';
import { accentFor, MODES } from '@/src/theme';
import { useItem } from '@/src/ui/useItem';
import type { CSSProperties } from 'react';
import Courtroom from '@/src/ui/Courtroom';
import Form from './Form';

export default function App() {
  const [settings, setSettings] = useItem(settingsItem);
  return (
    <div className="app-bg relative min-h-screen" style={{ '--accent': accentFor(settings) } as CSSProperties}>
      <Courtroom />
      <main className="relative z-10 mx-auto max-w-2xl p-6 text-sm">
        <header>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[var(--accent)]"><span aria-hidden="true">⚖️</span>{' '}TabJury</h1>
            <span
              key={settings.mode}
              className="mode-badge rounded-full bg-[color-mix(in_srgb,var(--accent)_15%,white)] px-2.5 py-1 text-sm font-semibold text-[var(--accent)]"
            >
              <span className="mode-badge-emoji" aria-hidden="true">{MODES[settings.mode].emoji}</span>
              <span className="mode-badge-text">{MODES[settings.mode].name}</span>
            </span>
          </div>
          <p className="text-gray-500">Choose how TabJury handles duplicate and inactive tabs.</p>
        </header>
        <Form settings={settings} setSettings={setSettings} />
      </main>
    </div>
  );
}
