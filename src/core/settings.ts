export type Mode = 'lite' | 'normal' | 'ultra' | 'custom';
export type DupLevel = 'off' | 'detect' | 'auto';
export type InactiveLevel = 'off' | 'detect' | 'discard' | 'close';
export type InactiveSource = 'native' | 'timer' | 'either' | 'both';
export type Matching = {
  ignoreHash: boolean;
  ignoreTrailingSlash: boolean;
  stripTracking: boolean;
  ignoreQuery: boolean;
};
export type Settings = {
  mode: Mode;
  customColor: string;
  dedupeOnOpen: boolean;
  duplicates: DupLevel;
  inactive: InactiveLevel;
  inactiveSource: InactiveSource;
  inactiveMinutes: number;
  closeMinutes: number;
  matching: Matching;
  dedupeScope: 'window' | 'all';
  crossWindow: 'focus' | 'move';
  detectScope: 'window' | 'all';
  autoClean: boolean;
  protect: {
    active: boolean;
    pinned: boolean;
    audible: boolean;
    grouped: boolean;
    recentMinutes: number;
    domains: string[];
  };
  auto: { graceSeconds: number; batchCap: number };
  bin: { retentionDays: number; maxEntries: number };
};

export const PRESETS: Record<
  Exclude<Mode, 'custom'>,
  Pick<Settings, 'dedupeOnOpen' | 'duplicates' | 'inactive' | 'autoClean'>
> = {
  lite: { dedupeOnOpen: true, duplicates: 'detect', inactive: 'off', autoClean: false },
  normal: { dedupeOnOpen: true, duplicates: 'detect', inactive: 'discard', autoClean: true },
  ultra: { dedupeOnOpen: true, duplicates: 'auto', inactive: 'close', autoClean: true },
};

export const DEFAULTS: Settings = {
  mode: 'normal',
  customColor: 'gray',
  ...PRESETS.normal,
  inactiveSource: 'either',
  inactiveMinutes: 60,
  closeMinutes: 120,
  matching: { ignoreHash: false, ignoreTrailingSlash: true, stripTracking: true, ignoreQuery: false },
  dedupeScope: 'window',
  crossWindow: 'focus',
  detectScope: 'all',
  protect: { active: true, pinned: true, audible: true, grouped: true, recentMinutes: 5, domains: [] },
  auto: { graceSeconds: 60, batchCap: 5 },
  bin: { retentionDays: 14, maxEntries: 500 },
};

export function applyPreset(s: Settings, mode: Exclude<Mode, 'custom'>): Settings {
  return { ...s, mode, ...PRESETS[mode] };
}

export function withChange(s: Settings, patch: Partial<Settings>): Settings {
  const result = { ...s, ...patch } as Settings;
  for (const key of ['matching', 'protect', 'auto', 'bin'] as const)
    if (patch[key]) result[key] = { ...s[key], ...patch[key] } as never;
  if (result.inactive === 'close') result.closeMinutes = Math.max(5, result.closeMinutes);
  const preset = (Object.keys(PRESETS) as Array<Exclude<Mode, 'custom'>>).find(
    (mode) =>
      PRESETS[mode].dedupeOnOpen === result.dedupeOnOpen &&
      PRESETS[mode].duplicates === result.duplicates &&
      PRESETS[mode].inactive === result.inactive,
  );
  if (Object.keys(patch).some((key) => ['dedupeOnOpen', 'duplicates', 'inactive'].includes(key))) {
    result.mode = preset ? (patch.mode ?? (s.mode === 'custom' ? 'custom' : preset)) : 'custom';
    if (result.mode === 'custom' && s.mode !== 'custom') result.autoClean = false;
  }
  return result;
}

const choices: Record<string, readonly string[]> = {
  mode: ['lite', 'normal', 'ultra', 'custom'],
  customColor: ['gray', 'slate', 'orange', 'rose', 'amber', 'teal', 'indigo', 'pink'],
  duplicates: ['off', 'detect', 'auto'],
  inactive: ['off', 'detect', 'discard', 'close'],
  inactiveSource: ['native', 'timer', 'either', 'both'],
  dedupeScope: ['window', 'all'],
  crossWindow: ['focus', 'move'],
  detectScope: ['window', 'all'],
};

export function migrate(raw: unknown): Settings {
  const input = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const out = {} as Settings;
  for (const key of Object.keys(DEFAULTS) as Array<keyof Settings>) {
    const fallback = DEFAULTS[key],
      value = input[key];
    if (fallback && typeof fallback === 'object' && !Array.isArray(fallback)) {
      const source =
        value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
      const nested = { ...fallback } as Record<string, unknown>;
      for (const child of Object.keys(fallback)) {
        const candidate = source[child],
          base = (fallback as Record<string, unknown>)[child];
        nested[child] = Array.isArray(base)
          ? Array.isArray(candidate)
            ? candidate
            : base
          : typeof candidate === typeof base &&
              (!choices[child] || choices[child].includes(candidate as string))
            ? candidate
            : base;
      }
      (out as Record<string, unknown>)[key] = nested;
    } else
      (out as Record<string, unknown>)[key] =
        typeof value === typeof fallback && (!choices[key] || choices[key].includes(value as string))
          ? value
          : fallback;
  }
  if (out.mode !== 'custom')
    Object.assign(out, {
      dedupeOnOpen: PRESETS[out.mode].dedupeOnOpen,
      duplicates: PRESETS[out.mode].duplicates,
      inactive: PRESETS[out.mode].inactive,
    });
  return out;
}
