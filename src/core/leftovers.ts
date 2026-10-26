import type { Tab } from './classify';
import type { Settings } from './settings';

const rules: Array<[string, RegExp]> = [
  ['Zoom', /^https:\/\/([a-z0-9-]+\.)?zoom(gov)?\.us\/[jsw]\/[^/?#]+[^#]*#success$/i],
  ['Slack', /^https:\/\/([a-z0-9-]+\.)?(enterprise\.)?slack\.com\/(archives\/|app_redirect\b|ssb\/(signin_)?redirect)/i],
  ['Microsoft Teams', /^https:\/\/teams\.(microsoft\.com|live\.com|cloud\.microsoft)\/dl\/launcher\/launcher\.html\?/i],
  ['Notion', /^https:\/\/(www\.notion\.so|app\.notion\.com)\/native\/.*[?&]deepLinkOpenNewTab=true/i],
  ['Linear', /^https:\/\/linear\.app\/[^/]+\/.*[?&]noRedirect=1(&|#|$)/i],
  ['Discord', /^https:\/\/(discord(app)?\.com\/invite|discord\.gg)\/[a-z0-9-]+\/?(\?.*)?$/i],
];
const linearExcluded = /^https:\/\/linear\.app\/[^/]+\/(settings|integrations)\b/i;

export function findLeftovers(tabs: Tab[], s: Settings, now: number): { tab: Tab; app: string }[] {
  if (s.leftovers.level === 'off') return [];
  return tabs.flatMap((tab) => {
    if (tab.lastAccessed === undefined || now - tab.lastAccessed < s.leftovers.seconds * 1000) return [];
    const url = tab.url ?? tab.pendingUrl ?? '';
    const builtIn = rules.find(([name, regex]) => regex.test(url) && !(name === 'Linear' && linearExcluded.test(url)));
    let app = builtIn?.[0];
    if (!app) {
      try {
        const parsed = new URL(url), target = `${parsed.host}${parsed.pathname}`;
        if (s.leftovers.extra.some((glob) => new RegExp(`^${glob.replace(/[.+?^${}()|[\\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`, 'i').test(target))) app = 'Custom';
      } catch { /* Invalid URL cannot match a host/path glob. */ }
    }
    return app ? [{ tab, app }] : [];
  });
}
