import type { Mode, Settings } from './core/settings';

export const MODES: Record<Mode, { name: string; blurb: string; color: string; emoji: string }> = {
  lite: {
    name: 'Claims Court',
    blurb: 'Reuses an open tab instead of opening the same link twice, and flags duplicate tabs.',
    color: '#06b6d4',
    emoji: '📝',
  },
  normal: {
    name: 'Trial Court',
    blurb: "Everything in Claims Court, plus puts tabs you haven't used in a while to sleep. Nothing is closed.",
    color: '#16a34a',
    emoji: '🧑‍⚖️',
  },
  ultra: {
    name: 'Supreme Court',
    blurb: 'Reuses open tabs, auto-closes duplicates, and closes tabs left idle too long.',
    color: '#7c3aed',
    emoji: '🏛️',
  },
  custom: {
    name: 'Your Court',
    blurb: 'Your court, your rules. Open Settings to choose them.',
    color: '#6b7280',
    emoji: '🛠️',
  },
};

export const modeDetails = (s: Pick<Settings, 'dedupeOnOpen' | 'duplicates' | 'inactive'>) => [
  `Same link again: ${s.dedupeOnOpen ? 'reuses the open tab' : 'opens a new tab'}`,
  `Duplicates: ${{ off: 'ignored', detect: 'flagged', auto: 'auto-closed' }[s.duplicates]}`,
  `Inactive tabs: ${{ off: 'ignored', detect: 'flagged', discard: 'put to sleep', close: 'closed' }[s.inactive]}`,
];

export const autoCleanLabel = (s: Pick<Settings, 'duplicates' | 'inactive'>) => {
  const actions = [
    s.duplicates === 'auto' && 'close duplicate tabs',
    s.inactive === 'discard' && 'put inactive tabs to sleep',
    s.inactive === 'close' && 'close inactive tabs',
  ].filter(Boolean);
  return actions.length ? `Automatically ${actions.join(' and ')}` : 'Automatically clean up tabs';
};

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
