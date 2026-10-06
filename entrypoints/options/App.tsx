import { settingsItem } from '@/src/bg/state';
import { accentFor, MODES } from '@/src/theme';
import { useItem } from '@/src/ui/useItem';
import type { CSSProperties } from 'react';
import Courtroom from '@/src/ui/Courtroom';
import Form from './Form';

export default function App() {
  const [settings, setSettings] = useItem(settingsItem);
  return (
    <div className="app-bg relative isolate min-h-screen" style={{ '--accent': accentFor(settings) } as CSSProperties}>
      <Courtroom />
      <header className="bench">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold"><span aria-hidden="true">⚖️</span>{' '}TabJury</h1>
            <p className="text-sm opacity-80">Choose how TabJury handles duplicate and inactive tabs.</p>
          </div>
          <span key={settings.mode} className="mode-badge text-sm">
            <span className="mode-badge-emoji" aria-hidden="true">{MODES[settings.mode].emoji}</span>
            <span className="mode-badge-text">{MODES[settings.mode].name}</span>
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 pb-6 text-sm">
        <Form settings={settings} setSettings={setSettings} />
      </main>
    </div>
  );
}
