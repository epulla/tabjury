import type { Matching } from './settings';

export function isBlankUrl(url: string | undefined): boolean {
  return (
    url === undefined ||
    url === '' ||
    url === 'about:blank' ||
    url === 'about:newtab' ||
    url === 'about:home' ||
    url.startsWith('chrome://newtab') ||
    url.startsWith('chrome://new-tab-page') ||
    url.startsWith('edge://newtab')
  );
}

/** Turns a typed entry like `https://www.Mail.google.com/u/0` into `mail.google.com`; '' if unusable. */
export function toDomain(input: string): string {
  const text = input.trim();
  if (!text) return '';
  try {
    const host = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(text) ? text : `https://${text}`).hostname;
    return host.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  } catch {
    return '';
  }
}

export function onProtectedDomain(hostname: string, domains: string[]): boolean {
  const host = hostname.toLowerCase();
  return domains.some((entry) => {
    const domain = toDomain(entry);
    return domain !== '' && (host === domain || host.endsWith(`.${domain}`));
  });
}

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
