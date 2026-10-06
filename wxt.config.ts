import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({ plugins: [tailwindcss()] }),
  manifest: {
    name: 'TabJury',
    description: 'Every tab gets a fair trial. Reuses open tabs, flags duplicates and inactive tabs, recycles them.',
    permissions: ['tabs', 'storage', 'alarms', 'sessions', 'favicon'],
    options_ui: { open_in_tab: true },
    commands: {
      'pause-toggle': {
        suggested_key: { default: 'Alt+Shift+P' },
        description: 'Start or end a recess (TabJury)',
      },
    },
  },
});
