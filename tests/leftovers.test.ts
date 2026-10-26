import { describe, expect, it } from 'vitest';
import { findLeftovers } from '../src/core/leftovers';
import { DEFAULTS } from '../src/core/settings';

describe('findLeftovers', () => {
  it.each([
    ['https://zoom.us/j/123#success', 'Zoom'],
    ['https://zoom.us/j/123', undefined],
    ['https://zoom.us/wc/123#success', undefined],
    ['https://abcom/x', undefined, ['a.com/*']],
  ])('matches launcher URL %s', (url, app, extra = []) => {
    const settings = { ...DEFAULTS, leftovers: { ...DEFAULTS.leftovers, extra } };
    const result = findLeftovers([{ id: 1, url, lastAccessed: 1 } as never], settings, 40_000);
    expect(result[0]?.app).toBe(app);
  });
  it('matches extra globs and skips recently accessed tabs', () => {
    const settings = { ...DEFAULTS, leftovers: { ...DEFAULTS.leftovers, extra: ['*.zoom.us/j/*'] } };
    expect(findLeftovers([{ url: 'https://foo.zoom.us/j/1', lastAccessed: 1 } as never], settings, 40_000)[0]?.app).toBe('Custom');
    expect(findLeftovers([{ url: 'https://foo.zoom.us/j/1', lastAccessed: 20_000 } as never], settings, 40_000)).toEqual([]);
  });
});
