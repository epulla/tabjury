import type { Mode } from './core/settings';

export const MODES: Record<Mode, { name: string; blurb: string }> = {
  lite: { name: 'Small Claims', blurb: 'Reuses an already-open tab instead of opening it twice.' },
  normal: { name: 'Trial Court', blurb: 'Also flags duplicate and inactive tabs so you can close them.' },
  ultra: { name: 'Supreme Court', blurb: 'Auto-closes duplicates and discards inactive tabs.' },
  custom: { name: 'Your Court', blurb: 'Your own mix of rules.' },
};

export const COPY = {
  docketClear: 'Docket clear. Court adjourned.',
  binEmpty: 'No appeals pending.',
  paused: 'Court in recess',
};
