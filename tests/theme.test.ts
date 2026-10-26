import { describe, expect, it } from 'vitest';
import { PRESETS } from '../src/core/settings';
import { autoCleanLabel, modeDetails } from '../src/theme';

describe('theme', () => {
  it.each([
    [PRESETS.normal, ['Same link again: reuses the open tab', 'Duplicates: flagged', 'Inactive tabs: put to sleep', 'Tabs left behind by apps: flagged']],
    [PRESETS.ultra, ['Same link again: reuses the open tab', 'Duplicates: auto-closed', 'Inactive tabs: closed', 'Tabs left behind by apps: closed']],
  ])('describes mode settings', (settings, expected) => expect(modeDetails(settings)).toEqual(expected));
  it('describes automatic cleanup', () =>
    expect(autoCleanLabel(PRESETS.ultra)).toBe('Automatically close duplicate tabs, close inactive tabs and close tabs left behind by apps'));
});
