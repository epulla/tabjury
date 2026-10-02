import { describe, expect, it } from 'vitest';
import { formatMinutes, timeAgo } from '../src/ui/time';

describe('timeAgo', () => {
  it.each([
    [0, 'just now'],
    [5, '5 min ago'],
    [229, '3 h ago'],
    [2 * 24 * 60, '2 d ago'],
  ])('%s minutes ago', (minutes, expected) => {
    const now = 1_700_000_000_000;
    expect(timeAgo(now - minutes * 60_000, now)).toBe(expected);
  });
});

describe('formatMinutes', () => {
  it.each([
    [45, '45 min'],
    [120, '2 h'],
    [90, '1 h 30 min'],
    [1440, '1 d'],
    [1560, '1 d 2 h'],
  ])('%s minutes', (minutes, expected) => expect(formatMinutes(minutes)).toBe(expected));
});
