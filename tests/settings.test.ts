import { describe, it, expect } from 'vitest';
import { DEFAULTS, PRESETS, applyPreset, migrate, withChange } from '../src/core/settings';

describe('settings', () => {
  it.each(Object.keys(PRESETS) as Array<'lite' | 'normal' | 'ultra'>)('applies %s', (mode) => {
    expect(applyPreset(DEFAULTS, mode)).toMatchObject({ mode, ...PRESETS[mode] });
  });
  it.each([
    [{ duplicates: 'auto' }, 'custom'],
    [{ inactive: 'detect' }, 'normal'],
    [{ mode: 'lite', duplicates: 'off', inactive: 'off' }, 'lite'],
  ])('changes preset state', (patch, mode) => expect(withChange(DEFAULTS, patch as never).mode).toBe(mode));
  it('clamps close duration', () =>
    expect(withChange(DEFAULTS, { inactive: 'close', closeMinutes: 1 }).closeMinutes).toBe(120));
  it.each([undefined, { mode: 'bogus', inactiveMinutes: 'x', protect: { domains: 'no' }, extra: 1 }])(
    'migrates garbage',
    (raw) => {
      const result = migrate(raw);
      expect(result).toEqual(DEFAULTS);
      expect(result).not.toHaveProperty('extra');
    },
  );
});
