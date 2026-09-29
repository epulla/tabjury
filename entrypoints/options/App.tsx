import { settingsItem } from '@/src/bg/state';
import { useItem } from '@/src/ui/useItem';
import Form from './Form';

export default function App() {
  const [settings, setSettings] = useItem(settingsItem);
  return (
    <main className="mx-auto max-w-2xl p-6 text-sm">
      <header>
        <h1 className="text-xl font-semibold">TabJury</h1>
        <p className="text-gray-500">Choose how TabJury handles duplicate and inactive tabs.</p>
      </header>
      <Form settings={settings} setSettings={setSettings} />
    </main>
  );
}
