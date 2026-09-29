export type Alibi = 'paused' | 'clone' | 'two-strikes';

export function findAlibi(ctx: {
  now: number;
  recentlyDeduped: Record<string, number>;
  key: string;
  paused: boolean;
  createdUrl: string | undefined;
}): Alibi | null {
  if (ctx.paused) return 'paused';
  if (ctx.createdUrl) return 'clone';
  const deduped = ctx.recentlyDeduped[ctx.key];
  if (deduped && ctx.now - deduped < 15_000) return 'two-strikes';
  return null;
}
