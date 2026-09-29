import type { Matching } from './settings';

export function normalizeUrl(url: string, m: Matching): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!['http:', 'https:', 'file:'].includes(parsed.protocol)) return null;
  parsed.hostname = parsed.hostname.toLowerCase();
  if (m.ignoreHash) parsed.hash = '';
  if (m.ignoreTrailingSlash && parsed.pathname.length > 1)
    parsed.pathname = parsed.pathname.replace(/\/$/, '');
  if (m.ignoreQuery) parsed.search = '';
  else {
    const params = [...parsed.searchParams].filter(
      ([key]) =>
        !m.stripTracking ||
        !/^(utm_\w+|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|igshid|_ga|yclid|ref_src)$/i.test(key),
    );
    parsed.search = '';
    for (const [key, value] of params) parsed.searchParams.append(key, value);
    parsed.searchParams.sort();
  }
  return parsed.toString();
}
