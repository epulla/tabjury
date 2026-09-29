import { describe, expect, it } from 'vitest';
import { findAlibi, type Alibi } from '../src/core/alibi';
const ctx = (overrides: Partial<Parameters<typeof findAlibi>[0]> = {}) => ({
  now: 100_000,
  recentlyDeduped: {},
  key: 'k',
  paused: false,
  createdUrl: undefined,
  ...overrides,
});

describe('alibi', () => {
  it.each<[Alibi | null, Parameters<typeof findAlibi>[0]]>([
    ['paused', ctx({ paused: true })],
    ['clone', ctx({ createdUrl: 'https://a.com/x' })],
    ['two-strikes', ctx({ recentlyDeduped: { k: 90_001 } })],
    [null, ctx({ now: 200_000 })],
  ])('returns %s in order', (expected, context) => expect(findAlibi(context)).toBe(expected));
});
