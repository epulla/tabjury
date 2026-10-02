import { describe, expect, it } from 'vitest';
import { PRESETS } from '../src/core/settings';
import { modeDetails } from '../src/theme';

describe('theme', () => {
  it.each([
    [PRESETS.normal, ['Same link again: reuses the open tab', 'Duplicates: flagged', 'Inactive tabs: flagged']],
    [PRESETS.ultra, ['Same link again: reuses the open tab', 'Duplicates: auto-closed', 'Inactive tabs: closed']],
  ])('describes mode settings', (settings, expected) => expect(modeDetails(settings)).toEqual(expected));
});
