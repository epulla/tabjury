import { describe, it, expect } from 'vitest';
import { isBlankUrl, normalizeUrl } from '../src/core/url';
import type { Matching } from '../src/core/settings';

const base: Matching = {
  ignoreHash: false,
  ignoreTrailingSlash: false,
  stripTracking: false,
  ignoreQuery: false,
};
describe('normalizeUrl', () => {
  it.each([
    ['HTTP://EXAMPLE.COM:80/a#x', { ignoreHash: true }, 'http://example.com/a'],
    ['https://example.com/a?b=2&a=1', {}, 'https://example.com/a?a=1&b=2'],
    ['https://example.com/a?utm_source=x&ok=1', { stripTracking: true }, 'https://example.com/a?ok=1'],
    ['https://example.com/a/', { ignoreTrailingSlash: true }, 'https://example.com/a'],
    ['https://example.com:443/', {}, 'https://example.com/'],
    ['chrome://tabs/', {}, null],
    ['not a url', {}, null],
  ])('normalizes %s', (input, override, expected) =>
    expect(normalizeUrl(input, { ...base, ...override })).toBe(expected),
  );
  it('removes query when requested', () =>
    expect(normalizeUrl('https://x.test/a?x=1', { ...base, ignoreQuery: true })).toBe('https://x.test/a'));
});

describe('isBlankUrl', () => {
  it.each([
    ['', true],
    [undefined, true],
    ['about:blank', true],
    ['about:newtab', true],
    ['about:home', true],
    ['chrome://newtab/', true],
    ['chrome://new-tab-page/foo', true],
    ['edge://newtab/foo', true],
    ['https://example.com', false],
    ['chrome://tabs/', false],
  ])('%s is blank: %s', (url, expected) => expect(isBlankUrl(url)).toBe(expected));
});
