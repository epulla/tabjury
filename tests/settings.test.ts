import { describe, it, expect } from 'vitest';
import { DEFAULTS, PRESETS, applyPreset, migrate, withChange } from '../src/core/settings';

describe('settings', () => {
  it.each(Object.keys(PRESETS) as Array<'lite' | 'normal' | 'ultra'>)('applies %s', (mode) => {
    expect(applyPreset(DEFAULTS, mode)).toMatchObject({ mode, ...PRESETS[mode] });
  });
  it.each([
    [DEFAULTS, { duplicates: 'auto' }, 'custom'],
    [DEFAULTS, { inactive: 'discard' }, 'normal'],
    [DEFAULTS, { mode: 'lite', duplicates: 'detect', inactive: 'off' }, 'lite'],
    [applyPreset(DEFAULTS, 'lite'), { inactive: 'discard' }, 'normal'],
  ])('changes preset state', (settings, patch, mode) =>
    expect(withChange(settings, patch as never).mode).toBe(mode),
  );
  it('clamps close duration', () => {
    expect(withChange(DEFAULTS, { inactive: 'close', closeMinutes: 1 }).closeMinutes).toBe(5);
    expect(withChange(DEFAULTS, { inactive: 'close', closeMinutes: 2 }).closeMinutes).toBe(5);
    expect(withChange(DEFAULTS, { inactive: 'close', closeMinutes: 5 }).closeMinutes).toBe(5);
  });
  it('turns auto-clean off when ultra becomes custom', () =>
    expect(withChange(applyPreset(DEFAULTS, 'ultra'), { inactive: 'close', duplicates: 'detect' })).toMatchObject({
      mode: 'custom',
      autoClean: false,
    }));
  it('keeps ultra mode when auto-clean changes', () =>
    expect(withChange(applyPreset(DEFAULTS, 'ultra'), { autoClean: false })).toMatchObject({
      mode: 'ultra',
      autoClean: false,
    }));
  it.each([
    undefined,
    { mode: 'bogus', customColor: 'neon', inactiveMinutes: 'x', protect: { domains: 'no' }, extra: 1 },
  ])('migrates garbage', (raw) => {
    const result = migrate(raw);
    expect(result).toEqual(DEFAULTS);
    expect(result).not.toHaveProperty('extra');
  });
  it('updates stored ultra rules without changing auto-clean', () => {
    const result = migrate({ ...DEFAULTS, mode: 'ultra', inactive: 'discard', autoClean: false });
    expect(result).toMatchObject({ mode: 'ultra', inactive: 'close', autoClean: false });
  });
});
