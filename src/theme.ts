import type { Mode, Settings } from './core/settings';

export const MODES: Record<Mode, { name: string; blurb: string; color: string }> = {
  lite: {
    name: 'Small Claims',
    blurb: 'Reuses an open tab instead of opening the same link twice.',
    color: '#06b6d4',
  },
  normal: {
    name: 'Trial Court',
    blurb: 'Reuses open tabs and flags duplicate and inactive tabs for you to review.',
    color: '#16a34a',
  },
  ultra: {
    name: 'Supreme Court',
    blurb: 'Reuses open tabs, auto-closes duplicates, and discards inactive tabs.',
    color: '#7c3aed',
  },
  custom: { name: 'Your Court', blurb: 'Your own mix of rules, set in Settings.', color: '#6b7280' },
};

export const modeDetails = (s: Pick<Settings, 'dedupeOnOpen' | 'duplicates' | 'inactive'>) => [
  `Same link again: ${s.dedupeOnOpen ? 'reuses the open tab' : 'opens a new tab'}`,
  `Duplicates: ${{ off: 'ignored', detect: 'flagged', auto: 'auto-closed' }[s.duplicates]}`,
  `Inactive tabs: ${{ off: 'ignored', detect: 'flagged', discard: 'discarded', close: 'closed' }[s.inactive]}`,
];

export const SWATCHES: Record<string, string> = {
  gray: '#6b7280',
  slate: '#475569',
  orange: '#ea580c',
  rose: '#e11d48',
  amber: '#d97706',
  teal: '#0d9488',
  indigo: '#4f46e5',
  pink: '#db2777',
};

export const accentFor = (s: Settings) =>
  s.mode === 'custom' ? (SWATCHES[s.customColor] ?? SWATCHES.gray) : MODES[s.mode].color;

export const COPY = {
  docketClear: 'Docket clear. Court adjourned.',
  binEmpty: 'No appeals pending.',
  paused: 'Court in recess',
};
